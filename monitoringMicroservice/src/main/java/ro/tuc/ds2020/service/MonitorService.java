package ro.tuc.ds2020.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import ro.tuc.ds2020.config.RabbitMQConfig;
import ro.tuc.ds2020.dtos.MonitorDetailsDto;
import ro.tuc.ds2020.dtos.NotificationDto;
import ro.tuc.ds2020.dtos.SimulatorEvent;
import ro.tuc.ds2020.dtos.builders.MonitorBuilder;
import ro.tuc.ds2020.entities.Monitor;
import ro.tuc.ds2020.repositories.MonitorRepository;
import javax.transaction.Transactional;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;


@Service
public class MonitorService {
    private static final Logger LOGGER = LoggerFactory.getLogger(MonitorService.class);
    private final MonitorRepository monitorRepository;
    private final SimpMessagingTemplate simpMessageTemplate;
    private final RabbitTemplate rabbitTemplate;

    private final FanoutExchange fanoutExchange;


    @Autowired
    public MonitorService(MonitorRepository monitorRepository, SimpMessagingTemplate simpMessageTemplate, RabbitTemplate rabbitTemplate, FanoutExchange fanoutExchange) {
        this.monitorRepository = monitorRepository;
        this.simpMessageTemplate = simpMessageTemplate;
        this.rabbitTemplate = rabbitTemplate;
        this.fanoutExchange = fanoutExchange;
    }

    @Transactional
    public UUID insert(MonitorDetailsDto monitorDetailsDto) {
        Monitor monitor = MonitorBuilder.toMonitor(monitorDetailsDto);
        monitor = monitorRepository.save(monitor);
        return monitor.getDeviceId();
    }

    @Transactional
    public UUID delete(MonitorDetailsDto monitorDetailsDto) {
        Monitor monitor = monitorRepository.findByDeviceId(monitorDetailsDto.getDeviceId());
        monitorRepository.delete(monitor);
        return monitor.getDeviceId();
    }

    @Transactional
    public Monitor updateConsumption(SimulatorEvent simulatorEvent) {
        Monitor monitor = monitorRepository.findByDeviceId(simulatorEvent.getDeviceId());
        long value = simulatorEvent.getTimestamp();
        simulatorEvent.setTimestamp(simulatorEvent.getTimestamp() / 3600000 * 3600000);
        Date date = new Date(simulatorEvent.getTimestamp());
        Double currentValue = monitor.getValues().get(date);
        double valueToBeAdded = 0;
        if(monitor.getLastIndex() == -1){
            monitor.setLastIndex(simulatorEvent.getMeasurementValue());
        }else{
            valueToBeAdded = simulatorEvent.getMeasurementValue() - monitor.getLastIndex();
            monitor.setLastIndex(simulatorEvent.getMeasurementValue());
        }
        if (currentValue != null) {
            monitor.getValues().put(date, currentValue + valueToBeAdded);
        } else {
            monitor.getValues().put(date, valueToBeAdded);
        }

        monitor = monitorRepository.save(monitor);
        LOGGER.debug("Monitor with id {} was updated in db", monitor.getDeviceId());
        System.out.println(currentValue);
        if (currentValue!=null && valueToBeAdded + currentValue > monitor.getMhc()) {

            String message = "Device with the id: " + monitor.getDeviceId().toString() + " exceeded the maximum value with " + (valueToBeAdded + currentValue - monitor.getMhc())+ " kWh";
            System.out.println(message);
//            UUID personId = monitor.getPersonId();
//            sendToUser(personId.toString(), message);
            NotificationDto notificationDto = new NotificationDto(monitor.getPersonId().toString(), message);
            ObjectMapper objectMapper = new ObjectMapper();
            String sending = null;
            try{
                sending = objectMapper.writeValueAsString(notificationDto);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
            System.out.println("-----------------FANOUT: " + fanoutExchange.getName());
            rabbitTemplate.convertAndSend(fanoutExchange.getName(), "", sending);
            //rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY_NOTIFICATIONS, sending);


        }

        return monitor;
    }

    public Monitor updateMHEC(MonitorDetailsDto monitorDetailsDto) {
        Monitor monitor = monitorRepository.findByDeviceId(monitorDetailsDto.getDeviceId());
        monitor.setMhc(monitorDetailsDto.getMhc());
        monitor = monitorRepository.save(monitor);
        LOGGER.debug("Monitor with id {} was updated in db", monitor.getDeviceId());
        return monitor;
    }


    public void getEnergyDataForDate(String deviceId, String date){
        Monitor monitor = monitorRepository.findByDeviceId(UUID.fromString(deviceId));
        if (monitor == null) {
            LOGGER.error("Monitor not found for deviceId {}", deviceId);
            return ;
        }
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        Date targetDate = null;
        try {
            targetDate = dateFormat.parse(date);
        } catch (ParseException e) {
            LOGGER.error("Invalid date format: {}", date);
            return;
        }

        Map<String, Double> formattedValues = new HashMap<>();
        for (Map.Entry<Date, Double> entry : monitor.getValues().entrySet()) {
            Date dateWithHour = entry.getKey();
            if (dateFormat.format(dateWithHour).equals(dateFormat.format(targetDate))) {
                formattedValues.put(entry.getKey().toString(), entry.getValue());
            }
        }
        simpMessageTemplate.convertAndSend("/topic/sendConsumption/" + deviceId, formattedValues);

    }

    public void sendToUser(String userId, String message) {
        simpMessageTemplate.convertAndSend("/topic/message/" + userId, message);
    }


}
