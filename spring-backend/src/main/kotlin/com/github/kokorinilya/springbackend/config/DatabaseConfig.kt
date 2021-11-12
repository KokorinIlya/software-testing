package com.github.kokorinilya.springbackend.config

interface DatabaseConfig {
    val host: String
    val port: Int
    val database: String
    val username: String
    val password: String
    val maxActiveConnections: Int
}

