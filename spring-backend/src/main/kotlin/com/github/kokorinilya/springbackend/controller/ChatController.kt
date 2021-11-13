package com.github.kokorinilya.springbackend.controller

import com.github.kokorinilya.springbackend.model.ChatConnection
import com.github.kokorinilya.springbackend.service.ChatService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class ChatController(private val chatService: ChatService) {
    @PostMapping(
            value = ["/connect"],
            consumes = ["application/json"],
            produces = ["application/json"]
    )
    suspend fun register(): ChatConnection {
        return chatService.connect()
    }
}