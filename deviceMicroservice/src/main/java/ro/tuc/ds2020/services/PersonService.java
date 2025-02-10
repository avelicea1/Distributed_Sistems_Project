package ro.tuc.ds2020.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ro.tuc.ds2020.controllers.handlers.exceptions.model.ResourceNotFoundException;
import ro.tuc.ds2020.dtos.DeviceDto;
import ro.tuc.ds2020.dtos.PersonDTO;
import ro.tuc.ds2020.dtos.PersonDetailsDTO;
import ro.tuc.ds2020.dtos.builders.DeviceBuilder;
import ro.tuc.ds2020.dtos.builders.PersonBuilder;
import ro.tuc.ds2020.entities.Device;
import ro.tuc.ds2020.entities.Person;
import ro.tuc.ds2020.repositories.DeviceRepository;
import ro.tuc.ds2020.repositories.PersonRepository;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PersonService {
    private static final Logger LOGGER = LoggerFactory.getLogger(PersonService.class);
    private final PersonRepository personRepository;
    private final DeviceRepository deviceRepository;

    @Autowired
    public PersonService(PersonRepository personRepository, DeviceRepository deviceRepository) {
        this.personRepository = personRepository;
        this.deviceRepository = deviceRepository;
    }

    public List<PersonDTO> findPersons() {
        List<Person> personList = personRepository.findAll();
        return personList.stream()
                .map(PersonBuilder::toPersonDTO)
                .collect(Collectors.toList());
    }

    public PersonDetailsDTO findPersonById(UUID id) {
        Optional<Person> prosumerOptional = personRepository.findById(id);
        if (!prosumerOptional.isPresent()) {
            LOGGER.error("Person with id {} was not found in db", id);
            throw new ResourceNotFoundException(Person.class.getSimpleName() + " with id: " + id);
        }
        return PersonBuilder.toPersonDetailsDTO(prosumerOptional.get());
    }

    public UUID insert(PersonDetailsDTO personDTO) {
        Person person = PersonBuilder.toEntity(personDTO);
        person = personRepository.save(person);
        LOGGER.debug("Person with id {} was inserted in db", person.getId());
        return person.getId();
    }

    @Transactional
    public void delete(UUID id) {
        Optional<Person> person = personRepository.findById(id);
        if (!person.isPresent()) {
            LOGGER.error("Person with id {} was not found in db", id);
            throw new ResourceNotFoundException(Person.class.getSimpleName() + " with id: " + id);
        }

        List<Device> deviceList = person.get().getDevices();
        for(Device device : deviceList){
            device.setPerson(null);
            deviceRepository.save(device);
        }
        personRepository.delete(person.get());
    }

    public PersonDetailsDTO findByIdRef(UUID id){
        Optional<Person> person = personRepository.findById_Ref(id);
        if(!person.isPresent()){
            LOGGER.error("Person with id_ref {} was not found in db", id);
            throw new ResourceNotFoundException(Person.class.getSimpleName() + " with id: " + id);
        }
        return PersonBuilder.toPersonDetailsDTO(person.get());

    }

    public List<DeviceDto> getDevicesOfPerson(UUID personIdRef){
        Optional<Person> person = personRepository.findById_Ref(personIdRef);
        if(!person.isPresent()){
            LOGGER.error("Person with id_ref {} was not found in db", personIdRef);
            throw new ResourceNotFoundException(Person.class.getSimpleName() + " with id: " + personIdRef);
        }
        return person.get().getDevices().stream()
                .map(DeviceBuilder::toDeviceDto)
                .collect(Collectors.toList());
    }


}
