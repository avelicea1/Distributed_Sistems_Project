package ro.tuc.ds2020.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.UUID;

@Configuration
@EnableRabbit
public class RabbitMQConfig {
    public static final String QUEUE_DEVICES = "devicesQueue";
    public static final String QUEUE_CLIENTS_SIMULATOR = "clientsSimulatorQueue";
    public static final String QUEUE_NOTIFICATIONS = "notificationsQueue";
    public static final String EXCHANGE_NAME = "monitorTopicExchange";
    public static final String ROUTING_KEY_DEVICE = "monitor.device.*";
    public static final String ROUTING_KEY_CLIENTS_SIMULATOR = "monitor.clients.simulator";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public FanoutExchange fanoutExchange() {
        return new FanoutExchange("notificationsFanoutExchange");
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(QUEUE_NOTIFICATIONS, true);
    }

    @Bean
    public Queue deviceQueue() {
        return new Queue(QUEUE_DEVICES, true);
    }

    @Bean
    public Queue clientsSimulatorQueue() {
        return new Queue(QUEUE_CLIENTS_SIMULATOR, true);
    }

    @Bean
    public Binding deviceBinding(Queue deviceQueue, TopicExchange exchange) {
        return BindingBuilder.bind(deviceQueue).to(exchange).with(ROUTING_KEY_DEVICE);
    }

    @Bean
    public Binding clientsSimulatorBinding(Queue clientsSimulatorQueue, TopicExchange exchange) {
        return BindingBuilder.bind(clientsSimulatorQueue).to(exchange).with(ROUTING_KEY_CLIENTS_SIMULATOR);
    }

    @Bean
    public Binding Notificationsbinding(Queue notificationQueue, FanoutExchange topicExchange) {
        return BindingBuilder.bind(notificationQueue).to(topicExchange);
    }

}
