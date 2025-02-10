package ro.tuc.ds2020.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import ro.tuc.ds2020.config.RabbitMQConfig;
import ro.tuc.ds2020.dtos.DeviceEvent;
import ro.tuc.ds2020.dtos.MonitorDetailsDto;
import ro.tuc.ds2020.dtos.NotificationDto;
import ro.tuc.ds2020.dtos.SimulatorEvent;

@Service
public class RabbitMQService {
    private final MonitorService monitorService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    public RabbitMQService(MonitorService monitorService, SimpMessagingTemplate simpMessagingTemplate) {
        this.monitorService = monitorService;
        this.simpMessagingTemplate = simpMessagingTemplate;

    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_CLIENTS_SIMULATOR)
    public void receiveMessageFromSimulator(String message) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            SimulatorEvent simulatorEvent = mapper.readValue(message, SimulatorEvent.class);
            System.out.println("Received Monitor object: " + message);
            monitorService.updateConsumption(simulatorEvent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_DEVICES)
    public void receiveMessageFromDevice(String message) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            System.out.println("Received Monitor object: " + message);
            DeviceEvent deviceEvent = objectMapper.readValue(message, DeviceEvent.class);
            MonitorDetailsDto monitorDetailsDto = new MonitorDetailsDto(deviceEvent.getDeviceId(), deviceEvent.getMhc(), deviceEvent.getPersonId());

            switch (deviceEvent.getAction()) {
                case "CREATE":
                    monitorService.insert(monitorDetailsDto);
                    break;
                case "DELETE":
                    monitorService.delete(monitorDetailsDto);
                    break;
                case "UPDATE":
                    monitorService.updateMHEC(monitorDetailsDto);
                    break;
                default:
                    System.out.println("Unknown action: " + deviceEvent.getAction());
                    break;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NOTIFICATIONS)
    public void handleMessage(String message) {
        try {
            System.out.println("Received notification message from RabbitMQ: " + message);  // Debugging message
            ObjectMapper objectMapper = new ObjectMapper();

            // Ensure that the message is properly deserialized into NotificationDto
            NotificationDto notificationDto = objectMapper.readValue(message, NotificationDto.class);

            // Send the notification to the WebSocket client
            simpMessagingTemplate.convertAndSend("/topic/message/" + notificationDto.getUserId(), notificationDto.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }



}
