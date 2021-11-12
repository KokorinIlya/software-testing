package com.github.kokorinilya.springbackend.service

import com.github.kokorinilya.springbackend.database.ConnectionProvider
import com.github.kokorinilya.springbackend.model.Credentials
import org.springframework.stereotype.Component

@Component
class UserServiceImpl(private val connectionProvider: ConnectionProvider) : UserService {
    val registerQuery = """
INSERT INTO Users (login, encrypted_pass)
VALUES (?, crypt(?, gen_salt('bf', 8)))
ON CONFLICT (login) DO NOTHING
RETURNING encrypted_pass;
        """.trimIndent()

    override suspend fun register(credentials: Credentials): Boolean {
        val result = connectionProvider
                .getConnection()
                .sendPreparedStatement(registerQuery, listOf(credentials.login, credentials.password))
        val rowsAffected = result.rowsAffected
        assert(rowsAffected in 0..1)
        return result.rowsAffected > 0
    }

    override suspend fun login(credentials: Credentials): Boolean {
        TODO("Not yet implemented")
    }
}