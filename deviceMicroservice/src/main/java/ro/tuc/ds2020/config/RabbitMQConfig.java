package ro.tuc.ds2020.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String QUEUE_DEVICES = "devicesQueue";
    public static final String QUEUE_CLIENTS_SIMULATOR = "clientsSimulatorQueue";
    public static final String EXCHANGE_NAME = "monitorTopicExchange";
    public static final String ROUTING_KEY_DEVICE = "monitor.device.*";
    public static final String ROUTING_KEY_CLIENTS_SIMULATOR = "monitor.clientsSimulator.*";
    public static final String ROUTING_KEY_DEVICE_CREATE = "monitor.device.create";
    public static final String ROUTING_KEY_DEVICE_UPDATE = "monitor.device.update";
    public static final String ROUTING_KEY_DEVICE_DELETE = "monitor.device.delete";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
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

}
