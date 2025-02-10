package ro.tuc.ds2020.webSockets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class DeviceAlertHandler extends TextWebSocketHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(DeviceAlertHandler.class);
    private final List<WebSocketSession> sessions = new ArrayList<>();

    public void sendAlert(String message) {
        for (WebSocketSession session : sessions) {
            try {
                session.sendMessage(new TextMessage(message));
            } catch (IOException e) {
                LOGGER.error("Failed to send message: {}", message, e);
            }
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        LOGGER.info("New WebSocket connection established: {}", session.getId());
        sessions.add(session);
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        LOGGER.info("Received message: {}", message.getPayload());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        LOGGER.info("WebSocket connection closed: {}", session.getId());
        sessions.remove(session);
    }
}