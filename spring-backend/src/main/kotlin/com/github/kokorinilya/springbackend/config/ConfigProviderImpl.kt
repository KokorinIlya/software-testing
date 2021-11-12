package com.github.kokorinilya.springbackend.config

import com.typesafe.config.Config
import com.typesafe.config.ConfigFactory
import org.springframework.stereotype.Component
import java.nio.file.Paths

@Component
class ConfigProviderImpl : ConfigProvider {
    override val config: Config
        get(): Config {
            val pathToConfig = Paths.get("src/main/resources/application.conf")
            return ConfigFactory.parseFile(pathToConfig.toFile())
        }
}