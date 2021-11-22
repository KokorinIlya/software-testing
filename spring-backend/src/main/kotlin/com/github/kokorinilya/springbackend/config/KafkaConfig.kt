package com.github.kokorinilya.springbackend.config

import org.springframework.stereotype.Component

enum class AcksMode {
    ZERO, ONE, ALL;

    override fun toString(): String {
        return when (this) {
            ZERO -> "0"
            ONE -> "1"
            ALL -> "all"
        }
    }

    companion object {
        fun fromString(acks: String): AcksMode {
            return when (acks) {
                "zero" -> ZERO
                "one" -> ONE
                "all" -> ALL
                else -> throw IllegalArgumentException("Incorrect acks value $acks")
            }
        }
    }
}

interface KafkaConfig {
    val topic: String
    val host: String
    val port: Int
    val acks: AcksMode
    val retries: Int
    val batchSize: Int
    val lingerMs: Int
    val bufferMemory: Int
}

@Component
class KafkaConfigImpl(configProvider: ConfigProvider) : KafkaConfig {
    private val conf = configProvider.config.getConfig("kafka")

    override val topic: String = conf.getString("topic")
    override val host: String = conf.getString("host")
    override val port: Int = conf.getInt("port")
    override val acks: AcksMode = AcksMode.fromString(conf.getString("acks"))
    override val retries: Int = conf.getInt("retries")
    override val batchSize: Int = conf.getInt("batchSize")
    override val lingerMs: Int = conf.getInt("lingerMs")
    override val bufferMemory: Int = conf.getInt("bufferMemory")

}