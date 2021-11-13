package com.github.kokorinilya.springbackend.service

import com.github.kokorinilya.springbackend.model.ChatConnection
import com.github.kokorinilya.springbackend.repo.ChatRepo
import org.springframework.stereotype.Component

interface ChatService {
    suspend fun connect(): ChatConnection
}

@Component
class ChatServiceImpl(private val chatRepo: ChatRepo) : ChatService {
    override suspend fun connect(): ChatConnection {
        return chatRepo.connect()
    }
}