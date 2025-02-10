package ro.tuc.ds2020.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;

import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MonitorDto extends RepresentationModel<MonitorDto> {
    private UUID deviceId;
    private UUID personId;
    private int mhc;
    private double lastIndex;
    private Map<Date, Double> values;
}
