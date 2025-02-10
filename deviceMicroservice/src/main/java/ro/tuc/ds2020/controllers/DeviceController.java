package ro.tuc.ds2020.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.tuc.ds2020.config.RabbitMQConfig;
import ro.tuc.ds2020.dtos.DeviceDetailsDto;
import ro.tuc.ds2020.dtos.DeviceDto;
import ro.tuc.ds2020.dtos.DeviceEvent;
import ro.tuc.ds2020.dtos.PersonDetailsDTO;
import ro.tuc.ds2020.entities.Device;
import ro.tuc.ds2020.entities.Person;
import ro.tuc.ds2020.services.DeviceService;

import java.util.List;
import java.util.UUID;

import org.springframework.hateoas.Link;
import ro.tuc.ds2020.services.RabbitMQService;

import javax.validation.Valid;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@CrossOrigin
@RequestMapping(value = "/device")
public class DeviceController {
    private final DeviceService deviceService;
    private final RabbitMQService rabbitMQService;
    private final ObjectMapper objectMapper;

    @Autowired
    public DeviceController(DeviceService deviceService, RabbitMQService rabbitMQService, ObjectMapper objectMapper) {
        this.deviceService = deviceService;
        this.rabbitMQService = rabbitMQService;
        this.objectMapper = objectMapper;
    }

    @GetMapping()
    public ResponseEntity<List<DeviceDto>> getAllDevices() {
        List<DeviceDto> devices = deviceService.getAllDevices();
        for(DeviceDto device : devices) {
            Link deviceLink = linkTo(methodOn(DeviceController.class)
                    .getDeviceById(device.getId())).withRel("deviceDetails");
            device.add(deviceLink);
        }
        return new ResponseEntity<>(devices, HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<UUID> createDevice(@Valid @RequestBody DeviceDetailsDto deviceDetailsDto) {
        UUID deviceID = deviceService.insertDevice(deviceDetailsDto);
        try {
            DeviceEvent deviceEvent = new DeviceEvent("CREATE", deviceID, deviceDetailsDto.getPerson()!=null ? deviceDetailsDto.getPerson().getId_ref() : null, deviceDetailsDto.getMhc());
            String deviceEventJson = objectMapper.writeValueAsString(deviceEvent);
            rabbitMQService.sendMessageToQueue(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY_DEVICE_CREATE, deviceEventJson);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>(deviceID, HttpStatus.CREATED);
    }

    @GetMapping(value="/{id}")
    public ResponseEntity<DeviceDetailsDto> getDeviceById(@PathVariable("id") UUID deviceId) {
        DeviceDetailsDto dto = deviceService.findDeviceById(deviceId);
        return new ResponseEntity<>(dto,HttpStatus.OK);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<UUID> updateDevice(@PathVariable("id") UUID deviceId, @Valid @RequestBody DeviceDetailsDto deviceDetailsDto) {
        UUID deviceID = deviceService.updateDevice(deviceId, deviceDetailsDto);
        try {
            DeviceEvent deviceEvent = new DeviceEvent("UPDATE", deviceID,deviceDetailsDto.getPerson()!=null ? deviceDetailsDto.getPerson().getId_ref() : null, deviceDetailsDto.getMhc());
            String deviceEventJson = objectMapper.writeValueAsString(deviceEvent);
            rabbitMQService.sendMessageToQueue(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY_DEVICE_UPDATE, deviceEventJson);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>(deviceID, HttpStatus.OK);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<UUID> deleteDevice(@PathVariable("id") UUID deviceId) {
        DeviceDetailsDto device = deviceService.findDeviceById(deviceId);
        Person person = device.getPerson();
        deviceService.deleteDevice(deviceId);
        try {
            DeviceEvent deviceEvent = new DeviceEvent("DELETE", deviceId, person != null ? person.getId_ref() : null, 0);
            String deviceEventJson = objectMapper.writeValueAsString(deviceEvent);
            rabbitMQService.sendMessageToQueue(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY_DEVICE_DELETE, deviceEventJson);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>(deviceId, HttpStatus.OK);
    }

    @PutMapping("/assign/{personId}/{deviceId}")
    public ResponseEntity<UUID> assignDevice(@PathVariable("personId") UUID personId, @PathVariable("deviceId") UUID deviceId) {
        deviceService.assignPersonToDevice(personId, deviceId);
        return new ResponseEntity<>(deviceId, HttpStatus.OK);
    }


}
