package com.github.kokorinilya.springbackend.repo

import com.github.jasync.sql.db.QueryResult
import com.github.jasync.sql.db.ResultSet
import com.github.jasync.sql.db.RowData
import com.github.jasync.sql.db.SuspendingConnection
import com.github.kokorinilya.springbackend.config.ChatRepoConfig
import com.github.kokorinilya.springbackend.database.ConnectionProvider
import com.github.kokorinilya.springbackend.exception.MaxNumberOfRetriesExceededException
import com.github.kokorinilya.springbackend.model.ExistingChatConnection
import com.github.kokorinilya.springbackend.model.NewChatConnection
import com.github.kokorinilya.springbackend.utils.UUIDGenerator
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.mockito.Mockito.*

class ChatRepoUnitTest {
    private val connectToExistingChatQuery = """
WITH SingleParticipantChats AS (
    SELECT chat_id, participant_a
    FROM Chats
    WHERE participant_b IS NULL
    LIMIT 1 FOR UPDATE SKIP LOCKED
)
UPDATE Chats
SET participant_b = ?::UUID
FROM SingleParticipantChats
WHERE SingleParticipantChats.chat_id = Chats.chat_id
RETURNING Chats.chat_id::TEXT, Chats.participant_a::TEXT;
        """.trimIndent()


    private val createNewChatQuery = """
INSERT INTO Chats (chat_id, participant_a)
VALUES (?::UUID, ?::UUID);
        """.trimIndent()

    @Test
    fun testConnectToExistingChat() = runBlocking {
        val mockedConnectionProvider = mock(ConnectionProvider::class.java)
        val mockedConnection = mock(SuspendingConnection::class.java)
        val mockedResultSet = mock(ResultSet::class.java)
        val mockedRow = mock(RowData::class.java)
        val mockedUUIDGenerator = mock(UUIDGenerator::class.java)

        `when`(mockedConnectionProvider.getConnection())
                .thenReturn(mockedConnection)

        `when`(mockedUUIDGenerator.genUUID())
                .thenReturn("new_uuid")

        `when`(mockedConnection.sendPreparedStatement(connectToExistingChatQuery, listOf("new_uuid")))
                .thenReturn(QueryResult(rowsAffected = 1, statusMessage = "OK", rows = mockedResultSet))

        `when`(mockedResultSet.size)
                .thenReturn(1)

        `when`(mockedResultSet[0])
                .thenReturn(mockedRow)

        `when`(mockedRow.getString("chat_id"))
                .thenReturn("chat#42")

        `when`(mockedRow.getString("participant_a"))
                .thenReturn("user#24")

        val repoConfig = object : ChatRepoConfig {
            override val maxRetries: Int = 1
        }
        val repo = ChatRepoImpl(
                connectionProvider = mockedConnectionProvider,
                config = repoConfig,
                uuidGenerator = mockedUUIDGenerator
        )
        val result = repo.connect()
        assertEquals(
                ExistingChatConnection(existingChatId = "chat#42", partnerId = "user#24", userId = "new_uuid"),
                result
        )

        verify(mockedConnectionProvider, times(1))
                .getConnection()
        verify(mockedConnection, times(1))
                .sendPreparedStatement(connectToExistingChatQuery, listOf("new_uuid"))
        verify(mockedUUIDGenerator, times(1))
                .genUUID()
        verify(mockedResultSet, atLeastOnce()).size
        verify(mockedResultSet, atLeastOnce())[0]
        verify(mockedRow, times(1)).getString("chat_id")
        verify(mockedRow, times(1)).getString("participant_a")
        verifyNoMoreInteractions(
                mockedConnectionProvider,
                mockedConnection,
                mockedResultSet,
                mockedUUIDGenerator,
                mockedRow
        )
    }

    @Test
    fun testCreateNewChat() = runBlocking {
        val mockedConnectionProvider = mock(ConnectionProvider::class.java)
        val mockedConnection = mock(SuspendingConnection::class.java)
        val mockedConnectResultSet = mock(ResultSet::class.java)
        val mockedCreateResultSet = mock(ResultSet::class.java)
        val mockedUUIDGenerator = mock(UUIDGenerator::class.java)

        `when`(mockedConnectionProvider.getConnection())
                .thenReturn(mockedConnection)

        `when`(mockedUUIDGenerator.genUUID())
                .thenReturn("new_uuid")
                .thenReturn("new_chat_id")

        `when`(mockedConnection.sendPreparedStatement(connectToExistingChatQuery, listOf("new_uuid")))
                .thenReturn(QueryResult(rowsAffected = 1, statusMessage = "OK", rows = mockedConnectResultSet))

        `when`(mockedConnection.sendPreparedStatement(createNewChatQuery, listOf("new_chat_id", "new_uuid")))
                .thenReturn(QueryResult(rowsAffected = 1, statusMessage = "OK", rows = mockedCreateResultSet))

        `when`(mockedConnectResultSet.size)
                .thenReturn(0)

        val repoConfig = object : ChatRepoConfig {
            override val maxRetries: Int = 1
        }
        val repo = ChatRepoImpl(
                connectionProvider = mockedConnectionProvider,
                config = repoConfig,
                uuidGenerator = mockedUUIDGenerator
        )
        val result = repo.connect()
        assertEquals(
                NewChatConnection(newChatId = "new_chat_id", userId = "new_uuid"),
                result
        )

        verify(mockedConnectionProvider, times(1))
                .getConnection()
        verify(mockedConnection, times(1))
                .sendPreparedStatement(connectToExistingChatQuery, listOf("new_uuid"))
        verify(mockedConnection, times(1))
                .sendPreparedStatement(createNewChatQuery, listOf("new_chat_id", "new_uuid"))
        verify(mockedUUIDGenerator, times(2))
                .genUUID()
        verify(mockedConnectResultSet, atLeastOnce()).size
        verifyNoMoreInteractions(
                mockedConnectionProvider,
                mockedConnection,
                mockedConnectResultSet,
                mockedUUIDGenerator,
                mockedCreateResultSet
        )
    }

    @Test
    fun testUnsuccessfulCreateNewChat() = runBlocking {
        val mockedConnectionProvider = mock(ConnectionProvider::class.java)
        val mockedConnection = mock(SuspendingConnection::class.java)
        val mockedConnectResultSet = mock(ResultSet::class.java)
        val mockedCreateResultSet = mock(ResultSet::class.java)
        val mockedUUIDGenerator = mock(UUIDGenerator::class.java)

        `when`(mockedConnectionProvider.getConnection())
                .thenReturn(mockedConnection)

        `when`(mockedUUIDGenerator.genUUID())
                .thenReturn("new_uuid")
                .thenReturn("new_chat_id")

        `when`(mockedConnection.sendPreparedStatement(connectToExistingChatQuery, listOf("new_uuid")))
                .thenReturn(QueryResult(rowsAffected = 1, statusMessage = "OK", rows = mockedConnectResultSet))

        `when`(mockedConnection.sendPreparedStatement(createNewChatQuery, listOf("new_chat_id", "new_uuid")))
                .thenReturn(QueryResult(rowsAffected = 0, statusMessage = "OK", rows = mockedCreateResultSet))

        `when`(mockedConnectResultSet.size)
                .thenReturn(0)

        val repoConfig = object : ChatRepoConfig {
            override val maxRetries: Int = 1
        }
        val repo = ChatRepoImpl(
                connectionProvider = mockedConnectionProvider,
                config = repoConfig,
                uuidGenerator = mockedUUIDGenerator
        )

        var failed = false
        try {
            repo.connect()
        } catch (e: MaxNumberOfRetriesExceededException) {
            failed = true
        }
        assertTrue(failed)

        verify(mockedConnectionProvider, times(1))
                .getConnection()
        verify(mockedConnection, times(1))
                .sendPreparedStatement(connectToExistingChatQuery, listOf("new_uuid"))
        verify(mockedConnection, times(1))
                .sendPreparedStatement(createNewChatQuery, listOf("new_chat_id", "new_uuid"))
        verify(mockedUUIDGenerator, times(2))
                .genUUID()
        verify(mockedConnectResultSet, atLeastOnce()).size
        verifyNoMoreInteractions(
                mockedConnectionProvider,
                mockedConnection,
                mockedConnectResultSet,
                mockedUUIDGenerator,
                mockedCreateResultSet
        )
    }

    @Test
    fun testCreateNewChatAfterMultipleRetries() = runBlocking {
        val mockedConnectionProvider = mock(ConnectionProvider::class.java)
        val mockedConnection = mock(SuspendingConnection::class.java)
        val mockedConnectResultSet = mock(ResultSet::class.java)
        val mockedCreateResultSet = mock(ResultSet::class.java)
        val mockedUUIDGenerator = mock(UUIDGenerator::class.java)

        `when`(mockedConnectionProvider.getConnection())
                .thenReturn(mockedConnection)

        `when`(mockedUUIDGenerator.genUUID())
                .thenReturn("new_uuid")
                .thenReturn("new_chat_id")
                .thenReturn("other_chat_id")

        `when`(mockedConnection.sendPreparedStatement(connectToExistingChatQuery, listOf("new_uuid")))
                .thenReturn(QueryResult(rowsAffected = 1, statusMessage = "OK", rows = mockedConnectResultSet))

        `when`(mockedConnectResultSet.size)
                .thenReturn(0)

        `when`(mockedConnection.sendPreparedStatement(createNewChatQuery, listOf("new_chat_id", "new_uuid")))
                .thenReturn(QueryResult(rowsAffected = 0, statusMessage = "OK", rows = mockedCreateResultSet))

        `when`(mockedConnection.sendPreparedStatement(createNewChatQuery, listOf("other_chat_id", "new_uuid")))
                .thenReturn(QueryResult(rowsAffected = 1, statusMessage = "OK", rows = mockedCreateResultSet))

        val repoConfig = object : ChatRepoConfig {
            override val maxRetries: Int = 2
        }
        val repo = ChatRepoImpl(
                connectionProvider = mockedConnectionProvider,
                config = repoConfig,
                uuidGenerator = mockedUUIDGenerator
        )

        val result = repo.connect()
        assertEquals(
                NewChatConnection(newChatId = "other_chat_id", userId = "new_uuid"),
                result
        )

        verify(mockedConnectionProvider, times(1))
                .getConnection()
        verify(mockedConnection, times(1))
                .sendPreparedStatement(connectToExistingChatQuery, listOf("new_uuid"))
        verify(mockedConnection, times(1))
                .sendPreparedStatement(createNewChatQuery, listOf("new_chat_id", "new_uuid"))
        verify(mockedConnection, times(1))
                .sendPreparedStatement(createNewChatQuery, listOf("other_chat_id", "new_uuid"))
        verify(mockedUUIDGenerator, times(3))
                .genUUID()
        verify(mockedConnectResultSet, atLeastOnce()).size
        verifyNoMoreInteractions(
                mockedConnectionProvider,
                mockedConnection,
                mockedConnectResultSet,
                mockedUUIDGenerator,
                mockedCreateResultSet
        )
    }
}