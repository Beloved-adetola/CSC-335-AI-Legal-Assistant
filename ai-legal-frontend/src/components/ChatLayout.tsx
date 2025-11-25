import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatSidebar, ChatSidebarTrigger } from "./ChatSidebar";
import ChatInterface from "./ChatInterface";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, UserRound } from "lucide-react";
import { signOut } from "firebase/auth";
import { Auth } from "@/config/firebase";
import { useToast } from "@/hooks/use-toast";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);

    // Set initial value
    setMatches(media.matches);

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
};

export const ChatLayout = () => {
  const { user, loading } = useFirebaseAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Loading your workspace...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const SidebarContent = () => (
    <ChatSidebar user={user} onClose={() => setSidebarOpen(false)} />
  );

  const handleLogout = async () => {
    try {
      await signOut(Auth);
      toast({
        title: "Signed out",
        description: "You have been logged out successfully.",
      });
      navigate("/login", { replace: true });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const userEmail = user.email ?? "Unknown user";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar - Always visible on large screens */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-shrink-0 lg:h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar - Sheet/Drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && (
              <ChatSidebarTrigger onClick={() => setSidebarOpen(true)} />
            )}
            <h1 className="text-lg font-semibold">LegalAI Assistant</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5"
              >
                <UserRound className="h-4 w-4" />
                <span className="text-sm">
                  {user.email?.split("@")[0] ?? "Profile"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">
                Signed in as
              </DropdownMenuLabel>
              <div className="px-3 py-2">
                <p className="text-sm font-medium truncate">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onSelect={(event) => {
                  event.preventDefault();
                  handleLogout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface user={user} />
        </div>
      </main>
    </div>
  );
};
