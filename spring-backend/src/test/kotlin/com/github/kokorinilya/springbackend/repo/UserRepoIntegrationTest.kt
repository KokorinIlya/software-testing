package com.github.kokorinilya.springbackend.repo

import com.github.kokorinilya.springbackend.model.Credentials
import com.github.kokorinilya.springbackend.utils.getPostgresContainer
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import java.nio.file.Paths

class UserRepoIntegrationTest {
    @Test
    fun testRegisterSuccessful() = runBlocking {
        val scriptPath = Paths.get("migrations/0001_create_schema.sql")
        val (container, connectionProvider) = getPostgresContainer(scriptPath)

        container.use {
            val repo = UserRepoImpl(connectionProvider)
            val result = repo.register(Credentials("login", "password"))
            assertTrue(result)
        }
    }

    @Test
    fun testRegisterBySameLogin() = runBlocking {
        val scriptPath = Paths.get("migrations/0001_create_schema.sql")
        val (container, connectionProvider) = getPostgresContainer(scriptPath)

        container.use {
            val repo = UserRepoImpl(connectionProvider)
            repo.register(Credentials("login", "password"))
            val result = repo.register(Credentials("login", "new_password"))
            assertFalse(result)
        }
    }

    @Test
    fun testLoginAfterRegistration() = runBlocking {
        val scriptPath = Paths.get("migrations/0001_create_schema.sql")
        val (container, connectionProvider) = getPostgresContainer(scriptPath)

        container.use {
            val repo = UserRepoImpl(connectionProvider)
            repo.register(Credentials("login", "password"))
            val result = repo.login(Credentials("login", "password"))
            assertTrue(result)
        }
    }

    @Test
    fun testLoginWrongPassword() = runBlocking {
        val scriptPath = Paths.get("migrations/0001_create_schema.sql")
        val (container, connectionProvider) = getPostgresContainer(scriptPath)

        container.use {
            val repo = UserRepoImpl(connectionProvider)
            repo.register(Credentials("login", "password"))
            val result = repo.login(Credentials("login", "wrong_password"))
            assertFalse(result)
        }
    }

    @Test
    fun testLoginNoSuchUser() = runBlocking {
        val scriptPath = Paths.get("migrations/0001_create_schema.sql")
        val (container, connectionProvider) = getPostgresContainer(scriptPath)

        container.use {
            val repo = UserRepoImpl(connectionProvider)
            repo.register(Credentials("login", "password"))
            val result = repo.login(Credentials("another_login", "password"))
            assertFalse(result)
        }
    }

    private fun testDatabaseDisconnect(action: suspend UserRepoImpl.(Credentials) -> Boolean) = runBlocking {
        val scriptPath = Paths.get("migrations/0001_create_schema.sql")
        val (container, connectionProvider) = getPostgresContainer(scriptPath)

        container.use {
            val repo = UserRepoImpl(connectionProvider)
            container.stop()

            var failed = false
            try { // Cannot use assertThrows here because of suspend behaviour
                repo.action(Credentials("login", "password"))
            } catch (e: Exception) {
                failed = true
            }
            assertTrue(failed)
        }
    }

    @Test
    fun testRegisterDatabaseDisconnect() {
        testDatabaseDisconnect { register(it) }
    }

    @Test
    fun testLoginDatabaseDisconnect() {
        testDatabaseDisconnect { login(it) }
    }
}