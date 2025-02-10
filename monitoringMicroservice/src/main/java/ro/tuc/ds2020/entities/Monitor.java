package ro.tuc.ds2020.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Monitor implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @Type(type = "uuid-binary")
    private UUID deviceId;

    @Column(name = "personId")
    @Type(type = "uuid-binary")
    private UUID personId;

    @Column(name = "mhc" , nullable = false)
    private int mhc;

    @Column(name = "lastIndex", nullable = false)
    private double lastIndex;

    @ElementCollection(fetch = FetchType.EAGER)
    @Column(name = "values", nullable = false)
    private Map<Date, Double> values;

    public Monitor(UUID id, int mhc, UUID personId) {
        this.deviceId = id;
        this.personId = personId;
        this.mhc = mhc;
        this.lastIndex = -1.0;
        this.values = new HashMap<Date, Double>();
    }
}
