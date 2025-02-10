import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
    constructor() {
        this.userId = sessionStorage.getItem("id");
        this.client = null;
        this.messageHandler = null;
        this.energyHandler = null;
        this.deviceId = null;
        this.isConnected = false; 
    }

    connect(deviceId) {
        this.deviceId = deviceId;
        this.client = new Client({
            webSocketFactory: () => new SockJS('http://localhost/api-monitor/ws'),
            debug: (str) => { console.log('STOMP Client: ' + str); },
            onConnect: () => {
                console.log('Connected to WebSocket');
                this.isConnected = true; 
                this.subscribeToMessages();
                this.subscribeToDeviceConsumption();
                this.triggerConsumptionDataRequest();
            },
            onStompError: (frame) => { console.error('STOMP Error: ', frame); },
            onWebSocketError: (error) => { console.error('WebSocket Error: ', error); }
        });

        this.client.activate();
    }

    subscribeToMessages() {
        if (this.isConnected && this.userId) {
            console.log(this.userId);
            this.client.subscribe(`/topic/message/${this.userId}`, (message) => {
                this.messageHandler(message.body); 
            });
        } else {
            console.error('Not connected or User ID is not set. Cannot subscribe to messages.');
        }
    }

    subscribeToDeviceConsumption() {
        if (this.isConnected && this.deviceId) {
            console.log(`Subscribing to consumption data for device: ${this.deviceId}`);
            this.client.subscribe(`/topic/sendConsumption/${this.deviceId}`, (message) => {
                console.log('Received message: ', message.body);
                if (this.energyHandler) {
                    try {
                        const energyData = JSON.parse(message.body);
                        console.log('Parsed energy data: ', energyData);
                        this.energyHandler(energyData);
                    } catch (e) {
                        console.error('Error parsing energy data:', e);
                    }
                }
            });
        } else {
            console.error('Not connected or Device ID is not set. Cannot subscribe to device consumption.');
        }
    }

    setMessageHandler(handler) {
        this.messageHandler = handler;  
    }

    setEnergyHandler(handler) {
        this.energyHandler = handler;
    }

    triggerConsumptionDataRequest(deviceId = this.deviceId, selectedDate) {
        if (this.isConnected && deviceId && selectedDate) {
            const requestData = {
                deviceId: deviceId,
                selectedDate: selectedDate
            };
            console.log(`Requesting consumption data for device: ${deviceId} on date: ${selectedDate}`);
            this.client.publish({
                destination: `/app/sendConsumption`,
                body: JSON.stringify(requestData) 
            });
        } else {
            console.error('Not connected, Device ID, or Date is not set. Cannot trigger consumption data request.');
        }
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            console.log('Disconnected from WebSocket');
        }
    }
}

export default new WebSocketService();
