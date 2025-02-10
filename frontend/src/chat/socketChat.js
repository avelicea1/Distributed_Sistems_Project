import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketServiceChat {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.onConnectCallback = null;
        this.subscriptions = {
            public: null,
            private: {},
            typing: {},
            seen: {},
        };
    }

    connect() {
        this.client = new Client({
            webSocketFactory: () => new SockJS('http://localhost/api-chat/ws'),
            debug: (str) => console.log('STOMP Client: ' + str),
            onConnect: () => {
                console.log('Connected to WebSocket');
                this.isConnected = true;
                if (this.onConnectCallback) this.onConnectCallback();
            },
            onWebSocketError: (error) => console.error('WebSocket Error: ', error),
            onStompError: (frame) => console.error('STOMP Error: ', frame),
        });

        this.client.activate();
    }

    subscribeToPublic(handler) {
        if (this.isConnected) {
            this.subscriptions.public = this.client.subscribe("/chatroom/public", (message) => {
                console.log("In subscribe to public: ", message);
                handler(JSON.parse(message.body));
            });
        } else {
            console.warn("WebSocket not connected. Cannot subscribe to public chat.");
        }
    }

    subscribeToPrivate(userId, handler) {
        if (this.isConnected) {
            console.log(`Subscribing to private chat with user: ${userId}`);
            this.subscriptions.private[userId] = this.client.subscribe(`/user/${userId}/private`, (message) => {
                console.log("Private message received: ", message);
                handler(JSON.parse(message.body));
            });
        } else {
            console.warn('WebSocket not connected. Cannot subscribe to private chat.');
        }
    }

    subscribeToTypingStatus(receiverId, handler) {
        if (this.isConnected) {
            const destination = receiverId ? `/user/${receiverId}/typing` : "/chatroom/typing/public";
            console.log("Subscribing to typing status at: ", destination);

            this.subscriptions.typing[receiverId] = this.client.subscribe(destination, (message) => {
                console.log("Typing status update received: ", message);
                handler(JSON.parse(message.body));
            });
        } else {
            console.warn("WebSocket not connected. Cannot subscribe to typing status.");
        }
    }

    subscribeToSeenNotifications(userId, handler) {
        if (this.isConnected) {
            const destination = `/user/${userId}/seen`;
            console.log("Subscribing to seen notifications at: ", destination);

            this.subscriptions.seen[userId] = this.client.subscribe(destination, (message) => {
                console.log("Seen notification update received: ", message);
                handler(JSON.parse(message.body));
            });
        } else {
            console.warn("WebSocket not connected. Cannot subscribe to seen notifications.");
        }
    }

    sendPublicMessage(message) {
        if (this.isConnected) {
            console.log("Sending public message: ", message);
            const messageObject = {
                sender: message.sender,
                content: message.content,
            };

            this.client.publish({
                destination: "/app/message", 
                body: JSON.stringify(messageObject), 
            });
        } else {
            console.error("WebSocket not connected. Cannot send public message.");
        }
    }

    sendPrivateMessage(message) {
        if (this.isConnected) {
            console.log("Sending private message: ", message);
            const messageObject = {
                sender: message.sender,
                receiver: message.receiver,
                content: message.content,
            };

            this.client.publish({
                destination: "/app/private-message", 
                body: JSON.stringify(messageObject), 
            });
        } else {
            console.error("WebSocket not connected. Cannot send private message.");
        }
    }

    sendTypingStatus(typingStatus) {
        if (this.isConnected) {
            const message = {
                sender: typingStatus.sender,
                receiver: typingStatus.receiver,
                content: typingStatus.content,
                seen: typingStatus.seen,
                typing: typingStatus.typing,
            };
            console.log("Sending typing status: ", message);

            this.client.publish({
                destination: "/app/typing", 
                body: JSON.stringify(message), 
            });
        } else {
            console.error("WebSocket not connected. Cannot send typing status.");
        }
    }

    sendSeenNotification(seenNotification) {
        if (this.isConnected) {
            const message = {
                sender: seenNotification.sender,
                receiver: seenNotification.receiver,
            };
            console.log("Sending seen notification: ", message);

            this.client.publish({
                destination: "/app/seen", 
                body: JSON.stringify(message), 
            });
        } else {
            console.error("WebSocket not connected. Cannot send seen notification.");
        }
    }

    unsubscribeFromPublic() {
        if (this.subscriptions.public) {
            this.subscriptions.public.unsubscribe();
            this.subscriptions.public = null;
            console.log("Unsubscribed from public chat.");
        } else {
            console.warn("No active subscription to public chat.");
        }
    }

    
    unsubscribeFromPrivate(userId) {
        if (this.subscriptions.private[userId]) {
            this.subscriptions.private[userId].unsubscribe();
            this.subscriptions.private[userId] = null;
            console.log(`Unsubscribed from private chat with user: ${userId}`);
        } else {
            console.warn(`No active subscription to private chat with user: ${userId}`);
        }
    }

    
    unsubscribeFromTypingStatus(receiverId) {
        if (this.subscriptions.typing[receiverId]) {
            this.subscriptions.typing[receiverId].unsubscribe();
            this.subscriptions.typing[receiverId] = null;
            console.log(`Unsubscribed from typing status updates for user: ${receiverId}`);
        } else {
            console.warn(`No active subscription to typing status for user: ${receiverId}`);
        }
    }

    
    unsubscribeFromSeenNotifications(userId) {
        if (this.subscriptions.seen[userId]) {
            this.subscriptions.seen[userId].unsubscribe();
            this.subscriptions.seen[userId] = null;
            console.log(`Unsubscribed from seen notifications for user: ${userId}`);
        } else {
            console.warn(`No active subscription to seen notifications for user: ${userId}`);
        }
    }

   
    disconnect() {
        if (this.client) {
            console.log("Disconnecting WebSocket...");
            this.client.deactivate();
            this.isConnected = false;
        }
    }
}

export default new WebSocketServiceChat();
