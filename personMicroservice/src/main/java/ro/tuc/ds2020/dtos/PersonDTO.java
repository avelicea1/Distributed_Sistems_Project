package ro.tuc.ds2020.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;
import ro.tuc.ds2020.entities.ROLE;

import java.util.Objects;
import java.util.UUID;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PersonDTO extends RepresentationModel<PersonDTO> {
    private UUID id;
    private String name;
    private int age;
    private String email;
    private String password;
    private ROLE role;
    private String address;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PersonDTO personDTO = (PersonDTO) o;
        return age == personDTO.age &&
                Objects.equals(name, personDTO.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
}
