package ro.tuc.ds2020.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.hateoas.Link;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import ro.tuc.ds2020.dtos.DeviceProperties;
import ro.tuc.ds2020.dtos.PersonDTO;
import ro.tuc.ds2020.dtos.PersonDetailsDTO;
import ro.tuc.ds2020.entities.Person;
import ro.tuc.ds2020.services.PersonService;

import javax.validation.Valid;
import java.util.List;
import java.util.UUID;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping(value = "/person")
public class PersonController {

    private final PersonService personService;
    @Autowired
    private RestTemplate restTemplate;

    private final String DEVICE_SERVICE_URL;

    @Autowired
    public PersonController(PersonService personService) {
        this.personService = personService;
        this.DEVICE_SERVICE_URL = "http://device-backend-container:8081/api-device/person";
    }

    @GetMapping()
    public ResponseEntity<List<PersonDTO>> getPersons() {
        List<PersonDTO> dtos = personService.findPersons();
        for (PersonDTO dto : dtos) {
            Link personLink = linkTo(methodOn(PersonController.class)
                    .getPerson(dto.getId())).withRel("personDetails");
            dto.add(personLink);
        }
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @Transactional
    @PostMapping()
    public ResponseEntity<UUID> insertProsumer(@Valid @RequestBody PersonDetailsDTO personDTO,
                                               @RequestHeader(value = "Authorization") String token) {
        UUID personID = personService.insert(personDTO);
        informDeviceServiceAboutPersonAdd(personID, token);
        return new ResponseEntity<>(personID, HttpStatus.CREATED);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<PersonDetailsDTO> getPerson(@PathVariable("id") UUID personId) {
        PersonDetailsDTO dto = personService.findPersonById(personId);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<UUID> updatePerson(@PathVariable("id") UUID personId, @Valid @RequestBody PersonDetailsDTO personDTO) {
        UUID personID = personService.update(personId, personDTO);
        return new ResponseEntity<>(personID, HttpStatus.OK);
    }

    @Transactional
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<UUID> deletePerson(@PathVariable("id") UUID personId,
                                             @RequestHeader(value = "Authorization") String token) {
        personService.delete(personId);
        informDeviceServiceAboutPersonDelete(personId, token);
        return new ResponseEntity<>(personId, HttpStatus.OK);
    }

    private void informDeviceServiceAboutPersonAdd(UUID personId, String token) {
        String url = DEVICE_SERVICE_URL + "/person-added/" + personId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        restTemplate.exchange(url, HttpMethod.POST, entity, Void.class);
    }

    private void informDeviceServiceAboutPersonDelete(UUID personId, String token) {
        String url = DEVICE_SERVICE_URL + "/person-deleted/" + personId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        restTemplate.exchange(url, HttpMethod.DELETE, entity, Void.class);
    }
}
