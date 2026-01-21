"use client";

import { useAdminAuth } from "@/hooks/use-admin-auth";
import { GeminiChatProvider } from "@/contexts/gemini-chat-context";
import ModernChatSidebar from "@/components/admin/gemini/modern-chat-sidebar";
import { Loader2 } from "lucide-react";

export default function GeminiLayout({ children }) {
  const { user } = useAdminAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <GeminiChatProvider user={user}>
      <div className="flex h-full bg-white dark:bg-gray-950 overflow-hidden">
        {/* Modern Sidebar - Layout seviyesinde, bir kez render */}
        <div className="w-80 flex-shrink-0 h-full overflow-hidden">
          <ModernChatSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 h-full overflow-hidden">{children}</div>
      </div>
    </GeminiChatProvider>
  );
}
