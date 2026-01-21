"use client";

import { useGeminiChat } from "@/contexts/gemini-chat-context";
import ContentVisualizeMessageList from "@/components/admin/gemini/content-visualize-message-list";
import ContentVisualizeMessageInput from "@/components/admin/gemini/content-visualize-message-input";
import { ImageIcon, Sparkles } from "lucide-react";

export default function ContentVisualizePage() {
  const {
    messages,
    loading,
    hasMoreMessages,
    loadingMore,
    selectedContentId,
    selectedContentTitle,
    contentList,
    handleSendMessage,
    loadMoreMessages,
    handleContentSelect,
    handleContentClear,
  } = useGeminiChat();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 px-6 py-3 bg-white dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                İçerik Görseli Oluştur
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </h1>
              {selectedContentTitle ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedContentTitle}
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  İçerik seçin ve görsel oluşturun
                </p>
              )}
            </div>
          </div>
          {/* Model Badge - Fixed */}
          <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md text-xs text-purple-700 dark:text-purple-300 font-medium">
            Gemini 3 Pro Image
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ContentVisualizeMessageList
          messages={messages}
          loading={loading}
          hasMoreMessages={hasMoreMessages}
          loadingMore={loadingMore}
          onLoadMore={loadMoreMessages}
          selectedContentTitle={selectedContentTitle}
        />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <ContentVisualizeMessageInput
          onSendMessage={handleSendMessage}
          loading={loading}
          selectedContentId={selectedContentId}
          selectedContentTitle={selectedContentTitle}
          onContentSelect={handleContentSelect}
          onContentClear={handleContentClear}
          contentList={contentList}
        />
      </div>
    </div>
  );
}
