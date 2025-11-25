import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import {
  getConversation,
  type Message,
} from "@/services/chatHistory";
import { assistantApi } from "@/services/api";
import type { User as FirebaseUser } from "firebase/auth";

const initialMessage: Message = {
  id: "1",
  role: "assistant",
  content:
    "Hello! I'm LegaLens, your AI legal assistant. I can help you with legal research, contract analysis, and answering legal questions. How can I assist you today?",
};

interface ChatInterfaceProps {
  user: FirebaseUser;
}

const ChatInterface = ({ user }: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const conversationIdRef = useRef<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");

  // Load conversation from history if conversationId is in URL
  useEffect(() => {
    const conversationId = searchParams.get("conversation");

    if (conversationId && conversationId !== "new") {
      getConversation(user, conversationId)
        .then((conversation) => {
          if (conversation) {
            conversationIdRef.current = conversation.id;
            setMessages(conversation.messages.length > 0 ? conversation.messages : [initialMessage]);
            return;
          }

          conversationIdRef.current = null;
          setMessages([initialMessage]);
          navigate("/home", { replace: true });
        })
        .catch((error) => {
          console.error("Failed to load conversation:", error);
          conversationIdRef.current = null;
          setMessages([initialMessage]);
          navigate("/home", { replace: true });
        });
      return;
    }

    // Handle ?conversation=new or no query params as a fresh chat
    conversationIdRef.current = null;
    setMessages([initialMessage]);

    if (conversationId === "new") {
      navigate("/home", { replace: true });
    }
  }, [searchParams, user, navigate]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: `temp_${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    const questionText = input.trim();
    setInput("");

    // Optimistically add user message
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      // Call the assistant API
      const response = await assistantApi.sendMessage(user, {
        question: questionText,
        conversationId: conversationIdRef.current || undefined,
      });

      // Update conversation ID if it was created
      if (response.conversationId) {
        conversationIdRef.current = response.conversationId;
        // Update URL to include conversation ID if not already set
        if (!searchParams.get("conversation")) {
          navigate(`/home?conversation=${response.conversationId}`, { replace: true });
        }
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: response.assistant,
        timestamp: Date.now(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Dispatch event to refresh sidebar
      window.dispatchEvent(new CustomEvent("chatHistoryUpdated", { detail: { userId: user.uid } }));
    } catch (error) {
      console.error("Failed to send message:", error);
      
      // Remove the optimistically added user message on error
      setMessages(messages);
      setInput(questionText);
      
      // Show error message to user
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: Date.now(),
      };
      setMessages([...messages, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
        <div className="max-w-3xl mx-auto py-8">
          {/* Welcome Message - Only show when no conversation */}
          {messages.length === 1 && messages[0].id === "1" && (
            <div className="flex items-center justify-center min-h-[60vh] mb-8">
              <div className="text-center max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                  LegaLens
                </h1>
                <p className="text-lg text-muted-foreground">
                  Get instant AI-powered legal insights and guidance. Ask me
                  anything about legal research, contract analysis, or legal
                  questions.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-2xl px-5 py-4 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-accent/10 text-foreground ml-auto"
                      : "bg-card text-card-foreground border border-border"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-background">
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your legal question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-background"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="bg-primary hover:bg-primary/90 flex-shrink-0"
              disabled={!input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This AI assistant provides general legal information only and does
            not constitute legal advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
