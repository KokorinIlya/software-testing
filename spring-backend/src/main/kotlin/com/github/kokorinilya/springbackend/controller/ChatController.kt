package com.github.kokorinilya.springbackend.controller

import com.github.kokorinilya.springbackend.exception.CannotAccessChatException
import com.github.kokorinilya.springbackend.exception.FinishedChatException
import com.github.kokorinilya.springbackend.exception.NoSecondParticipantException
import com.github.kokorinilya.springbackend.exception.NoSuchChatException
import com.github.kokorinilya.springbackend.model.*
import com.github.kokorinilya.springbackend.service.ChatService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
class ChatController(private val chatService: ChatService) {
    @PostMapping(
            value = ["/connect"],
            produces = ["application/json"]
    )
    suspend fun connect(): ChatConnection {
        return chatService.connect()
    }

    @PostMapping(
            value = ["/send/{chatId}"],
            consumes = ["application/json"],
            produces = ["application/json"]
    )
    suspend fun sendMessage(@PathVariable chatId: String,
                            @RequestBody request: SendMessageRequest): ResponseEntity<ChatManipulationResult> {
        val (code, result) = try {
            chatService.sendMessage(
                    chatId = chatId,
                    authorId = request.userId,
                    messageText = request.message
            )
            Pair(
                    HttpStatus.OK,
                    SuccessfulChatManipulationResult(status = "OK")
            )
        } catch (e: CannotAccessChatException) {
            Pair(
                    HttpStatus.FORBIDDEN,
                    UnsuccessfulChatManipulationResult(error = "Cannot access chat $chatId")
            )
        } catch (e: FinishedChatException) {
            Pair(
                    HttpStatus.FORBIDDEN,
                    UnsuccessfulChatManipulationResult(error = "Cannot send messages to finished chat")
            )
        } catch (e: NoSecondParticipantException) {
            Pair(
                    HttpStatus.FORBIDDEN,
                    UnsuccessfulChatManipulationResult(
                            error = "Cannot send messages to chat without second participant"
                    )
            )
        } catch (e: NoSuchChatException) {
            Pair(
                    HttpStatus.NOT_FOUND,
                    UnsuccessfulChatManipulationResult(error = "Chat $chatId does not exist")
            )
        } catch (e: Exception) {
            Pair(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    UnsuccessfulChatManipulationResult(error = "Internal error: $e")
            )
        }

        return ResponseEntity.status(code).body(result)
    }

    @GetMapping(
            value = ["/chat/{chatId}"],
            produces = ["application/json"]
    )
    suspend fun getChat(@PathVariable chatId: String,
                        @RequestParam userId: String): ResponseEntity<GetChatResult> {
        val (code, result) = try {
            val chat = chatService.getChat(
                    chatId = chatId,
                    userId = userId
            )

            Pair(HttpStatus.OK, SuccessfulGetChatResult(chat))
        } catch (e: CannotAccessChatException) {
            Pair(
                    HttpStatus.FORBIDDEN,
                    UnsuccessfulGetChatResult(error = "Cannot access chat $chatId")
            )
        } catch (e: NoSuchChatException) {
            Pair(
                    HttpStatus.NOT_FOUND,
                    UnsuccessfulGetChatResult(error = "Chat $chatId does not exist")
            )
        } catch (e: Exception) {
            Pair(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    UnsuccessfulGetChatResult(error = "Internal error: $e")
            )
        }

        return ResponseEntity.status(code).body(result)
    }

    @PostMapping(
            value = ["/close/{chatId}"],
            consumes = ["application/json"],
            produces = ["application/json"]
    )
    suspend fun finishChat(@PathVariable chatId: String,
                           @RequestBody request: FinishChatRequest): ResponseEntity<ChatManipulationResult> {
        val (code, result) = try {
            chatService.finishChat(
                    chatId = chatId,
                    userId = request.userId
            )
            Pair(
                    HttpStatus.OK,
                    SuccessfulChatManipulationResult(status = "OK")
            )
        } catch (e: CannotAccessChatException) {
            Pair(
                    HttpStatus.FORBIDDEN,
                    UnsuccessfulChatManipulationResult(error = "Cannot access chat $chatId")
            )
        } catch (e: FinishedChatException) {
            Pair(
                    HttpStatus.FORBIDDEN,
                    UnsuccessfulChatManipulationResult(error = "Cannot finish already finished chat")
            )
        } catch (e: NoSuchChatException) {
            Pair(
                    HttpStatus.NOT_FOUND,
                    UnsuccessfulChatManipulationResult(error = "Chat $chatId does not exist")
            )
        } catch (e: Exception) {
            Pair(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    UnsuccessfulChatManipulationResult(error = "Internal error: $e")
            )
        }

        return ResponseEntity.status(code).body(result)
    }
}