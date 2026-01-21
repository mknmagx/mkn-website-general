"use client";

import { useRef, useEffect, useCallback } from "react";
import { User, Sparkles, Copy, Check, Image as ImageIcon, Download, Info, X, ZoomIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
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

export default function MessageList({ messages, loading, hasMoreMessages, loadingMore, onLoadMore }) {
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
    
    // Load more when user scrolls near top (within 200px)
    if (scrollTop < 200) {
      setShouldScrollToBottom(false);
      const previousScrollHeight = scrollRef.current.scrollHeight;
      
      onLoadMore().then(() => {
        // Maintain scroll position after loading
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
      <div className="max-w-5xl mx-auto space-y-8">
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
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 flex items-center justify-center backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <Sparkles className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl -z-10"></div>
            </div>
            <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-50 mb-3 tracking-tight">
              Gemini ile Sohbete Başla
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg text-base leading-relaxed">
              Sorularınızı sorun, kod yazın, görsel analiz edin veya yaratıcı içerikler oluşturun
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-5 ${
                message.role === "user" ? "justify-end" : "justify-start"
              } group`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 pt-1">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40 flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50 transition-all group-hover:scale-105">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              )}

              <div
                className={`flex-1 max-w-[85%] ${
                  message.role === "user" ? "items-end" : "items-start"
                } flex flex-col gap-2.5`}
              >
                <div
                  className={`rounded-2xl px-5 py-4 transition-all ${
                    message.role === "user"
                      ? "bg-blue-600 dark:bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "bg-white dark:bg-gray-800/80 text-gray-900 dark:text-gray-50 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm"
                  }`}
                >
                  {/* Input Images (User uploaded) */}
                  {message.imageUrls && message.imageUrls.length > 0 && (
                    <div className="flex gap-3 mb-4 flex-wrap">
                      {message.imageUrls.map((url, index) => (
                        <div key={index} className="relative group/image cursor-pointer" onClick={() => setPreviewImage({ url, type: 'input', index: index + 1 })}>
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
                            Input {index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Generated Images (AI Output from Gemini 3 Pro Image) */}
                  {message.generatedImages && message.generatedImages.length > 0 && (
                    <div className="mb-4 space-y-4">
                      <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Üretilen Görseller</span>
                        <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                          {message.generatedImages.length} görsel
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {message.generatedImages.map((img, index) => (
                          <div key={index} className="relative group/generated cursor-pointer" onClick={() => setPreviewImage({ url: `data:${img.mimeType};base64,${img.data}`, type: 'generated', index: index + 1 })}>
                            <img
                              src={`data:${img.mimeType};base64,${img.data}`}
                              alt={`Generated ${index + 1}`}
                              className="w-full rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-md hover:shadow-xl transition-all hover:scale-[1.01]"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/generated:bg-black/10 rounded-xl transition-all flex items-center justify-center">
                              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover/generated:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                            
                            {/* Image Metadata Overlay */}
                            <div className="absolute top-3 right-3 flex gap-2">
                              {/* Download Button */}
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-9 px-3.5 bg-black/60 hover:bg-black/80 text-white border-0 opacity-0 group-hover/generated:opacity-100 transition-all backdrop-blur-md shadow-lg"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const link = document.createElement('a');
                                  link.href = `data:${img.mimeType};base64,${img.data}`;
                                  link.download = `gemini-image-${Date.now()}.png`;
                                  link.click();
                                }}
                              >
                                <Download className="w-4 h-4 mr-1.5" />
                                İndir
                              </Button>

                              {/* ThoughtSignature Info */}
                              {img.thoughtSignature && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0 cursor-help shadow-lg backdrop-blur-md">
                                      <Info className="w-3 h-3 mr-1.5" />
                                      Multi-turn Ready
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-xs leading-relaxed">
                                      Bu görsel thoughtSignature içeriyor ve multi-turn editing için kullanılabilir.
                                      Üzerine yeni talimatlarla devam edebilirsiniz.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>

                            {/* SynthID Watermark Badge */}
                            <Badge 
                              variant="secondary" 
                              className="absolute bottom-3 left-3 bg-black/60 hover:bg-black/70 text-white border-0 text-xs font-medium backdrop-blur-md"
                            >
                              <Sparkles className="w-3 h-3 mr-1.5" />
                              SynthID Watermark
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Text Content */}
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-medium prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:shadow-inner">
                    {message.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-xl shadow-md"
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    )}
                  </div>

                  {/* Grounding Metadata (if available) */}
                  {message.groundingMetadata && message.groundingMetadata.webSearchQueries?.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50/80 dark:bg-blue-950/30 rounded-xl space-y-2.5 border border-blue-100 dark:border-blue-900/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2.5 text-sm font-medium text-blue-700 dark:text-blue-300">
                        <Sparkles className="w-4 h-4" />
                        Google Search Grounding Kullanıldı
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {message.groundingMetadata.webSearchQueries.join(", ")}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 px-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {formatDate(message.createdAt)}
                  </span>
                  
                  {message.role === "assistant" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                      onClick={() => copyToClipboard(message.content, message.id)}
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      )}
                    </Button>
                  )}

                  {message.model && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                      {message.model}
                    </span>
                  )}
                </div>
              </div>

              {message.role === "user" && (
                <div className="flex-shrink-0 pt-1">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50 transition-all group-hover:scale-105">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-5 justify-start group">
            <div className="flex-shrink-0 pt-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/40 dark:to-purple-950/40 flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50 animate-pulse">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1 max-w-[85%]">
              <div className="bg-white dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl px-5 py-4 shadow-sm backdrop-blur-sm">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2.5 h-2.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-5xl w-full p-0 overflow-hidden bg-transparent border-0" aria-describedby="image-preview-description">
          <DialogTitle className="sr-only">
            {previewImage?.type === 'input' ? `Input Görsel ${previewImage?.index}` : `Üretilen Görsel ${previewImage?.index}`}
          </DialogTitle>
          <DialogDescription id="image-preview-description" className="sr-only">
            {previewImage?.type === 'input' ? 'Yüklenen görsel önizlemesi' : 'AI tarafından üretilen görsel önizlemesi'}
          </DialogDescription>
          <div className="relative bg-black/95 backdrop-blur-2xl rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {previewImage?.type === 'input' ? (
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-3 py-1.5">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Input Görsel {previewImage?.index}
                    </Badge>
                  ) : (
                    <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-0 px-3 py-1.5">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Üretilen Görsel {previewImage?.index}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 px-4 bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = document.createElement('a');
                      link.href = previewImage?.url || '';
                      link.download = `image-${Date.now()}.png`;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    İndir
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 w-9 p-0 bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"
                    onClick={() => setPreviewImage(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="flex items-center justify-center min-h-[60vh] max-h-[85vh] p-6">
              {previewImage && (
                <img
                  src={previewImage.url}
                  alt={`Preview ${previewImage.type} ${previewImage.index}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
