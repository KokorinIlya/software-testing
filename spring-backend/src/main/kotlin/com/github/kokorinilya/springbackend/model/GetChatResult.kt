package com.github.kokorinilya.springbackend.model

sealed class GetChatResult

data class SuccessfulGetChatResult(val chat: Chat) : GetChatResult()

data class UnSuccessfulGetChatResult(val error: String) : GetChatResult()
