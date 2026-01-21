"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Image as ImageIcon,
  X,
  Zap,
  Sliders,
  Thermometer,
  Hash,
  Bot,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CHATGPT_CHAT_MODELS } from "@/lib/openai";
import { toast } from "sonner";

export default function ChatGPTMessageInput({
  onSendMessage,
  loading,
  selectedModel,
  onModelChange,
}) {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentModel = CHATGPT_CHAT_MODELS.find(
    (m) => m.value === selectedModel
  );

  // Auto-focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!message.trim() && images.length === 0) return;

    console.log("📤 ChatGPT MessageInput - Sending message:", {
      contentLength: message.length,
      imagesCount: images.length,
      model: selectedModel,
    });

    onSendMessage({
      content: message,
      images,
      model: selectedModel,
      settings,
    });

    // Clear input after sending
    setMessage("");
    setImages([]);
    
    // Refocus textarea
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if model supports vision
    if (!currentModel?.supportsVision) {
      toast.error("Bu model görsel desteklemiyor. GPT-4o veya GPT-4o Mini seçin.");
      return;
    }

    // Max 4 images
    if (images.length + files.length > 4) {
      toast.error("Maksimum 4 görsel ekleyebilirsiniz.");
      return;
    }

    files.forEach((file) => {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("Görsel boyutu 20MB'dan küçük olmalı.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex gap-3 mb-4 flex-wrap">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Upload ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="relative flex items-end gap-3">
          {/* Model Selector */}
          <div className="flex-shrink-0">
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-[160px] h-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl text-sm">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{currentModel?.icon}</span>
                    <span className="truncate">{currentModel?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CHATGPT_CHAT_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex items-center gap-2">
                      <span>{model.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {model.description?.substring(0, 40)}...
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Textarea */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajınızı yazın... (Enter gönder, Shift+Enter yeni satır)"
              className="min-h-[48px] max-h-[200px] resize-none rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 pr-24 py-3 text-[15px] placeholder:text-gray-400"
              disabled={loading}
            />

            {/* Action Buttons */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              {/* Image Upload */}
              {currentModel?.supportsVision && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                  </Button>
                </>
              )}

              {/* Settings */}
              <Popover open={showSettings} onOpenChange={setShowSettings}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    disabled={loading}
                  >
                    <Sliders className="w-4 h-4 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      Model Ayarları
                    </h4>

                    {/* Temperature */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs flex items-center gap-1.5">
                          <Thermometer className="w-3.5 h-3.5" />
                          Temperature
                        </Label>
                        <span className="text-xs text-gray-500">
                          {settings.temperature}
                        </span>
                      </div>
                      <Slider
                        value={[settings.temperature]}
                        onValueChange={([v]) =>
                          setSettings((s) => ({ ...s, temperature: v }))
                        }
                        min={0}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-[10px] text-gray-400">
                        Düşük: daha tutarlı, Yüksek: daha yaratıcı
                      </p>
                    </div>

                    {/* Max Tokens */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5" />
                          Max Tokens
                        </Label>
                        <span className="text-xs text-gray-500">
                          {settings.maxTokens}
                        </span>
                      </div>
                      <Slider
                        value={[settings.maxTokens]}
                        onValueChange={([v]) =>
                          setSettings((s) => ({ ...s, maxTokens: v }))
                        }
                        min={256}
                        max={16384}
                        step={256}
                        className="w-full"
                      />
                    </div>

                    {/* Top P */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Top P</Label>
                        <span className="text-xs text-gray-500">
                          {settings.topP}
                        </span>
                      </div>
                      <Slider
                        value={[settings.topP]}
                        onValueChange={([v]) =>
                          setSettings((s) => ({ ...s, topP: v }))
                        }
                        min={0}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                    </div>

                    {/* Model Features */}
                    {currentModel && (
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-medium mb-2">Model Özellikleri</p>
                        <div className="flex flex-wrap gap-1">
                          {currentModel.features?.slice(0, 5).map((f, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-0"
                            >
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={loading || (!message.trim() && images.length === 0)}
                size="sm"
                className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Model Info Footer */}
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Bot className="w-3.5 h-3.5" />
            <span>{currentModel?.label}</span>
            {currentModel?.supportsVision && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-gray-200 dark:border-gray-700">
                Vision
              </Badge>
            )}
          </div>
          <div className="text-[10px] text-gray-400">
            {images.length > 0 && `${images.length} görsel eklendi • `}
            Enter ile gönder
          </div>
        </div>
      </div>
    </div>
  );
}
