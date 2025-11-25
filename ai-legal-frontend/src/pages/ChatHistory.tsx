import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getChatHistory, deleteConversation, ChatConversation } from "@/services/chatHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, Trash2, MessageSquare, Clock, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
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
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

export default function ChatHistory() {
  const { user, loading } = useFirebaseAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const history = await getChatHistory(user);
      setConversations(history);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const handleDeleteClick = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !conversationToDelete) return;
    
    try {
      await deleteConversation(user, conversationToDelete);
      await loadConversations();
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      // Keep dialog open on error
    }
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/home?conversation=${conversationId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading chat history...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/90 transition-colors mb-4"
          >
            <Scale className="h-8 w-8" />
            LegalAI Assistant
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Chat History</h1>
              <p className="text-muted-foreground">
                View and manage your past conversations
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/home")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <Card className="border-border/50 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No conversations yet
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Start chatting to create your first conversation. Your chat history will appear here.
              </p>
              <Button onClick={() => navigate("/home")}>
                Start New Conversation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="border-border/50 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {conversation.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3" />
                        {format(new Date(conversation.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(conversation.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {conversation.messages.length} message
                      {conversation.messages.length !== 1 ? "s" : ""}
                    </div>
                    {conversation.messages.length > 0 && (
                      <div className="text-sm text-foreground line-clamp-2">
                        {conversation.messages[0].role === "user"
                          ? conversation.messages[0].content
                          : conversation.messages.find((m) => m.role === "user")?.content ||
                            "Conversation"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
}

