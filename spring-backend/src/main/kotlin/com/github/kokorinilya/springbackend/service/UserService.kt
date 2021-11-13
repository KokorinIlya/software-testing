package com.github.kokorinilya.springbackend.service

import com.github.kokorinilya.springbackend.model.Credentials
import com.github.kokorinilya.springbackend.repo.UserRepo
import org.springframework.stereotype.Component

interface UserService {
    suspend fun register(credentials: Credentials): Boolean

    suspend fun login(credentials: Credentials): Boolean
}

@Component
class UserServiceImpl(private val userRepo: UserRepo) : UserService {
    override suspend fun register(credentials: Credentials): Boolean {
        return userRepo.register(credentials)
    }

    override suspend fun login(credentials: Credentials): Boolean {
        return userRepo.login(credentials)
    }
}