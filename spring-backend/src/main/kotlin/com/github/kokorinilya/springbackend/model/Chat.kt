package com.github.kokorinilya.springbackend.model

data class Chat(val userAId: String, val userBId: String?, val messages: List<Message>, val finished: Boolean)
