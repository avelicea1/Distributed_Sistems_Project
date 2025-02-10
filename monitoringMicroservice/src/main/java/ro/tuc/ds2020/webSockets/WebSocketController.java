package ro.tuc.ds2020.webSockets;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Controller;
import ro.tuc.ds2020.dtos.DeviceDataRequest;
import ro.tuc.ds2020.service.MonitorService;


@Controller
public class WebSocketController {

    private final MonitorService monitorService;


    public WebSocketController( MonitorService monitorService) {
        this.monitorService = monitorService;
    }

    @MessageMapping("/sendConsumption")
    public void sendConsumptionData(String messageBody) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            DeviceDataRequest request = objectMapper.readValue(messageBody, DeviceDataRequest.class);
            String deviceId = request.getDeviceId();
            String selectedDate = request.getSelectedDate();
            System.out.println("Received request for device ID: " + deviceId + " and selected date: " + selectedDate);
            monitorService.getEnergyDataForDate(deviceId, selectedDate);
        } catch (JsonProcessingException e) {
            System.err.println("Error parsing JSON message: " + e.getMessage());
        }
    }
}
