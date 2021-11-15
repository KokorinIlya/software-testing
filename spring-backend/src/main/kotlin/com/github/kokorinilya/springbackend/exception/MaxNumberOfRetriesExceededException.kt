package com.github.kokorinilya.springbackend.exception

import java.lang.Exception

class MaxNumberOfRetriesExceededException(maxRetries: Int) : Exception() {
    override val message: String = "Could not prform action after $maxRetries retries"
}