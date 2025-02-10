package ro.tuc.ds2020.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageChat {
    private String sender;
    private String receiver;
    private String content;
    private boolean seen;
    private boolean isTyping;


    // Default constructor
    public MessageChat() {}


    // Constructor
    public MessageChat(String sender, String receiver, String content) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
    }
    public MessageChat(String sender, String receiver, String content, Boolean seen) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.seen = seen;
    }
    public MessageChat(String sender, String receiver, boolean isTyping) {
        this.sender = sender;
        this.receiver = receiver;
        this.isTyping = isTyping;
    }
}
