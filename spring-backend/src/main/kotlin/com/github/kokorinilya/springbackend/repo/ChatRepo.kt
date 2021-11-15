package com.github.kokorinilya.springbackend.repo

import com.github.jasync.sql.db.SuspendingConnection
import com.github.kokorinilya.springbackend.config.ChatRepoConfig
import com.github.kokorinilya.springbackend.database.ConnectionProvider
import com.github.kokorinilya.springbackend.exception.*
import com.github.kokorinilya.springbackend.model.ChatConnection
import com.github.kokorinilya.springbackend.model.ExistingChatConnection
import com.github.kokorinilya.springbackend.model.NewChatConnection
import com.github.kokorinilya.springbackend.utils.UUIDGenerator
import org.springframework.stereotype.Component

interface ChatRepo {
    suspend fun connect(): ChatConnection

    suspend fun sendMessage(chatId: String, authorId: String, messageText: String)
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

        private val getChatParticipantsQuery = """
SELECT Chats.participant_a::TEXT, Chats.participant_b::TEXT, Chats.finished
FROM Chats
WHERE Chats.chat_id = ?::UUID;
        """.trimIndent()

        private val insertNewMessageQuery = """
INSERT INTO ChatMessages (chat_id, author_id, message_text)
VALUES (?::UUID, ?::UUID, ?)
ON CONFLICT DO NOTHING;
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

    override suspend fun sendMessage(chatId: String, authorId: String, messageText: String) {
        connectionProvider.getConnection().inTransaction { transactionConn ->
            val getChatResult = transactionConn.sendPreparedStatement(getChatParticipantsQuery, listOf(chatId))
            val getChatRows = getChatResult.rows
            assert(getChatRows.size in 0..1)
            if (getChatRows.size == 0) {
                throw NoSuchChatException()
            }
            val participantA = getChatRows[0].getString("participant_a")!!
            val participantB = getChatRows[0].getString("participant_b")
                    ?: throw NoSecondParticipantException()
            val finished = getChatRows[0].getBoolean("finished")!!
            if (participantA != authorId && participantB != authorId) {
                throw CannotAccessChatException()
            }
            if (finished) {
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
}