package ro.tuc.ds2020.services;

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

    public void sendMessageToQueue(String exchange, String routingKey, String message) {
        System.out.println("Sending message to exchange " + exchange + " with routing key " + routingKey);
        rabbitTemplate.convertAndSend(exchange, routingKey, message);
    }
}
