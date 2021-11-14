package com.github.kokorinilya.springbackend.repo

import com.github.jasync.sql.db.asSuspending
import com.github.jasync.sql.db.postgresql.PostgreSQLConnectionBuilder
import com.github.kokorinilya.springbackend.utils.getPostgresContainer
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.containers.wait.strategy.WaitStrategy
import org.testcontainers.containers.wait.strategy.Wait
import org.testcontainers.containers.wait.strategy.WaitStrategyTarget
import java.nio.file.Files
import java.nio.file.Paths
import java.time.Duration
import kotlin.streams.toList

class UserRepoIntegrationTest {
    @Test
    fun test() = runBlocking {
        val scriptPath = Paths.get("migrations/0001_create_schema.sql")
        val (container, conn) = getPostgresContainer(scriptPath)

        val result = conn.sendQuery("""
SELECT *
FROM pg_catalog.pg_tables
WHERE schemaname != 'pg_catalog'
  AND schemaname != 'information_schema';
        """.trimIndent())
        println(result.rows.stream().map { it.getString("tablename") }.toList())
        container.stop()
    }
}