package com.github.kokorinilya.springbackend.exception

import java.lang.Exception

class CreateNewChatException(private val maxRetries: Int) : Exception() {
    override val message: String = "Could not create new chat after $maxRetries retries"
}