package ro.tuc.ds2020.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class MonitorDetailsDto {
    private UUID deviceId;
    private UUID personId;
    private int mhc;
    private double lastIndex;
    private Map<Date, Double> values;

    public MonitorDetailsDto(UUID deviceId, int mhc, UUID personId) {
        this.deviceId = deviceId;
        this.mhc = mhc;
        this.personId = personId;
        this.values = new HashMap<>();
    }
}
