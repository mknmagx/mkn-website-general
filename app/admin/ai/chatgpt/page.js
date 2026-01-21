"use client";

import { PermissionGuard, usePermissions } from "@/components/admin-route-guard";
import { useChatGPTChat } from "@/contexts/chatgpt-chat-context";
import ChatGPTMessageList from "@/components/admin/chatgpt/message-list";
import ChatGPTMessageInput from "@/components/admin/chatgpt/message-input";
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
import { Bot, Trash2 } from "lucide-react";

function ChatGPTChatPage() {
  const { hasPermission } = usePermissions();
  const {
    chats,
    activeChatId,
    messages,
    loading,
    selectedModel,
    deleteDialogOpen,
    chatToDelete,
    hasMoreMessages,
    loadingMore,
    setSelectedModel,
    setDeleteDialogOpen,
    handleSendMessage,
    confirmDeleteChat,
    loadMoreMessages,
  } = useChatGPTChat();

  const activeChat = chats.find((c) => c.id === activeChatId);
  
  // Permission checks
  const canWrite = hasPermission("chatgpt.write") || hasPermission("chatgpt.admin");
  const canDelete = hasPermission("chatgpt.delete") || hasPermission("chatgpt.admin");

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header - Minimalist Modern */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 px-6 py-3 bg-white dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {activeChat?.title || "ChatGPT Sohbet"}
              </h1>
              {activeChat && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activeChat.messageCount || 0} mesaj
                </p>
              )}
            </div>
          </div>
          {/* Model Badge */}
          {selectedModel && (
            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
              {selectedModel}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatGPTMessageList
          messages={messages}
          loading={loading}
          hasMoreMessages={hasMoreMessages}
          loadingMore={loadingMore}
          onLoadMore={loadMoreMessages}
        />
      </div>

      {/* Input - Only show if user has write permission */}
      {canWrite && (
        <div className="flex-shrink-0">
          <ChatGPTMessageInput
            onSendMessage={handleSendMessage}
            loading={loading}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-red-500" />
              Sohbeti Sil
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    "{chatToDelete?.title}"
                  </span>{" "}
                  sohbetini silmek istediğinizden emin misiniz?
                </p>
                {chatToDelete && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-1 text-xs">
                    <div className="text-gray-600 dark:text-gray-400">
                      • {chatToDelete.messageCount || 0} mesaj silinecek
                    </div>
                  </div>
                )}
                <p className="text-xs text-red-500">
                  Bu işlem geri alınamaz.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteChat}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ChatGPTPage() {
  return (
    <PermissionGuard requiredPermission="chatgpt.read">
      <ChatGPTChatPage />
    </PermissionGuard>
  );
}
