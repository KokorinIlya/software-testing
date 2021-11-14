package com.github.kokorinilya.springbackend.repo

import com.github.jasync.sql.db.SuspendingConnection
import com.github.kokorinilya.springbackend.config.ChatRepoConfig
import com.github.kokorinilya.springbackend.database.ConnectionProvider
import com.github.kokorinilya.springbackend.exception.CreateNewChatException
import com.github.kokorinilya.springbackend.model.ChatConnection
import com.github.kokorinilya.springbackend.model.ExistingChatConnection
import com.github.kokorinilya.springbackend.model.NewChatConnection
import com.github.kokorinilya.springbackend.utils.UUIDGenerator
import org.springframework.stereotype.Component
import java.util.*

interface ChatRepo {
    suspend fun connect(): ChatConnection
}

@Component
class ChatRepoImpl(
        private val connectionProvider: ConnectionProvider,
        private val config: ChatRepoConfig,
        private val uuidGenerator: UUIDGenerator
) : ChatRepo {
    companion object {
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
    }

    private suspend fun createNewChat(uid: String, connection: SuspendingConnection): NewChatConnection {
        for (i in 1..config.maxRetries) {
            val chatId = uuidGenerator.genUUID()
            val result = connection.sendPreparedStatement(createNewChatQuery, listOf(chatId, uid))
            assert(result.rowsAffected in 0..1)
            if (result.rowsAffected == 1L) {
                return NewChatConnection(newChatId = chatId, userId = uid)
            } else {
                continue
            }
        }
        throw CreateNewChatException(config.maxRetries)
    }

    override suspend fun connect(): ChatConnection {
        val connection = connectionProvider.getConnection()
        val uid = uuidGenerator.genUUID()
        val result = connection.sendPreparedStatement(connectToExistingChatQuery, listOf(uid))
        val rows = result.rows
        assert(rows.size in 0..1)

        return if (rows.size == 0) {
            createNewChat(uid = uid, connection = connection)
        } else {
            val existingChatId = rows[0].getString("chat_id")!!
            val partnerId = rows[0].getString("participant_a")!!
            ExistingChatConnection(
                    existingChatId = existingChatId,
                    userId = uid,
                    partnerId = partnerId
            )
        }
    }
}