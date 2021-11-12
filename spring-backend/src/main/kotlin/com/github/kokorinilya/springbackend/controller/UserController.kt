package com.github.kokorinilya.springbackend.controller

import com.github.kokorinilya.springbackend.service.UserService
import com.github.kokorinilya.springbackend.model.Credentials
import kotlinx.coroutines.delay
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
class UserController(@Autowired private val userService: UserService) {
    @GetMapping("/hello/{name}")
    suspend fun sayHello(@PathVariable name: String): String {
        return "Hello, $name"
    }

    @PostMapping(
            value = ["/register"],
            consumes = ["application/json"],
            produces = ["application/json"]
    )
    suspend fun register(@RequestBody credentials: Credentials): ResponseEntity<String> {
        delay(1000)
        return if (userService.register(credentials)) {
            ResponseEntity.status(HttpStatus.OK).body("OK")
        } else {
            ResponseEntity.status(HttpStatus.FORBIDDEN).body("Wrong login")
        }
    }
}