package ro.tuc.ds2020.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Link;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.tuc.ds2020.dtos.DeviceDto;
import ro.tuc.ds2020.dtos.PersonDTO;
import ro.tuc.ds2020.dtos.PersonDetailsDTO;
import ro.tuc.ds2020.entities.Device;
import ro.tuc.ds2020.entities.Person;
import ro.tuc.ds2020.repositories.PersonRepository;
import ro.tuc.ds2020.services.PersonService;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping(value = "/person")
public class PersonController {

    private final PersonService personService;
    private final PersonRepository personRepository;

    @Autowired
    public PersonController(PersonService personService, PersonRepository personRepository) {
        this.personService = personService;
        this.personRepository = personRepository;
    }

    @GetMapping()
    public ResponseEntity<List<PersonDTO>> getPersons() {
        List<PersonDTO> dtos = personService.findPersons();
        for (PersonDTO dto : dtos) {
            System.out.println(dto.getDevices());
            Link personLink = linkTo(methodOn(PersonController.class)
                    .getPerson(dto.getId())).withRel("personDetails");
            dto.add(personLink);
        }
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<UUID> insertProsumer(@Valid @RequestBody PersonDetailsDTO personDTO) {
        UUID personID = personService.insert(personDTO);
        return new ResponseEntity<>(personID, HttpStatus.CREATED);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<PersonDetailsDTO> getPerson(@PathVariable("id") UUID personId) {
        PersonDetailsDTO dto = personService.findPersonById(personId);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @PostMapping("/person-added/{personId}")
    public ResponseEntity<UUID> handlePersonAdded(@PathVariable UUID personId) {
        PersonDetailsDTO dto = new PersonDetailsDTO();
        dto.setId_ref(personId);
        personService.insert(dto);
        System.out.println("Person added with ID: " + personId);
        return new ResponseEntity<>(personId, HttpStatus.OK);
    }

    @DeleteMapping("/person-deleted/{personId}")
    public ResponseEntity<UUID> handlePersonDeleted(@PathVariable UUID personId) {
        Optional<Person> person = personRepository.findById_Ref(personId);
        if(!person.isPresent()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        personService.delete(person.get().getId());
        System.out.println("Person deleted with ID: " + personId);
        return new ResponseEntity<>(personId, HttpStatus.OK);
    }

    @GetMapping("/idRef/{id}")
    public ResponseEntity<PersonDetailsDTO> getPersonWithIdRef(@PathVariable UUID id){
        return new ResponseEntity<>(personService.findByIdRef(id), HttpStatus.OK);
    }

    @GetMapping("/devices/{id}")
    public ResponseEntity<List<DeviceDto>> getDevicesForPerson(@PathVariable UUID id) {
        List<DeviceDto> devices = personService.getDevicesOfPerson(id);
        return new ResponseEntity<>(devices, HttpStatus.OK);
    }

}
