package com.github.kokorinilya.springbackend.repo

import com.github.jasync.sql.db.QueryResult
import com.github.jasync.sql.db.ResultSet
import com.github.jasync.sql.db.RowData
import com.github.jasync.sql.db.SuspendingConnection
import com.github.kokorinilya.springbackend.database.ConnectionProvider
import com.github.kokorinilya.springbackend.model.Credentials
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.mockito.Mockito.*

class UserRepoUnitTest {
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

    private fun testRegisterNewUser(successful: Boolean) = runBlocking {
        val mockedConnectionProvider = mock(ConnectionProvider::class.java)
        val mockedConnection = mock(SuspendingConnection::class.java)
        val mockedResultSet = mock(ResultSet::class.java)

        val (rowsAffected, expectedResult) = if (successful) {
            Pair(1L, true)
        } else {
            Pair(0L, false)
        }

        val login = "login"
        val password = "password"

        `when`(mockedConnectionProvider.getConnection())
                .thenReturn(mockedConnection)
        `when`(mockedConnection.sendPreparedStatement(registerQuery, listOf(login, password)))
                .thenReturn(QueryResult(rowsAffected = rowsAffected, statusMessage = "OK", rows = mockedResultSet))

        val repo = UserRepoImpl(connectionProvider = mockedConnectionProvider)
        val registerResult = repo.register(Credentials(login = login, password = password))
        assertEquals(expectedResult, registerResult)

        verify(mockedConnectionProvider, times(1))
                .getConnection()
        verify(mockedConnection, times(1))
                .sendPreparedStatement(registerQuery, listOf(login, password))
        verifyNoMoreInteractions(mockedConnectionProvider, mockedConnection, mockedResultSet)
    }

    @Test
    fun testUnsuccessfulRegisterNewUser() {
        testRegisterNewUser(successful = true)
    }

    @Test
    fun testSuccessfulRegisterNewUser() {
        testRegisterNewUser(successful = false)
    }

    private fun testLogin(dbResponse: Boolean?, expectedResult: Boolean) = runBlocking {
        val mockedConnectionProvider = mock(ConnectionProvider::class.java)
        val mockedConnection = mock(SuspendingConnection::class.java)
        val mockedResultSet = mock(ResultSet::class.java)
        val mockedRow = mock(RowData::class.java)

        val login = "login"
        val password = "password"

        `when`(mockedConnectionProvider.getConnection())
                .thenReturn(mockedConnection)

        `when`(mockedConnection.sendPreparedStatement(loginQuery, listOf(login, password)))
                .thenReturn(QueryResult(rowsAffected = 0, statusMessage = "OK", rows = mockedResultSet))

        `when`(mockedResultSet.size)
                .thenReturn(1)

        `when`(mockedResultSet[0])
                .thenReturn(mockedRow)

        `when`(mockedRow.getBoolean("login_result"))
                .thenReturn(dbResponse)

        val repo = UserRepoImpl(connectionProvider = mockedConnectionProvider)
        val loginResult = repo.login(Credentials(login = login, password = password))
        assertEquals(expectedResult, loginResult)

        verify(mockedConnectionProvider, times(1))
                .getConnection()
        verify(mockedConnection, times(1))
                .sendPreparedStatement(loginQuery, listOf(login, password))
        verify(mockedResultSet, times(1)).size
        verify(mockedResultSet, times(1))[0]
        verify(mockedRow, times(1)).getBoolean("login_result")
        verifyNoMoreInteractions(mockedConnectionProvider, mockedConnection, mockedResultSet)
    }

    @Test
    fun testLoginNoSuchUser() {
        testLogin(dbResponse = null, expectedResult = false)
    }

    @Test
    fun testLoginWrongPassword() {
        testLogin(dbResponse = false, expectedResult = false)
    }

    @Test
    fun testLoginSuccessful() {
        testLogin(dbResponse = true, expectedResult = true)
    }
}