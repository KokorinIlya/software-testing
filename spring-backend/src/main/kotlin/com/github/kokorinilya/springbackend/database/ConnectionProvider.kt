package com.github.kokorinilya.springbackend.database

import com.github.jasync.sql.db.SuspendingConnection
import com.github.jasync.sql.db.asSuspending
import com.github.jasync.sql.db.postgresql.PostgreSQLConnectionBuilder
import com.github.kokorinilya.springbackend.config.DatabaseConfig
import org.springframework.stereotype.Component

interface ConnectionProvider {
    fun getConnection(): SuspendingConnection
}

@Component
class ConnectionPoolProvider(conf: DatabaseConfig) : ConnectionProvider {
    private val pool = PostgreSQLConnectionBuilder.createConnectionPool {
        host = conf.host
        port = conf.port
        database = conf.database
        username = conf.username
        password = conf.password
        maxActiveConnections = conf.maxActiveConnections
    }

    override fun getConnection(): SuspendingConnection {
        return pool.asSuspending
    }
}