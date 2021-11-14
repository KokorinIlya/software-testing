package com.github.kokorinilya.springbackend.utils

import org.springframework.stereotype.Component
import java.util.UUID

interface UUIDGenerator {
    fun genUUID(): String
}

@Component
object UUIDGeneratorImpl : UUIDGenerator {
    override fun genUUID(): String = UUID.randomUUID().toString()
}