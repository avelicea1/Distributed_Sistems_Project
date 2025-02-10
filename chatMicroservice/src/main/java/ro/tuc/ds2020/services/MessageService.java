package ro.tuc.ds2020.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import ro.tuc.ds2020.controllers.handlers.exceptions.model.ResourceNotFoundException;
import ro.tuc.ds2020.dtos.MessageDetailsDto;
import ro.tuc.ds2020.dtos.MessageDto;
import ro.tuc.ds2020.dtos.builders.MessageBuilder;
import ro.tuc.ds2020.entities.Message;
import ro.tuc.ds2020.repositories.MessageRepository;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessageService {
    private static final Logger LOGGER = LoggerFactory.getLogger(MessageService.class.getName());
    private final MessageRepository messageRepository;
    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public List<MessageDto> findMessages() {
        List<Message> messages = messageRepository.findAll();
        return messages.stream().map(MessageBuilder::toMessageDto).collect(Collectors.toList());
    }

    public MessageDetailsDto findMessageById(UUID id) {
        Optional<Message> message = messageRepository.findById(id);
        if(!message.isPresent()){
            LOGGER.error("Message not found");
            throw new ResourceNotFoundException(Message.class.getSimpleName());
        }
        return MessageBuilder.toMessageDetailsDto(message.get());
    }

    @Transactional
    public UUID insert(MessageDetailsDto messageDetailsDto) {
        Message message = MessageBuilder.toMessage(messageDetailsDto);
        message = messageRepository.save(message);
        LOGGER.info("Message inserted");
        return message.getId();
    }

    @Transactional
    public UUID update(UUID id, MessageDetailsDto messageDetailsDto) {
        Optional<Message> message = messageRepository.findById(id);
        if(!message.isPresent()){
            LOGGER.error("Message not found");
            throw new ResourceNotFoundException(Message.class.getSimpleName());
        }
        Message messageToUpdate = MessageBuilder.toMessage(messageDetailsDto);
        messageToUpdate.setId(id);
        messageToUpdate = messageRepository.save(messageToUpdate);
        LOGGER.info("Message updated");
        return messageToUpdate.getId();
    }

    @Transactional
    public void delete(UUID id) {
        Optional<Message> message = messageRepository.findById(id);
        if(!message.isPresent()){
            LOGGER.error("Message not found");
            throw new ResourceNotFoundException(Message.class.getSimpleName());
        }
        messageRepository.deleteById(id);
    }

    public void markAsSeen(UUID id) {
        Optional<Message> message = messageRepository.findById(id);
        if(!message.isPresent()){
            LOGGER.error("Message not found");
            throw new ResourceNotFoundException(Message.class.getSimpleName());
        }
        message.get().setSeen(true);
        messageRepository.save(message.get());
    }

    @Transactional
    public Message sendMessage(String content, String sender, String receiver) {
        // Create the message object
        Message message = new Message(sender, receiver, content, false);

        // Save the message to the database
        message = messageRepository.save(message);
        LOGGER.info("Message saved to database: " + message);

        return message; // Return the saved message
    }

    public List<Message> getMessagesForChat(String sender, String receiver) {
        return messageRepository.findMessagesBySenderAndReceiver(sender, receiver);
    }

    public List<Message> getMessagesForGroupChat() {
        return messageRepository.findMessagesByReceiverIsNull();
    }

    public void markMessagesAsSeen(String senderId, String receiverId) {
        List<Message> messages = messageRepository.findMessagesBySenderAndReceiver(senderId, receiverId);
        for (Message message : messages) {
            if (!message.isSeen()) {
                message.setSeen(true);
                messageRepository.save(message);
            }
        }
    }
    public List<Message> getUnseenMessages(String senderId, String receiverId) {
        return messageRepository.findAllBySenderAndReceiverAndSeenFalse(senderId, receiverId);
    }



}
