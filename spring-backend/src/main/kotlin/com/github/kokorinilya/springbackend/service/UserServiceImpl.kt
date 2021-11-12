package com.github.kokorinilya.springbackend.service

import com.github.kokorinilya.springbackend.model.Credentials
import org.springframework.stereotype.Component

@Component
class UserServiceImpl : UserService {
    override fun register(credentials: Credentials): Boolean {
        return credentials.login != "login"
    }

    override fun login(credentials: Credentials): Boolean {
        TODO("Not yet implemented")
    }
}