import type { User } from "firebase/auth";

const API_BASE_URL = "https://csc-335-backend.onrender.com";

/**
 * Get Firebase auth token for the current user
 */
async function getAuthToken(user: User | null): Promise<string | null> {
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { user?: User | null } = {}
): Promise<T> {
  const { user, ...fetchOptions } = options;
  
  const token = user ? await getAuthToken(user) : null;
  if (!token && user) {
    throw new Error("Failed to get authentication token");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...fetchOptions.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * API types matching the backend Prisma schema
 */
export interface BackendMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  conversationId: string;
}

export interface BackendConversation {
  id: string;
  title: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages: BackendMessage[];
}

/**
 * Assistant API
 */
export interface AssistantRequest {
  question: string;
  conversationId?: string;
  systemPrompt?: string;
}

export interface AssistantResponse {
  conversationId: string;
  assistant: string;
  raw?: any;
}

export const assistantApi = {
  /**
   * Send a message to the assistant
   */
  async sendMessage(
    user: User | null,
    data: AssistantRequest
  ): Promise<AssistantResponse> {
    return apiRequest<AssistantResponse>("/assistant", {
      method: "POST",
      body: JSON.stringify(data),
      user,
    });
  },
};

/**
 * Conversations API
 */
export const conversationsApi = {
  /**
   * Get all conversations for the current user
   */
  async getAll(user: User | null): Promise<BackendConversation[]> {
    return apiRequest<BackendConversation[]>("/conversations", {
      method: "GET",
      user,
    });
  },

  /**
   * Get a single conversation by ID
   */
  async getById(
    user: User | null,
    conversationId: string
  ): Promise<BackendConversation> {
    return apiRequest<BackendConversation>(`/conversations/${conversationId}`, {
      method: "GET",
      user,
    });
  },

  /**
   * Delete a conversation
   */
  async delete(user: User | null, conversationId: string): Promise<void> {
    return apiRequest<void>(`/conversations/${conversationId}`, {
      method: "DELETE",
      user,
    });
  },
};

