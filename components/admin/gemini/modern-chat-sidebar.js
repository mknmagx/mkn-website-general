"use client";

import { useState } from "react";
import { useGeminiChat } from "@/contexts/gemini-chat-context";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import {
  Plus,
  MessageSquare,
  Trash2,
  Loader2,
  Clock,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";

export default function ModernChatSidebar() {
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
  } = useGeminiChat();

  const [hoveredChatId, setHoveredChatId] = useState(null);

  // Group chats by date
  const groupChatsByDate = (chats) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups = {
      today: [],
      yesterday: [],
      lastWeek: [],
      older: [],
    };

    chats.forEach((chat) => {
      const chatDate = chat.createdAt?.toDate?.() || new Date(chat.createdAt);

      if (chatDate.toDateString() === today.toDateString()) {
        groups.today.push(chat);
      } else if (chatDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(chat);
      } else if (chatDate > lastWeek) {
        groups.lastWeek.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };

  const groupedChats = groupChatsByDate(chats);

  const renderChatGroup = (title, chatList) => {
    if (chatList.length === 0) return null;

    return (
      <div className="mb-6 w-full overflow-hidden">
        <div className="flex items-center gap-2 px-3 mb-2">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
        </div>
        <div className="space-y-0.5 w-full overflow-hidden">
          {chatList.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={activeChatId === chat.id}
              isHovered={hoveredChatId === chat.id}
              onSelect={() => handleChatSelect(chat.id)}
              onDelete={() => handleDeleteChat(chat.id)}
              onHover={() => setHoveredChatId(chat.id)}
              onLeave={() => setHoveredChatId(null)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Sohbetler
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {chats.length} toplam sohbet
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => handleNewChat("chat")}
            className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 transition-colors"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Sohbet
          </Button>

          <Button
            onClick={() => handleNewChat("contentVisualize")}
            variant="outline"
            className="w-full border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 transition-colors"
            size="sm"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            İçerik Görseli Oluştur
          </Button>
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
        <div className="p-3 w-full">
          {chatsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Henüz sohbet yok
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Yeni bir sohbet başlatın
              </p>
            </div>
          ) : (
            <>
              {renderChatGroup("Bugün", groupedChats.today)}
              {renderChatGroup("Dün", groupedChats.yesterday)}
              {renderChatGroup("Son 7 Gün", groupedChats.lastWeek)}
              {renderChatGroup("Daha Eski", groupedChats.older)}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-400 dark:text-gray-600 text-center">
          Google Gemini
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Sohbeti Sil
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>{chatToDelete?.title}</strong> adlı sohbeti silmek üzeresiniz.
                </p>
                {chatToDelete && (
                  <ul className="text-sm space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                    <li>{chatToDelete.messageCount} mesaj silinecek</li>
                    {chatToDelete.imageCount > 0 && (
                      <li>{chatToDelete.imageCount} görsel silinecek</li>
                    )}
                  </ul>
                )}
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                  Bu işlem geri alınamaz!
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

function ChatItem({
  chat,
  isActive,
  isHovered,
  onSelect,
  onDelete,
  onHover,
  onLeave,
}) {
  const isContentVisualize = chat.type === "contentVisualize";

  return (
    <div
      className={cn(
        "group relative transition-all duration-200 w-full",
        isActive
          ? "bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent"
          : "hover:bg-gray-50/50 dark:hover:bg-gray-900/50"
      )}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Active Indicator Line */}
      {isActive && (
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-[2px] rounded-r-full transition-colors",
          isContentVisualize 
            ? "bg-gradient-to-b from-purple-500 to-pink-500" 
            : "bg-gray-900 dark:bg-white"
        )} />
      )}

      <div className="flex items-center gap-3 px-4 py-3 w-full">
        {/* Clickable Chat Area */}
        <div 
          onClick={onSelect}
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
        >
          {/* Icon */}
          {isContentVisualize ? (
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
              isActive
                ? "bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm"
                : "bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-500/10 dark:to-pink-500/10"
            )}>
              <ImageIcon className={cn(
                "w-4 h-4 transition-colors",
                isActive ? "text-white" : "text-purple-600 dark:text-purple-400"
              )} />
            </div>
          ) : (
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
              isActive
                ? "bg-gray-200 dark:bg-gray-700"
                : "bg-gray-100 dark:bg-gray-800"
            )}>
              <MessageSquare className={cn(
                "w-4 h-4 transition-colors",
                isActive
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400"
              )} />
            </div>
          )}

          {/* Chat Info */}
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-[13px] font-medium truncate transition-colors leading-tight",
              isActive
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-700 dark:text-gray-300"
            )}>
              {chat.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={cn(
                "text-[11px] transition-colors",
                isActive
                  ? "text-gray-600 dark:text-gray-400"
                  : "text-gray-500 dark:text-gray-500"
              )}>
                {chat.messageCount || 0} mesaj
              </span>
              {isContentVisualize && (
                <>
                  <span className="text-gray-400 dark:text-gray-600">•</span>
                  <span className="text-[11px] text-purple-600 dark:text-purple-400">
                    Görsel
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-8 h-8 rounded-lg transition-all",
              "opacity-0 group-hover:opacity-100",
              "text-gray-400 hover:text-red-600 dark:hover:text-red-400",
              "hover:bg-red-50 dark:hover:bg-red-950/30"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
