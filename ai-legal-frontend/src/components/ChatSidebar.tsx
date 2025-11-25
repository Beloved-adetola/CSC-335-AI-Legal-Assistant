import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  getChatHistory,
  deleteConversation,
  type ChatConversation,
} from "@/services/chatHistory";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Trash2,
  MessageSquare,
  Menu,
  Thermometer,
  Scale,
  Sidebar,
} from "lucide-react";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { User } from "firebase/auth";

interface ChatSidebarProps {
  user: User;
  onClose?: () => void;
}

export const ChatSidebar = ({ user, onClose }: ChatSidebarProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const currentConversationId = searchParams.get("conversation");

  useEffect(() => {
    loadConversations();
  }, [user, currentConversationId]);

  // Refresh conversations when custom event is dispatched
  useEffect(() => {
    const handleHistoryUpdate = (e: CustomEvent) => {
      if (e.detail?.userId === user.uid) {
        loadConversations();
      }
    };

    window.addEventListener(
      "chatHistoryUpdated",
      handleHistoryUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "chatHistoryUpdated",
        handleHistoryUpdate as EventListener
      );
    };
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const history = await getChatHistory(user);
      setConversations(history);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete || !user) return;

    try {
      await deleteConversation(user, conversationToDelete);
      await loadConversations();
      setDeleteDialogOpen(false);
      setConversationToDelete(null);

      // If the deleted conversation is currently open, navigate to new chat
      if (currentConversationId === conversationToDelete) {
        navigate("/home");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      // Keep dialog open on error
    }
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/home?conversation=${conversationId}`);
    onClose?.();
  };

  const handleNewChat = () => {
    navigate("/home?conversation=new");
    onClose?.();
  };

  const formatConversationDate = (timestamp: number) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return "Today";
    }
    if (isYesterday(date)) {
      return "Yesterday";
    }
    if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
      // Within last 7 days
      return format(date, "EEEE"); // Day name
    }
    if (Date.now() - timestamp < 30 * 24 * 60 * 60 * 1000) {
      // Within last 30 days
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, "MMM d, yyyy");
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((acc, conv) => {
    const date = formatConversationDate(conv.updatedAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(conv);
    return acc;
  }, {} as Record<string, ChatConversation[]>);

  const sidebarContent = (
    <div className="flex flex-col h-full w-full bg-background border-r border-border">
      <div className="flex m-2 mb-5 justify-between items-center font-bold text-primary">
        <Link to={"/"} className="p-1 hover:bg-gray-300 rounded-md">
          <Scale className="h-8 w-8" />
        </Link>{" "}
        <Sidebar />
      </div>
      {/* New Chat Button */}
      <div className="p-2 border-b border-border">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2 h-10 bg-primary hover:bg-primary/90"
          variant={!currentConversationId ? "default" : "ghost"}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <p className="text-sm text-muted-foreground">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No conversations yet. Start a new chat to begin.
              </p>
            </div>
          ) : (
            Object.entries(groupedConversations).map(([date, convs]) => (
              <div key={date} className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {date}
                </div>
                <div className="space-y-1">
                  {convs.map((conversation) => {
                    const isActive = currentConversationId === conversation.id;
                    return (
                      <div
                        key={conversation.id}
                        className={`
                          group relative flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer
                          transition-colors hover:bg-accent
                          ${isActive ? "bg-accent" : ""}
                        `}
                        onClick={() => handleConversationClick(conversation.id)}
                      >
                        <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                        <span
                          className={`
                            flex-1 text-sm truncate
                            ${
                              isActive
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                            }
                          `}
                          title={conversation.title}
                        >
                          {conversation.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`
                            w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity
                            hover:bg-destructive hover:text-destructive-foreground
                          `}
                          onClick={(e) => handleDeleteClick(e, conversation.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {sidebarContent}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              conversation from your chat history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConversationToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const ChatSidebarTrigger = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClick}>
      <Menu className="w-5 h-5" />
    </Button>
  );
};
