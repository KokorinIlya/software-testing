package com.github.kokorinilya.springbackend.service

import com.github.kokorinilya.springbackend.model.Credentials

interface UserService {
    suspend fun register(credentials: Credentials): Boolean

    suspend fun login(credentials: Credentials): Boolean
}
