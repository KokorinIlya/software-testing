package com.github.kokorinilya.springbackend.controller

import com.github.kokorinilya.springbackend.exception.CannotAccessChatException
import com.github.kokorinilya.springbackend.exception.FinishedChatException
import com.github.kokorinilya.springbackend.exception.NoSecondParticipantException
import com.github.kokorinilya.springbackend.exception.NoSuchChatException
import com.github.kokorinilya.springbackend.model.*
import com.github.kokorinilya.springbackend.service.ChatService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
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

    @PostMapping(
            value = ["/connect/{chatId}"],
            consumes = ["application/json"],
            produces = ["application/json"]
    )
    suspend fun sendMessage(@PathVariable chatId: String,
                            @RequestBody request: SendMessageRequest): ResponseEntity<ChatManipulationResult> {
        try {
            chatService.sendMessage(
                    chatId = chatId,
                    authorId = request.userId,
                    messageText = request.message
            )
            val result = SuccessfulChatManipulationResult(status = "OK")
            return ResponseEntity.status(HttpStatus.OK).body(result)
        } catch (e: CannotAccessChatException) {
            val result = UnsuccessfulChatManipulationResult(error = "Cannot access chat $chatId")
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result)
        } catch (e: FinishedChatException) {
            val result =  UnsuccessfulChatManipulationResult(error = "Cannot send messages to finished chat")
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result)
        } catch (e: NoSecondParticipantException) {
            val result =  UnsuccessfulChatManipulationResult(
                    error = "Cannot send messages to chat without second participant"
            )
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result)
        } catch (e: NoSuchChatException) {
            val result = UnsuccessfulChatManipulationResult(error = "Cannot access chat $chatId")
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result)
        }
    }
}