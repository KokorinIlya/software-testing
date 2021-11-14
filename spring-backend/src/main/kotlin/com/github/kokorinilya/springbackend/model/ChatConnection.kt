package com.github.kokorinilya.springbackend.model

sealed class ChatConnection

data class NewChatConnection(
        val newChatId: String,
        val userId: String
) : ChatConnection()

data class ExistingChatConnection(
        val existingChatId: String,
        val userId: String,
        val partnerId: String
) : ChatConnection()