package com.example.simulator.service;

import com.example.simulator.config.RabbitMQConfig;
import com.example.simulator.entities.Measurement;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RabbitMQService {
    private final RabbitTemplate rabbitTemplate;


    @Autowired
    public RabbitMQService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendMessageToQueue(String routingKey, Measurement measurement) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonMessage = objectMapper.writeValueAsString(measurement);
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, routingKey, jsonMessage);
            System.out.println("Sent message to RabbitMQ: " + jsonMessage);
        } catch (JsonProcessingException e) {
            System.out.println("Failed to convert message to JSON: " + e.getMessage());
        }
    }
}
