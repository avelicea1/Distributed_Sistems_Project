package ro.tuc.ds2020.dtos;


import lombok.*;

import javax.validation.constraints.NotNull;
import java.util.Date;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class MessageDetailsDto {
    private UUID id;
    @NotNull
    private String sender;
    private String receiver;
    @NotNull
    private String content;
    private boolean seen;
    private Date timestamp;

}
