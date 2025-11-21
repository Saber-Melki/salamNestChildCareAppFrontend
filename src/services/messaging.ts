// src/services/messaging.ts
import api from "../lib/api"

// Get all threads for the current logged-in user
export const getThreads = async () => {
  const res = await api.get("/messages/threads")
  return res.data
}

// Create or get a DM thread with a specific user
export const createOrGetThread = async (targetUserId: string) => {
  const res = await api.post("/messages/threads", { targetUserId })
  return res.data
}

// Get messages for a specific thread
export const getMessages = async (threadId: string) => {
  const res = await api.get(`/messages/${threadId}`)
  return res.data
}

// Send a message in a thread
export const sendMessage = async (
  threadId: string,
  text: string,
  type: "text" | "image" | "file" | "audio" = "text",
) => {
  const res = await api.post("/messages", { threadId, text, type })
  return res.data
}


// List possible recipients (parents + staff) for messaging
// 👉 Make sure your backend exposes something like:
// GET /users/messaging-recipients → [{ id, name, role, childName? }, ...]
export const getMessagingRecipients = async () => {
  const res = await api.get("/users/messaging-recipients")
  return res.data
}
