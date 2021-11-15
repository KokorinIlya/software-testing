package com.github.kokorinilya.springbackend.model

sealed class GetChatResult

data class SuccessfulGetChatResult(val chat: Chat) : GetChatResult()

data class UnsuccessfulGetChatResult(val error: String) : GetChatResult()
