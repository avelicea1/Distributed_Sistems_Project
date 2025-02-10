import React, { useState, useEffect, useRef } from "react";
import { ListGroup, ListGroupItem, Input, Button, Card } from "reactstrap";
import WebSocketServiceChat from './socketChat';
import "./ChatPage.css"; // Add CSS for layout styling
import * as API_USERS from "../person/api/person-api"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserShield } from '@fortawesome/free-solid-svg-icons';
import * as API_CHAT from "./chat-api";

const ChatPage = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [userRole, setUserRole] = useState(sessionStorage.getItem('role') || 'CLIENT');
    const [isGroupChat, setIsGroupChat] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeout = useRef({});
    const [typingUsers, setTypingUsers] = useState({});
    const chatAreaRef = useRef(null);

    useEffect(() => {
        WebSocketServiceChat.connect();
        WebSocketServiceChat.onConnectCallback = () => {
            WebSocketServiceChat.subscribeToPublic((msg) => handleIncomingMessage(msg));
            if (isGroupChat) WebSocketServiceChat.subscribeToTypingStatus(null, (typingStatus) => handleTyping(typingStatus));
            if (selectedUser) {
                fetchMessages(currentUser, selectedUser.id, (messages) => {
                    if (messages) {
                        setMessages(messages); // Update the messages state with fetched messages
                    }
                });
                WebSocketServiceChat.subscribeToPrivate(selectedUser.id, (msg) => handleIncomingMessage(msg));
                WebSocketServiceChat.subscribeToTypingStatus(selectedUser.id, (typingStatus) => handleTyping(typingStatus));
                WebSocketServiceChat.subscribeToSeenNotifications(selectedUser.id, (seenNotification) => {
                    console.log("Seen notification received: ", seenNotification);
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg.sender === currentUser ? { ...msg, seen: true } : msg
                        )
                    );
                });
            }
        };
        fetchAllUsers();
        return () => {
            WebSocketServiceChat.disconnect();
            if (selectedUser) {
                WebSocketServiceChat.unsubscribeFromPrivate(selectedUser.id);
                WebSocketServiceChat.unsubscribeFromTypingStatus(selectedUser.id);
                WebSocketServiceChat.unsubscribeFromSeenNotifications(selectedUser.id);
            }
        };
    }, [selectedUser, isGroupChat]);

    const fetchMessages = (currentUser, userId) => {
        API_CHAT.getMessages(currentUser, userId, (result, status, err) => {
            if (result !== null && status === 200) {
                setMessages(result);
            } else {
                console.error("Error fetching messages:", err);
            }
        }
        )
    };


    const fetchAllUsers = () => {
        API_USERS.getPersons((result, status, err) => {
            if (result !== null && status === 200) {
                const adminUsers = result.filter(user => user.role === "ADMIN" && user.id !== currentUser);
                const clientUsers = result.filter(user => user.role === "CLIENT" && user.id !== currentUser);

                setAdmins(adminUsers);
                setClients(clientUsers);

                setUsers(result);
            } else {
                console.error("Error fetching users:", err);
            }
        });
    };

    const handleUserSelect = (user) => {
        setIsGroupChat(false);
        setSelectedUser(user);
        setMessages([]);

        WebSocketServiceChat.subscribeToPrivate(user.id, (message) => {
            console.log("Private message received from user", message);
            handleIncomingMessage(message);
        });
        WebSocketServiceChat.sendSeenNotification({
            sender: currentUser,
            receiver: user.id,
        });
    };


    const handleGroupChatSelect = () => {
        setIsGroupChat(true);
        setSelectedUser(null);
        setMessages([]);

        API_CHAT.getGroupMessages((result, status, err) => {
            if (result !== null && status === 200) {
                setMessages(result);
            } else {
                console.error("Error fetching group messages:", err);
            }
        });
    };

    const showMessageNotification = (message) => {
        const notificationDiv = document.createElement('div');
        notificationDiv.style.position = 'fixed';
        notificationDiv.style.bottom = '20px';
        notificationDiv.style.left = '50%';
        notificationDiv.style.transform = 'translateX(-50%)';
        notificationDiv.style.backgroundColor = '#333';
        notificationDiv.style.color = 'white';
        notificationDiv.style.padding = '10px 20px';
        notificationDiv.style.borderRadius = '5px';
        notificationDiv.style.fontSize = '16px';
        notificationDiv.style.zIndex = '9999';
        notificationDiv.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        notificationDiv.innerText = message;
        document.body.appendChild(notificationDiv);
        setTimeout(() => {
            document.body.removeChild(notificationDiv);
        }, 2000);
    };

    const handleIncomingMessage = (newMessage) => {
        console.log("Received message: ", newMessage);

        if (newMessage.sender === currentUser) {
            console.log("Ignoring duplicate message from self");
            return;
        }

        const senderName = getSenderName(newMessage.sender);
        const notificationMessage = `New message from ${senderName}: ${newMessage.content}`;
        showMessageNotification(notificationMessage);
        
        setMessages((prevMessages) => {
            return [
                ...prevMessages,
                newMessage,
            ];
        });
    };

    const handleTyping = (typingStatus) => {

        console.log("Typing Event Received:", typingStatus);

        setTypingUsers((prev) => {
            const updated = { ...prev, [typingStatus.sender]: typingStatus.typing };
            console.log("Updated Typing Users:", updated);
            return updated;
        });
    };

    const handleTypingChange = (event) => {
        const content = event.target.value;
        setMessage(content);

        if (content.trim()) {

            WebSocketServiceChat.sendTypingStatus({
                sender: currentUser,
                receiver: isGroupChat ? null : selectedUser?.id,
                typing: true,
                seen: true,
                content: "",
            });
            console.log("Typing status sent: true");


            if (typingTimeout.current[currentUser]) {
                clearTimeout(typingTimeout.current[currentUser]);
            }


            typingTimeout.current[currentUser] = setTimeout(() => {
                WebSocketServiceChat.sendTypingStatus({
                    sender: currentUser,
                    receiver: isGroupChat ? null : selectedUser?.id,
                    typing: false,
                    seen: true
                });
                console.log("Typing status sent: false");
            }, 1000);
        }
    };

    const sendMessage = () => {
        if (!message.trim()) return;

        const newMessage = {
            sender: currentUser,
            content: message,
            seen: false
        };

        if (isGroupChat) {

            if (userRole === "ADMIN") {
                WebSocketServiceChat.sendPublicMessage(newMessage);

                setMessages(prevMessages => [
                    ...prevMessages,
                    newMessage,
                ]);
            } else {
                alert("Only admins can send messages in the group chat!");
            }
        } else if (selectedUser) {

            WebSocketServiceChat.sendPrivateMessage({
                ...newMessage,
                receiver: selectedUser.id,
            });

            setMessages(prevMessages => [
                ...prevMessages,
                newMessage,
            ]);
        }

        setMessage("");
    };

    const getSenderName = (senderId) => {
        const sender = users.find(user => user.id === senderId);
        return sender.name;
    };

    const getTypingUsersNames = () => {
        return Object.keys(typingUsers)
            .filter((userId) => typingUsers[userId] && userId !== currentUser)
            .map((userId) => getSenderName(userId));
    };


    const handleScroll = () => {
        if (chatAreaRef.current) {
            const isAtBottom = chatAreaRef.current.scrollHeight === chatAreaRef.current.scrollTop + chatAreaRef.current.clientHeight;

            if (isAtBottom) {
                if (selectedUser) {
                    WebSocketServiceChat.sendSeenNotification({
                        sender: currentUser,
                        receiver: selectedUser.id,
                    });
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg.sender !== currentUser && !msg.seen ? { ...msg, seen: true } : msg
                        )
                    );
                }
            }
        }
    };

    const handleClick = () => {
        if (selectedUser) {
            WebSocketServiceChat.sendSeenNotification({
                sender: currentUser,
                receiver: selectedUser.id,
            });

            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.sender !== currentUser && !msg.seen ? { ...msg, seen: true } : msg
                )
            );
        }
    }


    const isUserTyping = (userId) => typingUsers[userId] || false;
    return (
        <div className="chat-container">
            <div className="user-list">
                <h5>Inbox</h5>
                <ListGroup>
                    <ListGroupItem
                        onClick={handleGroupChatSelect}
                        active={isGroupChat}
                        style={{ cursor: "pointer" }}
                    >
                        <FontAwesomeIcon icon={faUsers} style={{ marginRight: "10px" }} />
                        Group Chat
                    </ListGroupItem>
                    {userRole === "ADMIN" && clients.map((user) => (
                        <ListGroupItem
                            key={user.id}
                            onClick={() => handleUserSelect(user)}
                            active={selectedUser?.id === user.id}
                            style={{ cursor: "pointer" }}
                        >
                            {user.name}
                            {isUserTyping(user.id) && <span className="typing-indicator"> (Typing...)</span>}
                        </ListGroupItem>
                    ))}
                    {userRole === "CLIENT" && admins.map((user) => (
                        <ListGroupItem
                            key={user.id}
                            onClick={() => handleUserSelect(user)}
                            active={selectedUser?.id === user.id}
                            style={{ cursor: "pointer" }}
                        >
                            {user.name}
                            {isUserTyping(user.id) && <span className="typing-indicator"> (Typing...)</span>}
                        </ListGroupItem>
                    ))}
                </ListGroup>
            </div>

            <div className="chat-area" ref={chatAreaRef} onScroll={handleScroll}>
                <Card className="chat-box">
                    <h5>
                        {isGroupChat
                            ? "Group Chat"
                            : selectedUser
                                ? `Chat with ${selectedUser.name}`
                                : "Select a chat"}
                    </h5>
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender === currentUser ? "sent" : "received"}`}>
                                <strong>{msg.sender === currentUser ? "You" : getSenderName(msg.sender)}:</strong> {msg.content}
                                {msg.sender === currentUser && !isGroupChat && (
                                    <span className="status">{msg.seen ? "Seen" : "Delivered"}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {!isGroupChat && selectedUser && typingUsers[selectedUser.id] && (
                        <p className="typing-indicator">{getSenderName(selectedUser.id)} is typing...</p>
                    )}
                    {isGroupChat && getTypingUsersNames().length > 0 && (
                        <p className="typing-indicator">
                            {getTypingUsersNames().join(", ")} {getTypingUsersNames().length > 1 ? "are" : "is"} typing...
                        </p>
                    )}
                    {(isGroupChat && userRole === "ADMIN") || (!isGroupChat && selectedUser) ? (
                        <>
                            <Input
                                type="text"
                                value={message}
                                onChange={handleTypingChange}
                                placeholder="Type a message..."
                                onClick={handleClick}
                            />
                            <Button color="primary" block onClick={sendMessage}>
                                Send
                            </Button>
                        </>
                    ) : (
                        isGroupChat && <p className="text-muted">Only admins can send messages in this chat.</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ChatPage;