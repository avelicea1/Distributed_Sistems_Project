package ro.tuc.ds2020.dtos;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NotificationDto {
    private String userId;
    private String message;

    @JsonCreator
    public NotificationDto(@JsonProperty("userId") String userId,
                           @JsonProperty("message") String message) {
        this.userId = userId;
        this.message = message;
    }
}
