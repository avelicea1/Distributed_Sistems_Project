package ro.tuc.ds2020.entities;

import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import java.io.Serializable;
import java.util.Date;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Message implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Type(type = "uuid-binary")
    private UUID id;

    @Column(name = "sender", nullable = false)
    private String sender;

    @Column(name = "receiver")
    private String receiver;

    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "seen", nullable = false)
    private boolean seen;

    @Column(name = "timestamp")
    private Date timestamp;


    public Message(String sender, String receiver, String content, boolean seen) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.seen = seen;
    }

}
