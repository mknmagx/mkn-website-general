"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Loader2,
  User,
  Sparkles,
  Image as ImageIcon,
  ChevronUp,
  Download,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ContentVisualizeMessageList({
  messages,
  loading,
  hasMoreMessages,
  loadingMore,
  onLoadMore,
  selectedContentTitle,
}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && !loadingMore) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingMore]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);

    // Load more when scrolled to top
    if (scrollTop === 0 && hasMoreMessages && !loadingMore) {
      onLoadMore();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            İçerik Görseli Oluştur
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {selectedContentTitle
              ? `"${selectedContentTitle}" için görsel oluşturmaya başlayın`
              : "Bir içerik seçin ve görsel isteklerinizi yazın"}
          </p>
          <div className="text-xs text-gray-400 dark:text-gray-600 space-y-1">
            <div>• Gemini 3.0 Pro Image kullanılır</div>
            <div>• İçerik detaylarına özel görseller</div>
            <div>• Görsel geçmişi saklanır</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
      >
        {/* Load More Button */}
        {hasMoreMessages && (
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                "Daha Eski Mesajları Yükle"
              )}
            </Button>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6">
          {messages.map((message, index) => (
            <MessageItem
              key={message.id || index}
              message={message}
              isLatest={index === messages.length - 1}
              setPreviewImage={setPreviewImage}
            />
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="pb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Görsel oluşturuluyor...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <div className="absolute bottom-4 right-4">
          <Button
            size="icon"
            onClick={scrollToBottom}
            className="rounded-full shadow-lg bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800"
          >
            <ChevronUp className="w-5 h-5 rotate-180" />
          </Button>
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden border-0">
          <DialogTitle className="sr-only">Görsel Önizleme</DialogTitle>
          <DialogDescription className="sr-only">
            Oluşturulan görseli tam boyutta görüntüleyin
          </DialogDescription>
          {previewImage && (
            <div className="relative w-full h-[85vh] flex items-center justify-center bg-black/95">
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-0 backdrop-blur-md"
                >
                  Görsel #{previewImage.index}
                </Badge>
              </div>
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md"
                  onClick={() => {
                    window.open(previewImage.url, "_blank");
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="rounded-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md"
                  onClick={() => setPreviewImage(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="w-full h-full flex items-center justify-center p-8">
                <img
                  src={previewImage.url}
                  alt={`Preview ${previewImage.index}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageItem({ message, isLatest, setPreviewImage }) {
  const isUser = message.role === "user";
  const hasImages = message.imageUrls && message.imageUrls.length > 0;

  return (
    <div
      className={cn(
        "flex items-start gap-3 max-w-full",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-gray-900 dark:bg-white"
            : "bg-gradient-to-br from-purple-500 to-pink-500"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white dark:text-gray-900" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content Container */}
      <div
        className={cn(
          "flex flex-col gap-2 min-w-0 max-w-[75%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Text Content Bubble */}
        {message.content && (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 min-w-0 w-full",
              isUser
                ? "bg-blue-500 text-white rounded-tr-sm"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-sm shadow-sm"
            )}
          >
            <div
              className={cn(
                "text-sm leading-relaxed",
                "prose prose-sm max-w-none",
                "break-words overflow-wrap-anywhere",
                isUser ? "prose-invert" : ""
              )}
            >
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => (
                    <p className="mb-2 last:mb-0 break-words" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-semibold break-words" {...props} />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic break-words" {...props} />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1
                      className="text-lg font-bold mb-2 mt-3 first:mt-0 break-words"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-base font-bold mb-2 mt-3 first:mt-0 break-words"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-sm font-bold mb-2 mt-2 first:mt-0 break-words"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul
                      className="list-disc list-inside space-y-1 my-2 break-words"
                      {...props}
                    />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      className="list-decimal list-inside space-y-1 my-2 break-words"
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="break-words" {...props} />
                  ),
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code
                        className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-xs font-mono break-all"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block p-3 my-2 rounded bg-black/5 dark:bg-white/5 text-xs font-mono whitespace-pre-wrap break-words overflow-wrap-anywhere"
                        {...props}
                      />
                    ),
                  pre: ({ node, children, ...props }) => (
                    <pre
                      className="my-2 p-3 rounded bg-black/5 dark:bg-white/5 overflow-hidden whitespace-pre-wrap break-words overflow-wrap-anywhere"
                      {...props}
                    >
                      {children}
                    </pre>
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 italic break-words"
                      {...props}
                    />
                  ),
                  a: ({ node, ...props }) => (
                    <a
                      className="underline hover:no-underline break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Image Grid */}
        {hasImages && (
          <div
            className={cn(
              "grid gap-2",
              message.imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}
          >
            {message.imageUrls.map((imageUrl, idx) => (
              <div
                key={idx}
                className={cn(
                  "group relative rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg",
                  "border border-gray-200 dark:border-gray-700",
                  isUser ? "rounded-tr-sm" : "rounded-tl-sm",
                  message.imageUrls.length === 1 ? "w-80" : "w-40"
                )}
                onClick={() =>
                  setPreviewImage({ url: imageUrl, index: idx + 1 })
                }
              >
                <div className="relative aspect-square">
                  <Image
                    src={imageUrl}
                    alt={`Generated image ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-medium text-gray-900 dark:text-gray-100 shadow-lg">
                        Tam Boyut
                      </div>
                    </div>
                  </div>
                </div>
                {/* Image Number Badge */}
                <div className="absolute top-2 left-2">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs h-5"
                  >
                    {idx + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message Metadata */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-1",
            "text-[10px] text-gray-400 dark:text-gray-500"
          )}
        >
          <span>
            {message.createdAt &&
              new Date(
                message.createdAt.toDate?.() || message.createdAt
              ).toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
          </span>
          {hasImages && (
            <>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <div className="flex items-center gap-0.5">
                <ImageIcon className="w-3 h-3" />
                <span>{message.imageUrls.length}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
