package ro.tuc.ds2020.dtos;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;
import ro.tuc.ds2020.entities.Person;

import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DeviceDto extends RepresentationModel<DeviceDto> {
    private UUID id;
    private String description;
    private String address;
    private int mhc;
    private Person person;
}
