package ro.tuc.ds2020.dtos;


import lombok.*;
import org.springframework.hateoas.RepresentationModel;

import java.util.Date;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class MessageDto extends RepresentationModel<MessageDto> {
    private UUID id;
    private String sender;
    private String receiver;
    private String content;
    private boolean seen;
    private Date timestamp;
}
