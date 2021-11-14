package com.github.kokorinilya.springbackend.model

sealed class ChatManipulationResult

data class SuccessfulChatManipulationResult(val status: String) : ChatManipulationResult()

data class UnsuccessfulChatManipulationResult(val error: String) : ChatManipulationResult()
