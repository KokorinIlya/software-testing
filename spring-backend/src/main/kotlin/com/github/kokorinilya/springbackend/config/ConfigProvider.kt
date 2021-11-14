package com.github.kokorinilya.springbackend.config

import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.nio.file.Paths

interface ConfigProvider {
    val config: Config
}

@Component
class ConfigProviderImpl (@Value("\${config.path}") private val pathToConfig: String) : ConfigProvider {
    private val conf = ConfigFactory.parseFile( Paths.get(pathToConfig).toFile())

    override val config: Config
        get(): Config = conf
}