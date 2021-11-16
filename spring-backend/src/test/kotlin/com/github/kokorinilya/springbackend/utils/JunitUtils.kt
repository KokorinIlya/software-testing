package com.github.kokorinilya.springbackend.utils

import org.hamcrest.CoreMatchers.instanceOf
import org.hamcrest.MatcherAssert.assertThat
import org.junit.Assert


suspend fun <T : Throwable> assertThrowsSuspend(expectedClass: Class<T>, block: suspend () -> Unit) {
    try {
        block()
    } catch (e: Throwable) {
        assertThat(e, instanceOf(expectedClass))
        return
    }
    Assert.fail()
}