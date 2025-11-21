// src/services/socket.ts
import { io } from "socket.io-client";

export const messagesSocket = io("http://localhost:8080/ws/messages", {
  withCredentials: true,
  auth: {
    token: localStorage.getItem("accessToken"), // your JWT
  },
});
