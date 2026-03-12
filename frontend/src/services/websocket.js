import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectWebSocket = (groupId, onMessage) => {

  if (stompClient) {
    return;
  }

  const socket = new SockJS("http://localhost:8080/ws");

  stompClient = new Client({
    webSocketFactory: () => socket,

    reconnectDelay: 5000,

    onConnect: () => {

      console.log("WebSocket Connected");

      stompClient.subscribe(`/topic/group/${groupId}`, (msg) => {
        const message = JSON.parse(msg.body);
        onMessage(message);
      });

    }
  });

  stompClient.activate();
};

export const sendMessage = (groupId, message) => {

  if (!stompClient || !stompClient.connected) {
    console.log("WebSocket still connecting...");
    return;
  }

  stompClient.publish({
    destination: `/app/chat/${groupId}`,
    body: JSON.stringify(message)
  });
};