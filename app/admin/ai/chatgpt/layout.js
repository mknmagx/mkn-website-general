"use client";

import { useAdminAuth } from "@/hooks/use-admin-auth";
import { ChatGPTChatProvider } from "@/contexts/chatgpt-chat-context";
import ChatGPTSidebar from "@/components/admin/chatgpt/chat-sidebar";
import { useChatGPTChat } from "@/contexts/chatgpt-chat-context";
import { Loader2 } from "lucide-react";

function ChatGPTLayoutInner({ children }) {
  const {
    chats,
    activeChatId,
    chatsLoading,
    handleNewChat,
    handleChatSelect,
    handleDeleteChat,
    deleteDialogOpen,
    setDeleteDialogOpen,
    chatToDelete,
    confirmDeleteChat,
  } = useChatGPTChat();

  return (
    <div className="flex h-full bg-white dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 h-full overflow-hidden">
        <ChatGPTSidebar
          chats={chats}
          activeChatId={activeChatId}
          chatsLoading={chatsLoading}
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
          onDeleteChat={handleDeleteChat}
          deleteDialogOpen={deleteDialogOpen}
          setDeleteDialogOpen={setDeleteDialogOpen}
          chatToDelete={chatToDelete}
          onConfirmDelete={confirmDeleteChat}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-hidden">{children}</div>
    </div>
  );
}

export default function ChatGPTLayout({ children }) {
  const { user } = useAdminAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <ChatGPTChatProvider user={user}>
      <ChatGPTLayoutInner>{children}</ChatGPTLayoutInner>
    </ChatGPTChatProvider>
  );
}
