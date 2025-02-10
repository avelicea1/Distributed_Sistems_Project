package ro.tuc.ds2020.dtos.builders;

import ro.tuc.ds2020.dtos.PersonDTO;
import ro.tuc.ds2020.dtos.PersonDetailsDTO;
import ro.tuc.ds2020.entities.Person;

import java.util.Collections;

public class PersonBuilder {

    private PersonBuilder() {
    }

    public static PersonDTO toPersonDTO(Person person) {
        return new PersonDTO(person.getId(),person.getId_ref(),person.getDevices() != null ? person.getDevices() : Collections.emptyList());
    }

    public static PersonDetailsDTO toPersonDetailsDTO(Person person) {
        return new PersonDetailsDTO(person.getId(), person.getId_ref(), person.getDevices() != null ? person.getDevices() : Collections.emptyList());
    }

    public static Person toEntity(PersonDetailsDTO personDetailsDTO) {
        return new Person(personDetailsDTO.getId(),personDetailsDTO.getId_ref(), personDetailsDTO.getDevices() != null ? personDetailsDTO.getDevices() : Collections.emptyList());
    }
}
