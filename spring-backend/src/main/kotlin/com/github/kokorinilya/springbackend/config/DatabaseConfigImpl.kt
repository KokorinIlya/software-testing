package com.github.kokorinilya.springbackend.config

import org.springframework.stereotype.Component

@Component
class DatabaseConfigImpl(configProvider: ConfigProvider) : DatabaseConfig {
    private val conf = configProvider.config.getConfig("database")

    override val host: String = conf.getString("host")
    override val port: Int = conf.getInt("port")
    override val database: String = conf.getString("database")
    override val username: String = conf.getString("username")
    override val password: String = conf.getString("password")
    override val maxActiveConnections: Int = conf.getInt("maxActiveConnections")
}