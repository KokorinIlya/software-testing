package com.github.kokorinilya.springbackend.service

import com.github.kokorinilya.springbackend.model.Chat
import com.github.kokorinilya.springbackend.model.ChatConnection
import com.github.kokorinilya.springbackend.repo.ChatRepo
import org.springframework.stereotype.Component

interface ChatService {
    suspend fun connect(): ChatConnection

    suspend fun sendMessage(chatId: String, authorId: String, messageText: String)

    suspend fun getChat(chatId: String, userId: String): Chat

    suspend fun finishChat(chatId: String, userId: String)
}

@Component
class ChatServiceImpl(private val chatRepo: ChatRepo) : ChatService {
    override suspend fun connect(): ChatConnection {
        return chatRepo.connect()
    }

    override suspend fun sendMessage(chatId: String, authorId: String, messageText: String) {
        chatRepo.sendMessage(chatId, authorId, messageText)
    }

    override suspend fun getChat(chatId: String, userId: String): Chat {
        return chatRepo.getChat(chatId, userId)
    }

    override suspend fun finishChat(chatId: String, userId: String) {
        chatRepo.finishChat(chatId, userId)
    }
}