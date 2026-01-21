"use client";

import { PermissionGuard } from "@/components/admin-route-guard";
import { useGeminiChat } from "@/contexts/gemini-chat-context";
import MessageList from "@/components/admin/gemini/message-list";
import MessageInput from "@/components/admin/gemini/message-input";
import ContentVisualizePage from "@/components/admin/gemini/content-visualize-page";
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
import { MessageSquare, Trash2 } from "lucide-react";

function GeminiChatPage() {
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
  } = useGeminiChat();

  const activeChat = chats.find((c) => c.id === activeChatId);
  const isContentVisualize = activeChat?.type === "contentVisualize";

  // Render Content Visualize page if chat type is contentVisualize
  if (isContentVisualize) {
    return <ContentVisualizePage />;
  }

  // Render normal chat page
  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header - Minimalist */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 px-6 py-3 bg-white dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-gray-400 dark:text-gray-600" />
            <div>
              <h1 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {activeChat?.title || "Yeni Sohbet"}
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
            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
              {selectedModel}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          loading={loading}
          hasMoreMessages={hasMoreMessages}
          loadingMore={loadingMore}
          onLoadMore={loadMoreMessages}
        />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <MessageInput
          onSendMessage={handleSendMessage}
          loading={loading}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>

      {/* Delete Confirmation Dialog - Minimalist */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
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
                      • {chatToDelete.messageCount || 0} mesaj
                    </div>
                    {chatToDelete.imageCount > 0 && (
                      <div className="text-gray-600 dark:text-gray-400">
                        • {chatToDelete.imageCount} görsel
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bu işlem geri alınamaz.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteChat}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function GeminiPage() {
  return (
    <PermissionGuard requiredPermission="gemini.read">
      <GeminiChatPage />
    </PermissionGuard>
  );
}
