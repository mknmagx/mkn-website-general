"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { 
  User, 
  Sparkles, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  ZoomIn, 
  Loader2,
  Bot,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ChatGPTMessageList({ 
  messages, 
  loading, 
  hasMoreMessages, 
  loadingMore, 
  onLoadMore 
}) {
  const scrollRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  // Auto scroll to bottom only for new messages
  useEffect(() => {
    if (scrollRef.current && shouldScrollToBottom) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, shouldScrollToBottom]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !onLoadMore || !hasMoreMessages || loadingMore) return;

    const { scrollTop } = scrollRef.current;
    
    if (scrollTop < 200) {
      setShouldScrollToBottom(false);
      const previousScrollHeight = scrollRef.current.scrollHeight;
      
      onLoadMore().then(() => {
        if (scrollRef.current) {
          const newScrollHeight = scrollRef.current.scrollHeight;
          scrollRef.current.scrollTop = newScrollHeight - previousScrollHeight;
        }
      });
    }
  }, [onLoadMore, hasMoreMessages, loadingMore]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const copyToClipboard = (text, messageId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (date) => {
    if (!date) return "";
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-8 scrollbar-thin" ref={scrollRef}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Load More Indicator */}
        {hasMoreMessages && (
          <div className="flex justify-center py-4">
            {loadingMore ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Eski mesajlar yükleniyor...</span>
              </div>
            ) : (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                Daha eski mesajları görmek için yukarı kaydırın
              </div>
            )}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 flex items-center justify-center backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <Bot className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl -z-10"></div>
            </div>
            <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-50 mb-3 tracking-tight">
              ChatGPT ile Sohbete Başla
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg text-base leading-relaxed">
              Sorularınızı sorun, kod yazın, görsel analiz edin veya yaratıcı içerikler oluşturun
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-0">
                💬 Doğal Dil
              </Badge>
              <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-0">
                👁️ Vision
              </Badge>
              <Badge variant="secondary" className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-0">
                🧠 Reasoning
              </Badge>
              <Badge variant="secondary" className="bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-0">
                💻 Kod
              </Badge>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              } group`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 pt-1">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50 transition-all group-hover:scale-105">
                    <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              )}

              <div
                className={`flex-1 max-w-[85%] ${
                  message.role === "user" ? "items-end" : "items-start"
                } flex flex-col gap-2`}
              >
                <div
                  className={`rounded-2xl px-5 py-4 transition-all ${
                    message.role === "user"
                      ? "bg-emerald-600 dark:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-white dark:bg-gray-800/80 text-gray-900 dark:text-gray-50 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm"
                  }`}
                >
                  {/* Input Images (User uploaded) */}
                  {message.imageUrls && message.imageUrls.length > 0 && (
                    <div className="flex gap-3 mb-4 flex-wrap">
                      {message.imageUrls.map((url, index) => (
                        <div 
                          key={index} 
                          className="relative group/image cursor-pointer" 
                          onClick={() => setPreviewImage({ url, type: 'input', index: index + 1 })}
                        >
                          <img
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            className="max-w-xs rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 rounded-xl transition-all flex items-center justify-center">
                            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover/image:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="absolute top-2.5 left-2.5 bg-black/60 hover:bg-black/70 text-white border-0 backdrop-blur-md text-xs font-medium"
                          >
                            <ImageIcon className="w-3 h-3 mr-1.5" />
                            Görsel {index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message Content */}
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2 prose-pre:my-3 prose-code:text-emerald-600 dark:prose-code:text-emerald-400">
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-xl !my-3 !bg-gray-900"
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code
                                className={`${className} px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700/50 text-emerald-600 dark:text-emerald-400 text-sm`}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                </div>

                {/* Message Footer */}
                <div
                  className={`flex items-center gap-3 px-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(message.createdAt)}
                  </span>
                  
                  {/* Token Usage Badge */}
                  {message.usage && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className="text-[10px] border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-help"
                        >
                          <Coins className="w-3 h-3 mr-1" />
                          {message.usage.total_tokens?.toLocaleString()}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p>Input: {message.usage.prompt_tokens?.toLocaleString()}</p>
                        <p>Output: {message.usage.completion_tokens?.toLocaleString()}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {message.role === "assistant" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {copiedId === message.id ? "Kopyalandı!" : "Kopyala"}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0 pt-1">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50 transition-all group-hover:scale-105">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-4 justify-start group">
            <div className="flex-shrink-0 pt-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50">
                <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-5 py-4 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">ChatGPT düşünüyor...</span>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95">
          <DialogHeader className="absolute top-4 left-4 z-10">
            <DialogTitle className="text-white text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              {previewImage?.type === 'input' ? `Görsel ${previewImage?.index}` : `Üretilen Görsel ${previewImage?.index}`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Görsel önizleme
            </DialogDescription>
          </DialogHeader>
          {previewImage && (
            <img
              src={previewImage.url}
              alt="Preview"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
