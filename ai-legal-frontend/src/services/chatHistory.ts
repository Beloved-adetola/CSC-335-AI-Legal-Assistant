import { conversationsApi, type BackendConversation, type BackendMessage } from "./api";
import type { User } from "firebase/auth";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Convert backend message format to frontend message format
 */
function backendMessageToMessage(msg: BackendMessage): Message {
  return {
    id: msg.id,
    role: msg.role === "assistant" ? "assistant" : "user",
    content: msg.content,
    timestamp: new Date(msg.createdAt).getTime(),
  };
}

/**
 * Convert backend conversation format to frontend conversation format
 */
function backendConversationToConversation(conv: BackendConversation): ChatConversation {
  return {
    id: conv.id,
    title: conv.title || "New Conversation",
    messages: conv.messages.map(backendMessageToMessage),
    createdAt: new Date(conv.createdAt).getTime(),
    updatedAt: new Date(conv.updatedAt).getTime(),
  };
}

/**
 * Get all chat conversations for a user
 */
export async function getChatHistory(user: User | null): Promise<ChatConversation[]> {
  if (!user) return [];
  
  try {
    const conversations = await conversationsApi.getAll(user);
    return conversations.map(backendConversationToConversation);
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return [];
  }
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(
  user: User | null,
  conversationId: string
): Promise<ChatConversation | null> {
  if (!user) return null;
  
  try {
    const conversation = await conversationsApi.getById(user, conversationId);
    return backendConversationToConversation(conversation);
  } catch (error) {
    console.error("Failed to load conversation:", error);
    return null;
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  user: User | null,
  conversationId: string
): Promise<void> {
  if (!user) return;
  
  try {
    await conversationsApi.delete(user, conversationId);
    // Dispatch custom event to notify listeners (e.g., sidebar to refresh)
    window.dispatchEvent(new CustomEvent("chatHistoryUpdated", { detail: { userId: user.uid } }));
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    throw error;
  }
}

/**
 * Generate a title from the first user message
 */
export function generateConversationTitle(messages: Message[]): string {
  const firstUserMessage = messages.find((m) => m.role === "user");
  if (!firstUserMessage) return "New Conversation";
  
  const title = firstUserMessage.content.trim();
  // Limit title length
  return title.length > 60 ? title.substring(0, 60) + "..." : title;
}

// Export types for compatibility
export type { Message, ChatConversation };
