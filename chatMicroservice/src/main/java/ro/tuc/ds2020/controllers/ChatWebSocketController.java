package ro.tuc.ds2020.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import ro.tuc.ds2020.dtos.MessageChat;
import ro.tuc.ds2020.dtos.MessageDetailsDto;
import ro.tuc.ds2020.dtos.builders.MessageBuilder;
import ro.tuc.ds2020.entities.Message;
import ro.tuc.ds2020.services.MessageService;

import java.util.*;
import java.util.stream.Collectors;

@Controller
public class ChatWebSocketController {
    private final MessageService messageService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    @Autowired
    public ChatWebSocketController(MessageService messageService, SimpMessagingTemplate simpMessagingTemplate) {
        this.messageService = messageService;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }


    @MessageMapping("/message")
    @SendTo("/chatroom/public")
    public MessageChat receivePublicMessage(@Payload MessageChat messageChat) {
        System.out.println("Received private message: receiver" + messageChat.getReceiver() + "\nsender " + messageChat.getSender() + "\ncontent "+ messageChat.getContent());

        Message message = new Message();
        message.setSender(messageChat.getSender());
        message.setContent(messageChat.getContent());
        message.setSeen(false);
        message.setTimestamp(new Date());
        messageService.insert(MessageBuilder.toMessageDetailsDto(message));
        return messageChat;
    }

    @MessageMapping("/private-message")
    public void handlePrivateMessage(@Payload MessageChat messageChat) {
        System.out.println("Received private message: receiver" + messageChat.getReceiver() + "\nsender " + messageChat.getSender() + "\ncontent "+ messageChat.getContent());
       Message message = new Message();
       message.setReceiver(messageChat.getReceiver());
       message.setSender(messageChat.getSender());
       message.setContent(messageChat.getContent());
       message.setSeen(false);
       message.setTimestamp(new Date());
       messageService.insert(MessageBuilder.toMessageDetailsDto(message));
        String destination = "/user/" + messageChat.getSender() + "/private";
        simpMessagingTemplate.convertAndSend(destination, messageChat);
    }

    @GetMapping("/fetchMessages")
    @ResponseBody
    public List<MessageChat> getMessages(@RequestParam String senderId, @RequestParam String receiverId) {
        List<Message> messages = messageService.getMessagesForChat(senderId, receiverId);
        messages.addAll(messageService.getMessagesForChat(receiverId, senderId));

        messages.sort(Comparator.comparing(Message::getTimestamp));
        return messages.stream()
                .map(message -> new MessageChat(message.getSender(), message.getReceiver(), message.getContent(), message.isSeen()))
                .collect(Collectors.toList());
    }

    @GetMapping("/fetchGroupMessages")
    @ResponseBody
    public List<MessageChat> getGroupMessages() {
        List<Message> messages = messageService.getMessagesForGroupChat();
        messages.sort(Comparator.comparing(Message::getTimestamp));
        return messages.stream()
                .map(message -> new MessageChat(
                        message.getSender(),
                        message.getReceiver(),
                        message.getContent(),
                        message.isSeen()
                ))
                .collect(Collectors.toList());
    }
    @PutMapping("/markMessagesAsSeen")
    @ResponseBody
    public  void markMessageAsSeen(@RequestParam String senderId, @RequestParam String receiverId) {
        messageService.markMessagesAsSeen(senderId, receiverId);
    }


    @MessageMapping("/typing")
    public void handleTypingNotification(@Payload MessageChat typingNotification) {
        System.out.println("Typing notification: sender=" + typingNotification.getSender() + ", receiver=" + typingNotification.getReceiver() + ", typing= " + typingNotification.isTyping());

        typingNotification.setContent("");
        typingNotification.setSeen(false);
        typingNotification.setTyping(typingNotification.isTyping());
        String destination;
        if (typingNotification.getReceiver() != null) {
            destination = "/user/" + typingNotification.getSender() + "/typing";
        } else {
            destination = "/chatroom/typing/public";
        }
        simpMessagingTemplate.convertAndSend(destination, typingNotification);
    }

    @MessageMapping("/seen")
    public void handleSeenNotification(@Payload MessageChat seenNotification) {
        System.out.println("Seen notification: sender=" + seenNotification.getSender() + ", receiver=" + seenNotification.getReceiver());

        // Update the message status in the database
        messageService.markMessagesAsSeen(seenNotification.getSender(), seenNotification.getReceiver());

        // Notify the sender that the messages are seen
        String destination = "/user/" + seenNotification.getSender() + "/seen";
        simpMessagingTemplate.convertAndSend(destination, seenNotification);
    }

}
