package ro.tuc.ds2020.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ro.tuc.ds2020.dtos.validators.annotation.AgeLimit;
import ro.tuc.ds2020.entities.Device;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PersonDetailsDTO {

    private UUID id;
    @NotNull
    private UUID id_ref;
    private List<Device> devices;
}
