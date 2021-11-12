package com.github.kokorinilya.springbackend.service

import com.github.kokorinilya.springbackend.model.Credentials

interface UserService {
    fun register(credentials: Credentials): Boolean

    fun login(credentials: Credentials): Boolean
}
