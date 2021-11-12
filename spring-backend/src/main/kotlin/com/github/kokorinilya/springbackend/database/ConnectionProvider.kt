package com.github.kokorinilya.springbackend.database

import com.github.jasync.sql.db.SuspendingConnection

interface ConnectionProvider {
    fun getConnection(): SuspendingConnection
}