package com.github.kokorinilya.springbackend.repo

import com.github.kokorinilya.springbackend.database.ConnectionProvider
import com.github.kokorinilya.springbackend.model.Credentials
import org.springframework.stereotype.Component

@Component
class UserRepoImpl(private val connectionProvider: ConnectionProvider) : UserRepo {
    companion object {
        private val registerQuery = """
INSERT INTO Users (login, encrypted_pass)
VALUES (?, crypt(?, gen_salt('bf', 8)))
ON CONFLICT (login) DO NOTHING
RETURNING encrypted_pass;
        """.trimIndent()

        private val loginQuery = """
WITH MatchingUser AS (
    SELECT login, encrypted_pass
    FROM Users
    WHERE Users.login = ?
)
SELECT crypt(?, (SELECT encrypted_pass FROM MatchingUser)) =
       (SELECT encrypted_pass FROM MatchingUser) AS login_result;
        """.trimIndent()
    }

    override suspend fun register(credentials: Credentials): Boolean {
        val result = connectionProvider
                .getConnection()
                .sendPreparedStatement(registerQuery, listOf(credentials.login, credentials.password))
        val rowsAffected = result.rowsAffected
        assert(rowsAffected in 0..1)
        return result.rowsAffected > 0
    }

    override suspend fun login(credentials: Credentials): Boolean {
        val result = connectionProvider
                .getConnection()
                .sendPreparedStatement(loginQuery, listOf(credentials.login, credentials.password))
        val resultRows = result.rows
        assert(resultRows.size == 1)
        return resultRows[0].getBoolean("login_result") ?: false
    }
}