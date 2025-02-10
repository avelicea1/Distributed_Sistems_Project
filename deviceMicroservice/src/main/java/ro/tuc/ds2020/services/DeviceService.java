package ro.tuc.ds2020.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ro.tuc.ds2020.controllers.handlers.exceptions.model.ResourceNotFoundException;
import ro.tuc.ds2020.dtos.DeviceDetailsDto;
import ro.tuc.ds2020.dtos.DeviceDto;
import ro.tuc.ds2020.dtos.builders.DeviceBuilder;
import ro.tuc.ds2020.entities.Device;
import ro.tuc.ds2020.entities.Person;
import ro.tuc.ds2020.repositories.DeviceRepository;
import ro.tuc.ds2020.repositories.PersonRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DeviceService {
    private static final Logger LOGGER = LoggerFactory.getLogger(DeviceService.class);
    private final DeviceRepository deviceRepository;
    private final PersonRepository personRepository;


    @Autowired
    public DeviceService(DeviceRepository deviceRepository, PersonRepository personRepository) {
        this.deviceRepository = deviceRepository;
        this.personRepository = personRepository;
    }

    public List<DeviceDto> getAllDevices() {
        List<Device> devices = deviceRepository.findAll();
        return devices.stream()
                .map(DeviceBuilder::toDeviceDto)
                .collect(Collectors.toList());
    }

    public DeviceDetailsDto findDeviceById(UUID id){
        Optional<Device> device = deviceRepository.findById(id);
        if(!device.isPresent()){
            LOGGER.error("Not found device with id: {}", id);
            throw new ResourceNotFoundException(Device.class.getSimpleName() + " with id: " + id);
        }
        return DeviceBuilder.toDeviceDetailsDto(device.get());
    }

    public UUID insertDevice(DeviceDetailsDto deviceDetailsDto) {
        Device device = DeviceBuilder.toDevice(deviceDetailsDto);
        device = deviceRepository.save(device);
        deviceDetailsDto.setId(device.getId());
        LOGGER.info("Inserted device: {}", device.getId());
        return device.getId();
    }

    public UUID updateDevice(UUID id, DeviceDetailsDto deviceDetailsDto) {
        Optional<Device> device = deviceRepository.findById(id);
        if(!device.isPresent()){
            LOGGER.error("Not found device with id: {}", id);
            throw new ResourceNotFoundException(Device.class.getSimpleName() + " with id: " + id);
        }
        Device updatedDevice = DeviceBuilder.toDevice(deviceDetailsDto);
        updatedDevice.setId(id);
        deviceRepository.save(updatedDevice);
        LOGGER.info("Updated device: {}", updatedDevice.getId());
        return updatedDevice.getId();
    }

    public void deleteDevice(UUID id) {
        Optional<Device> device = deviceRepository.findById(id);
        if(!device.isPresent()){
            LOGGER.error("Not found device with id: {}", id);
            throw new ResourceNotFoundException(Device.class.getSimpleName() + " with id: " + id);
        }
        deviceRepository.delete(device.get());
        LOGGER.info("Deleted device: {}", device.get().getId());
    }

    public UUID assignPersonToDevice(UUID personId, UUID deviceId) {
        Optional<Device> device = deviceRepository.findById(deviceId);
        if(!device.isPresent()){
            LOGGER.error("Not found device with id: {}", deviceId);
            throw new ResourceNotFoundException(Device.class.getSimpleName() + " with id: " + deviceId);
        }
        Optional<Person> person = personRepository.findById_Ref(personId);
        if(!person.isPresent()){
            LOGGER.error("Not found person with id: {}", personId);
            throw new ResourceNotFoundException(Person.class.getSimpleName() + " with id: " + personId);
        }
        Person assignedPerson = person.get();
        Device assignedDevice = device.get();
        assignedDevice.setPerson(assignedPerson);
        deviceRepository.save(assignedDevice);
        return deviceId;
    }
}
