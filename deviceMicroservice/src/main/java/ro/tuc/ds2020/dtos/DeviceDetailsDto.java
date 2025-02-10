package ro.tuc.ds2020.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ro.tuc.ds2020.entities.Person;

import javax.validation.constraints.NotNull;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DeviceDetailsDto {
    private UUID id;
    @NotNull
    private String description;
    @NotNull
    private String address;
    @NotNull
    private int mhc;
    private Person person;
}
