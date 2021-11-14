package com.github.kokorinilya.springbackend.utils

import com.github.jasync.sql.db.SuspendingConnection
import com.github.jasync.sql.db.asSuspending
import com.github.jasync.sql.db.postgresql.PostgreSQLConnectionBuilder
import com.github.kokorinilya.springbackend.database.ConnectionProvider
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.containers.wait.strategy.Wait
import org.testcontainers.containers.wait.strategy.WaitStrategy
import org.testcontainers.containers.wait.strategy.WaitStrategyTarget
import java.nio.file.Files
import java.nio.file.Path
import java.time.Duration

class AndWaitStrategy(waitStrategies: List<WaitStrategy>,
                      private val startupTimeout: Duration? = null) : WaitStrategy {
    private val timedWaitingStrategies = if (startupTimeout != null) {
        waitStrategies.map { it.withStartupTimeout(startupTimeout) }
    } else {
        waitStrategies
    }

    override fun waitUntilReady(waitStrategyTarget: WaitStrategyTarget?) {
        for (curWaitStrategy in timedWaitingStrategies) {
            curWaitStrategy.waitUntilReady(waitStrategyTarget)
        }
    }

    override fun withStartupTimeout(newStartupTimeout: Duration?): WaitStrategy {
        return AndWaitStrategy(timedWaitingStrategies, newStartupTimeout)
    }
}

suspend fun getPostgresContainer(initScriptPath: Path): Pair<PostgreSQLContainer<*>, ConnectionProvider> {
    val container = PostgreSQLContainer<Nothing>("postgres:latest").apply {
        withDatabaseName("mock_db")
        withUsername("user")
        withPassword("password")
        withExposedPorts(5432)
        waitingFor(
                AndWaitStrategy(
                        listOf(
                                Wait.forLogMessage(
                                        ".*database system is ready to accept connections.*", 1
                                ),
                                Wait.forListeningPort()
                        )
                )
        )
    }
    container.start()

    try {
        val conn = PostgreSQLConnectionBuilder.createConnectionPool {
            host = container.host
            port = container.getMappedPort(5432)
            database = "mock_db"
            username = "user"
            password = "password"
            maxActiveConnections = 32
        }.asSuspending

        @Suppress("BlockingMethodInNonBlockingContext")
        Files.newBufferedReader(initScriptPath).use {
            val lines = it.readLines().joinToString(separator = "\n")
            val commands = lines.split("--- CMD")
            conn.inTransaction { transactionConn ->
                for (curCommand in commands) {
                    transactionConn.sendQuery(curCommand)
                }
            }
        }

        val connectionProvider = object : ConnectionProvider {
            override fun getConnection(): SuspendingConnection = conn
        }
        return Pair(container, connectionProvider)
    } catch (e: Throwable) {
        try {
            container.stop()
        } catch (closeE: Throwable) {
            e.addSuppressed(closeE)
        }
        throw e
    }
}