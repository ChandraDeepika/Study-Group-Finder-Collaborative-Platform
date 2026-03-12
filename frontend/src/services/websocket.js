import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;
let connected = false;

export const connectWebSocket = (groupId, onMessage) => {

  // Prevent multiple connections
  if (stompClient && connected) return;

  const socket = new SockJS("http://localhost:8080/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,

    onConnect: () => {
      console.log("WebSocket Connected");

      connected = true;

      // Subscribe to group topic
      stompClient.subscribe(`/topic/group/${groupId}`, (msg) => {
        const message = JSON.parse(msg.body);
        onMessage(message);
      });
    },

    onDisconnect: () => {
      console.log("WebSocket Disconnected");
      connected = false;
    },

    onStompError: (frame) => {
      console.error("Broker error:", frame.headers["message"]);
    }
  });

  stompClient.activate();
};

export const sendMessage = (groupId, message) => {

  if (!stompClient || !connected) {
    console.log("WebSocket not connected yet");
    return;
  }

  console.log("Sending message:", message);

  stompClient.publish({
    destination: `/app/chat/${groupId}`,
    body: JSON.stringify(message)
  });
};

export const disconnectWebSocket = () => {

  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    connected = false;
  }
};

export const isConnected = () => connected;