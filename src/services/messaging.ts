// src/lib/api.ts
import axios from "axios";

const API_URL = "http://localhost:3000/messages"; // ton backend NestJS

export const getMessages = async (threadId: string) => {
  const res = await axios.get(`${API_URL}/${threadId}`);
  return res.data;
};

export const sendMessage = async (threadId: string, from: "you" | "parent", text: string) => {
  const res = await axios.post(API_URL, { threadId, from, text });
  return res.data;
};
