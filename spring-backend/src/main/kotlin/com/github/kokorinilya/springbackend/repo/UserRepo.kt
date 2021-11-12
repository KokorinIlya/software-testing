package com.github.kokorinilya.springbackend.repo

import com.github.kokorinilya.springbackend.model.Credentials

interface UserRepo {
    suspend fun register(credentials: Credentials): Boolean

    suspend fun login(credentials: Credentials): Boolean
}