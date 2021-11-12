package com.github.kokorinilya.springbackend.config

import com.typesafe.config.Config

interface ConfigProvider {
    val config: Config
}