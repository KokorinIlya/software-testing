package com.github.kokorinilya.springbackend.controller

import com.github.kokorinilya.springbackend.exception.CannotAccessChatException
import com.github.kokorinilya.springbackend.exception.FinishedChatException
import com.github.kokorinilya.springbackend.exception.NoSecondParticipantException
import com.github.kokorinilya.springbackend.exception.NoSuchChatException
import com.github.kokorinilya.springbackend.model.*
import com.github.kokorinilya.springbackend.service.ChatService
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.mockito.Mockito.*
import org.springframework.http.HttpStatus

class ChatControllerComponentTest {
    @Test
    fun successfulSendMessage() = runBlocking {
        val mockedChatService = mock(ChatService::class.java)

        `when`(mockedChatService.sendMessage("chat_id", "user_id", "text"))
                .thenReturn(Unit)

        val controller = ChatController(mockedChatService)
        val result = controller.sendMessage("chat_id", SendMessageRequest("user_id", "text"))
        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals(SuccessfulChatManipulationResult(status = "OK"), result.body)

        verify(mockedChatService, times(1))
                .sendMessage("chat_id", "user_id", "text")
        verifyNoMoreInteractions(mockedChatService)
    }

    @Test
    fun sendMessageChatNotFound() = runBlocking {
        val mockedChatService = mock(ChatService::class.java)

        `when`(mockedChatService.sendMessage("chat_id", "user_id", "text"))
                .thenAnswer {
                    throw NoSuchChatException()
                }

        val controller = ChatController(mockedChatService)
        val result = controller.sendMessage("chat_id", SendMessageRequest("user_id", "text"))
        assertEquals(HttpStatus.NOT_FOUND, result.statusCode)
        assertEquals(UnsuccessfulChatManipulationResult(error = "Chat chat_id does not exist"), result.body)

        verify(mockedChatService, times(1))
                .sendMessage("chat_id", "user_id", "text")
        verifyNoMoreInteractions(mockedChatService)
    }

    @Test
    fun sendMessageFinishedChat() = runBlocking {
        val mockedChatService = mock(ChatService::class.java)

        `when`(mockedChatService.sendMessage("chat_id", "user_id", "text"))
                .thenAnswer {
                    throw FinishedChatException()
                }

        val controller = ChatController(mockedChatService)
        val result = controller.sendMessage("chat_id", SendMessageRequest("user_id", "text"))
        assertEquals(HttpStatus.FORBIDDEN, result.statusCode)
        assertEquals(
                UnsuccessfulChatManipulationResult(error = "Cannot send messages to finished chat"),
                result.body
        )

        verify(mockedChatService, times(1))
                .sendMessage("chat_id", "user_id", "text")
        verifyNoMoreInteractions(mockedChatService)
    }

    @Test
    fun sendMessageCannotAccessChat() = runBlocking {
        val mockedChatService = mock(ChatService::class.java)

        `when`(mockedChatService.sendMessage("chat_id", "user_id", "text"))
                .thenAnswer {
                    throw CannotAccessChatException()
                }

        val controller = ChatController(mockedChatService)
        val result = controller.sendMessage("chat_id", SendMessageRequest("user_id", "text"))
        assertEquals(HttpStatus.FORBIDDEN, result.statusCode)
        assertEquals(
                UnsuccessfulChatManipulationResult(error = "Cannot access chat chat_id"),
                result.body
        )

        verify(mockedChatService, times(1))
                .sendMessage("chat_id", "user_id", "text")
        verifyNoMoreInteractions(mockedChatService)
    }

    @Test
    fun sendMessageNoSecondParticipant() = runBlocking {
        val mockedChatService = mock(ChatService::class.java)

        `when`(mockedChatService.sendMessage("chat_id", "user_id", "text"))
                .thenAnswer {
                    throw NoSecondParticipantException()
                }

        val controller = ChatController(mockedChatService)
        val result = controller.sendMessage("chat_id", SendMessageRequest("user_id", "text"))
        assertEquals(HttpStatus.FORBIDDEN, result.statusCode)
        assertEquals(
                UnsuccessfulChatManipulationResult(
                        error = "Cannot send messages to chat without second participant"
                ),
                result.body
        )

        verify(mockedChatService, times(1))
                .sendMessage("chat_id", "user_id", "text")
        verifyNoMoreInteractions(mockedChatService)
    }

    @Test
    fun successfulGetChat() = runBlocking {
        val mockedChatService = mock(ChatService::class.java)

        val chat = Chat(userAId = "a_id", userBId = "b_id", finished = false,
                messages = listOf(
                        Message(authorId = "a_id", text = "hello"),
                        Message(authorId = "b_id", text = "kek")
                )
        )
        `when`(mockedChatService.getChat("chat_id", "user_id"))
                .thenReturn(chat)

        val controller = ChatController(mockedChatService)
        val result = controller.getChat("chat_id", userId = "user_id")
        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals(SuccessfulGetChatResult(chat), result.body)

        verify(mockedChatService, times(1))
                .getChat("chat_id", "user_id")
        verifyNoMoreInteractions(mockedChatService)
    }

    @Test
    fun getChatNotFound() = runBlocking {
        val mockedChatService = mock(ChatService::class.java)

        `when`(mockedChatService.getChat("chat_id", "user_id"))
                .thenAnswer {
                    throw NoSuchChatException()
                }

        val controller = ChatController(mockedChatService)
        val result = controller.getChat("chat_id", "user_id")
        assertEquals(HttpStatus.NOT_FOUND, result.statusCode)
        assertEquals(UnsuccessfulGetChatResult(error = "Chat chat_id does not exist"), result.body)

        verify(mockedChatService, times(1))
                .getChat("chat_id", "user_id")
        verifyNoMoreInteractions(mockedChatService)
    }

    @Test
    fun getChatCannotAccessChat() = runBlocking {
        val mockedChatService = mock(ChatService::class.java)

        `when`(mockedChatService.getChat("chat_id", "user_id"))
                .thenAnswer {
                    throw CannotAccessChatException()
                }

        val controller = ChatController(mockedChatService)
        val result = controller.getChat("chat_id", "user_id")
        assertEquals(HttpStatus.FORBIDDEN, result.statusCode)
        assertEquals(UnsuccessfulGetChatResult(error = "Cannot access chat chat_id"), result.body)

        verify(mockedChatService, times(1))
                .getChat("chat_id", "user_id")
        verifyNoMoreInteractions(mockedChatService)
    }

    @Test
    fun successfulFinishChat() = runBlocking {
        val mockedChatService = mock(ChatService::class.java)

        `when`(mockedChatService.finishChat("chat_id", "user_id"))
                .thenReturn(Unit)

        val controller = ChatController(mockedChatService)
        val result = controller.finishChat("chat_id", FinishChatRequest("user_id"))
        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals(SuccessfulChatManipulationResult(status = "OK"), result.body)

        verify(mockedChatService, times(1))
                .finishChat("chat_id", "user_id")
        verifyNoMoreInteractions(mockedChatService)
    }

    @Test
    fun finishChatCannotAccess() = runBlocking {
        val mockedChatService = mock(ChatService::class.java)

        `when`(mockedChatService.finishChat("chat_id", "user_id"))
                .thenAnswer {
                    throw CannotAccessChatException()
                }

        val controller = ChatController(mockedChatService)
        val result = controller.finishChat("chat_id", FinishChatRequest("user_id"))
        assertEquals(HttpStatus.FORBIDDEN, result.statusCode)
        assertEquals(UnsuccessfulChatManipulationResult(error = "Cannot access chat chat_id"), result.body)

        verify(mockedChatService, times(1))
                .finishChat("chat_id", "user_id")
        verifyNoMoreInteractions(mockedChatService)
    }

    @Test
    fun finishNonExistingChat() = runBlocking {
        val mockedChatService = mock(ChatService::class.java)

        `when`(mockedChatService.finishChat("chat_id", "user_id"))
                .thenAnswer {
                    throw NoSuchChatException()
                }

        val controller = ChatController(mockedChatService)
        val result = controller.finishChat("chat_id", FinishChatRequest("user_id"))
        assertEquals(HttpStatus.NOT_FOUND, result.statusCode)
        assertEquals(UnsuccessfulChatManipulationResult(error = "Chat chat_id does not exist"), result.body)

        verify(mockedChatService, times(1))
                .finishChat("chat_id", "user_id")
        verifyNoMoreInteractions(mockedChatService)
    }

    @Test
    fun finishFinishedChat() = runBlocking {
        val mockedChatService = mock(ChatService::class.java)

        `when`(mockedChatService.finishChat("chat_id", "user_id"))
                .thenAnswer {
                    throw FinishedChatException()
                }

        val controller = ChatController(mockedChatService)
        val result = controller.finishChat("chat_id", FinishChatRequest("user_id"))
        assertEquals(HttpStatus.FORBIDDEN, result.statusCode)
        assertEquals(
                UnsuccessfulChatManipulationResult(error = "Cannot finish already finished chat"),
                result.body
        )

        verify(mockedChatService, times(1))
                .finishChat("chat_id", "user_id")
        verifyNoMoreInteractions(mockedChatService)
    }
}