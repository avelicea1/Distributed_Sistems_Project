package ro.tuc.ds2020.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ro.tuc.ds2020.entities.Message;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findMessagesBySenderAndReceiver(String sender, String receiver);
    List<Message> findMessagesByReceiverIsNull();
    List<Message> findAllBySenderAndReceiverAndSeenFalse(String sender, String receiver);
}
