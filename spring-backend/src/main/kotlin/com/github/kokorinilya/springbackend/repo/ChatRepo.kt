package com.github.kokorinilya.springbackend.repo

import com.github.jasync.sql.db.SuspendingConnection
import com.github.kokorinilya.springbackend.config.ChatRepoConfig
import com.github.kokorinilya.springbackend.database.ConnectionProvider
import com.github.kokorinilya.springbackend.exception.*
import com.github.kokorinilya.springbackend.model.*
import com.github.kokorinilya.springbackend.utils.UUIDGenerator
import org.springframework.stereotype.Component

interface ChatRepo {
    suspend fun connect(): ChatConnection

    suspend fun sendMessage(chatId: String, authorId: String, messageText: String)

    suspend fun getChat(chatId: String, userId: String): Chat

    suspend fun finishChat(chatId: String, userId: String)
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
    WHERE Chats.participant_b IS NULL AND Chats.finished = FALSE
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

        private val insertNewMessageQuery = """
INSERT INTO ChatMessages (chat_id, author_id, message_text)
VALUES (?::UUID, ?::UUID, ?)
ON CONFLICT DO NOTHING;
        """.trimIndent()

        private val getChatQuery = """
SELECT Chats.participant_a::TEXT, Chats.participant_b::TEXT, Chats.finished
FROM Chats
WHERE Chats.chat_id = ?::UUID;
        """.trimIndent()

        private val getChatMessagesQuery = """
SELECT ChatMessages.author_id::TEXT, ChatMessages.message_text
FROM ChatMessages
WHERE ChatMessages.chat_id = ?::UUID
ORDER BY ChatMessages.message_timestamp;
        """.trimIndent()

        private val finishChatQuery = """
UPDATE Chats
SET finished = TRUE
WHERE Chats.chat_id = ?::UUID;
        """.trimIndent()

        private val repeatableReadQuery = """
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
        """.trimIndent()

        private data class DBFetchedChat(val userAId: String, val userBId: String?, val finished: Boolean)
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
        throw MaxNumberOfRetriesExceededException(config.maxRetries)
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

    private suspend fun doSendMessage(chatId: String, authorId: String, messageText: String,
                                      transactionConn: SuspendingConnection) {
        for (i in 1..config.maxRetries) {
            val result = transactionConn.sendPreparedStatement(
                    insertNewMessageQuery,
                    listOf(chatId, authorId, messageText)
            )
            assert(result.rowsAffected in 0..1)
            if (result.rowsAffected == 1L) {
                return
            } else {
                continue
            }
        }
        throw MaxNumberOfRetriesExceededException(config.maxRetries)
    }

    private suspend fun doGetChat(connection: SuspendingConnection,
                                  chatId: String, userId: String): DBFetchedChat {
        val getChatResult = connection.sendPreparedStatement(getChatQuery, listOf(chatId))
        val getChatRows = getChatResult.rows
        assert(getChatRows.size in 0..1)
        if (getChatRows.size == 0) {
            throw NoSuchChatException()
        }
        val participantA = getChatRows[0].getString("participant_a")!!
        val participantB = getChatRows[0].getString("participant_b")
        if (participantA != userId && participantB != userId) {
            throw CannotAccessChatException()
        }
        val finished = getChatRows[0].getBoolean("finished")!!
        return DBFetchedChat(userAId = participantA, userBId = participantB, finished = finished)
    }

    override suspend fun sendMessage(chatId: String, authorId: String, messageText: String) {
        connectionProvider.getConnection().inTransaction { transactionConn ->
            transactionConn.sendQuery(repeatableReadQuery)

            val chat = doGetChat(connection = transactionConn, chatId = chatId, userId = authorId)
            if (chat.userBId == null) {
                throw NoSecondParticipantException()
            }
            if (chat.finished) {
                throw FinishedChatException()
            }

            doSendMessage(
                    chatId = chatId,
                    authorId = authorId,
                    messageText = messageText,
                    transactionConn = transactionConn
            )
        }
    }

    override suspend fun getChat(chatId: String, userId: String): Chat {
        val connection = connectionProvider.getConnection()

        val chat = doGetChat(connection = connection, chatId = chatId, userId = userId)

        val getMessagesResult = connection.sendPreparedStatement(getChatMessagesQuery, listOf(chatId))
        val messages = getMessagesResult.rows.map {
            val authorId = it.getString("author_id")!!
            val messageText = it.getString("message_text")!!
            Message(authorId = authorId, text = messageText)
        }
        return Chat(userAId = chat.userAId, userBId = chat.userBId, finished = chat.finished, messages = messages)
    }

    override suspend fun finishChat(chatId: String, userId: String) {
        val connection = connectionProvider.getConnection()

        val chat = doGetChat(connection = connection, chatId = chatId, userId = userId)
        if (chat.finished) {
            throw FinishedChatException()
        }

        connection.sendPreparedStatement(finishChatQuery, listOf(chatId))
    }
}