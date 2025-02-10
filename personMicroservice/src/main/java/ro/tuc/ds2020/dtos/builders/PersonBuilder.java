package ro.tuc.ds2020.dtos.builders;

import ro.tuc.ds2020.dtos.PersonDTO;
import ro.tuc.ds2020.dtos.PersonDetailsDTO;
import ro.tuc.ds2020.entities.Person;

public class PersonBuilder {

    private PersonBuilder() {
    }

    public static PersonDTO toPersonDTO(Person person) {
        return new PersonDTO(person.getId(), person.getName(), person.getAge(), person.getEmail(), person.getPassword(), person.getRole(), person.getAddress());
    }

    public static PersonDetailsDTO toPersonDetailsDTO(Person person) {
        return new PersonDetailsDTO(person.getId(), person.getName(), person.getAddress(), person.getAge(), person.getEmail(), person.getPassword(), person.getRole());
    }

    public static Person toEntity(PersonDetailsDTO personDetailsDTO) {
        return new Person(personDetailsDTO.getId(), personDetailsDTO.getName(),
                personDetailsDTO.getAddress(),
                personDetailsDTO.getAge(),
                personDetailsDTO.getEmail(), personDetailsDTO.getPassword(),personDetailsDTO.getRole());
    }
}
