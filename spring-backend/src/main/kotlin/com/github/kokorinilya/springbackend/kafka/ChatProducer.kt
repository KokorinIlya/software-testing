package com.github.kokorinilya.springbackend.kafka

import com.github.kokorinilya.springbackend.config.KafkaConfig
import com.github.kokorinilya.springbackend.model.Chat
import java.util.Properties
import org.apache.kafka.clients.producer.KafkaProducer
import org.apache.kafka.clients.producer.ProducerRecord
import org.springframework.stereotype.Component

interface ChatProducer {
    fun sendChat(chatId: String, chat: Chat)
}

@Component
class ChatProducerImpl(private val kafkaConfig: KafkaConfig) : ChatProducer {
    private val props = Properties()

    init {
        props["bootstrap.servers"] = "${kafkaConfig.host}:${kafkaConfig.port}"
        props["acks"] = kafkaConfig.acks.toString()
        props["retries"] = kafkaConfig.retries.toString()
        props["batch.size"] = kafkaConfig.batchSize.toString()
        props["linger.ms"] = kafkaConfig.lingerMs.toString()
        props["buffer.memory"] = kafkaConfig.bufferMemory.toString()
        props["key.serializer"] = "org.apache.kafka.common.serialization.StringSerializer"
        props["value.serializer"] = "org.apache.kafka.common.serialization.StringSerializer"
    }

    override fun sendChat(chatId: String, chat: Chat) {
        KafkaProducer<String, String>(props).use {
            val record = ProducerRecord(kafkaConfig.topic, chatId, chat.toString())
            it.send(record).get()
        }
    }
}