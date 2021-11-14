package com.github.kokorinilya.springbackend.controller

import com.github.kokorinilya.springbackend.model.Credentials
import com.github.kokorinilya.springbackend.service.UserService
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.mockito.Mockito.*
import org.springframework.http.HttpStatus

class UserControllerComponentTest {
    @Test
    fun testSuccessfulLogin() = runBlocking {
        val mockedUserService = mock(UserService::class.java)

        val credentials = Credentials("login", "password")
        `when`(mockedUserService.login(credentials))
                .thenReturn(true)

        val userController = UserController(userService = mockedUserService)
        val result = userController.login(credentials)
        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals("OK", result.body)
    }

    @Test
    fun testUnsuccessfulLogin() = runBlocking {
        val mockedUserService = mock(UserService::class.java)

        val credentials = Credentials("login", "password")
        `when`(mockedUserService.login(credentials))
                .thenReturn(false)

        val userController = UserController(userService = mockedUserService)
        val result = userController.login(credentials)
        assertEquals(HttpStatus.FORBIDDEN, result.statusCode)
        assertEquals("Incorrect login and/or password", result.body)
    }

    @Test
    fun testSuccessfulRegistration() = runBlocking {
        val mockedUserService = mock(UserService::class.java)

        val credentials = Credentials("login", "password")
        `when`(mockedUserService.register(credentials))
                .thenReturn(true)

        val userController = UserController(userService = mockedUserService)
        val result = userController.register(credentials)
        assertEquals(HttpStatus.OK, result.statusCode)
        assertEquals("OK", result.body)
    }

    @Test
    fun testUnsuccessfulRegistration() = runBlocking {
        val mockedUserService = mock(UserService::class.java)

        val credentials = Credentials("login", "password")
        `when`(mockedUserService.register(credentials))
                .thenReturn(false)

        val userController = UserController(userService = mockedUserService)
        val result = userController.register(credentials)
        assertEquals(HttpStatus.FORBIDDEN, result.statusCode)
        assertEquals("Wrong login", result.body)
    }
}