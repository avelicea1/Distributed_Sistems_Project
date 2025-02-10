package ro.tuc.ds2020.dtos.builders;


import ro.tuc.ds2020.dtos.MessageDetailsDto;
import ro.tuc.ds2020.dtos.MessageDto;
import ro.tuc.ds2020.entities.Message;

public class MessageBuilder {
    private MessageBuilder(){

    }

    public static MessageDto toMessageDto(Message message){
        return new MessageDto(message.getId(), message.getSender(), message.getReceiver() != null ? message.getReceiver() : null, message.getContent(), message.isSeen(), message.getTimestamp());
    }
    public static MessageDetailsDto toMessageDetailsDto(Message message){
        return new MessageDetailsDto(message.getId(), message.getSender(),message.getReceiver() != null ? message.getReceiver() : null, message.getContent(), message.isSeen(),  message.getTimestamp());
    }
    public static Message toMessage(MessageDetailsDto messageDetailsDto){
        return new Message(messageDetailsDto.getId(), messageDetailsDto.getSender(),messageDetailsDto.getReceiver() != null ? messageDetailsDto.getReceiver() : null, messageDetailsDto.getContent(), messageDetailsDto.isSeen(), messageDetailsDto.getTimestamp());
    }
}
