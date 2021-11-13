package com.github.kokorinilya.springbackend.config

import org.springframework.stereotype.Component

interface ChatRepoConfig {
    val maxRetries: Int
}

@Component
class ChatRepoConfigImpl(configProvider: ConfigProvider) : ChatRepoConfig {
    private val conf = configProvider.config.getConfig("chat_repo")

    override val maxRetries: Int = conf.getInt("maxRetries")
}