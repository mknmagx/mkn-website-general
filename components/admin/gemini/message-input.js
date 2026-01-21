"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Image as ImageIcon,
  X,
  Globe,
  Zap,
  Palette,
  Sliders,
  Thermometer,
  Hash,
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GEMINI_CHAT_MODELS } from "@/lib/gemini";
import { toast } from "sonner";

export default function MessageInput({
  onSendMessage,
  loading,
  selectedModel,
  onModelChange,
}) {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    temperature: 1.0, // Recommended 0.8-1.2 for image generation
    maxTokens: 2048,
    enableWebSearch: true,
    // Gemini 3 Pro Image specific settings
    aspectRatio: "1:1",
    imageSize: "2K",
    numberOfImages: 1,
    enableGrounding: false,
    responseModalities: ["IMAGE", "TEXT"], // Get both image and description
  });
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentModel = GEMINI_CHAT_MODELS.find(
    (m) => m.value === selectedModel
  );

  // Auto-focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Update default web search based on selected model
  useEffect(() => {
    if (currentModel?.defaultWebSearch !== undefined) {
      setSettings((prev) => ({
        ...prev,
        enableWebSearch: currentModel.defaultWebSearch,
      }));
    }
  }, [selectedModel, currentModel]);

  const handleSend = () => {
    if (!message.trim() && images.length === 0) return;

    console.log("📤 MessageInput - Sending message:", {
      contentLength: message.length,
      imagesCount: images.length,
      imagesPreview: images.map((img, i) => ({
        index: i,
        type: img.startsWith("data:image/") ? "base64" : "unknown",
        size: img.length,
        preview: img.substring(0, 50) + "...",
      })),
      model: selectedModel,
    });

    onSendMessage({
      content: message,
      images, // ✅ Fresh images from current state
      model: selectedModel,
      settings,
    });

    // ✅ Clear message and images after sending
    setMessage("");
    setImages([]);

    console.log("🧹 MessageInput - State cleared");

    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);

    // ✅ Convert files to base64 (with AVIF → JPEG conversion)
    const base64Promises = files.map((file) => {
      return new Promise((resolve, reject) => {
        // Check if AVIF format
        const isAVIF =
          file.type === "image/avif" ||
          file.name.toLowerCase().endsWith(".avif");

        if (isAVIF) {
          // Convert AVIF to JPEG using canvas
          const img = new Image();
          const reader = new FileReader();

          reader.onload = (e) => {
            img.src = e.target.result;

            img.onload = () => {
              // Create canvas and convert to JPEG
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);

              // Convert to JPEG (quality 0.9)
              const jpegBase64 = canvas.toDataURL("image/jpeg", 0.9);
              console.log(`✅ Converted AVIF to JPEG: ${file.name}`);
              resolve(jpegBase64);
            };

            img.onerror = () => {
              console.error(`❌ Failed to load AVIF image: ${file.name}`);
              reject(new Error("Failed to convert AVIF"));
            };
          };

          reader.onerror = reject;
          reader.readAsDataURL(file);
        } else {
          // Normal processing for supported formats
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }
      });
    });

    try {
      const base64Images = await Promise.all(base64Promises);

      // ✅ CRITICAL FIX: Replace old images with new ones (don't append)
      // User expects to send ONLY the newly selected images
      setImages(base64Images);

      console.log(
        `✅ ${base64Images.length} new image(s) selected and converted to base64`
      );
    } catch (error) {
      console.error("❌ Error converting images to base64:", error);
      toast.error("Görseller yüklenemedi");
    }

    // ✅ Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [message]);

  return (
    <div className="relative bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      {/* Model Selector Bar - Minimalist */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between gap-4">
          {/* Model Selector */}
          <div className="flex items-center gap-3">
            <Select value={selectedModel} onValueChange={onModelChange}>
              <SelectTrigger className="w-auto min-w-[180px] h-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{currentModel?.icon}</span>
                    <span className="text-xs font-medium">
                      {currentModel?.label}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-200 dark:border-gray-800">
                {GEMINI_CHAT_MODELS.map((model) => (
                  <SelectItem
                    key={model.value}
                    value={model.value}
                    className="rounded-md cursor-pointer data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-800"
                  >
                    <div className="flex items-center gap-2 py-0.5">
                      <span className="text-sm ">{model.icon}</span>
                      <div>
                        <div className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          {model.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {model.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Image Generation Quick Controls */}
            {currentModel?.supportsImageGen && (
              <div className="flex items-center gap-2">
                {/* Aspect Ratio Selector */}
                <Select
                  value={settings.aspectRatio}
                  onValueChange={(value) =>
                    setSettings({ ...settings, aspectRatio: value })
                  }
                >
                  <SelectTrigger className="w-auto h-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg text-xs">
                    <SelectValue>
                      <span className="text-xs font-medium">
                        {settings.aspectRatio}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="1:1" className="text-xs">
                      1:1 - Kare
                    </SelectItem>
                    <SelectItem value="16:9" className="text-xs">
                      16:9 - Landscape
                    </SelectItem>
                    <SelectItem value="9:16" className="text-xs">
                      9:16 - Portrait
                    </SelectItem>
                    <SelectItem value="4:3" className="text-xs">
                      4:3 - Klasik
                    </SelectItem>
                    <SelectItem value="3:4" className="text-xs">
                      3:4 - Klasik Portrait
                    </SelectItem>
                    <SelectItem value="21:9" className="text-xs">
                      21:9 - Cinematic
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Image Size Selector */}
                <Select
                  value={settings.imageSize}
                  onValueChange={(value) =>
                    setSettings({ ...settings, imageSize: value })
                  }
                >
                  <SelectTrigger className="w-auto h-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-lg text-xs">
                    <SelectValue>
                      <span className="text-xs font-medium">
                        {settings.imageSize}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="1K" className="text-xs">
                      1K - Hızlı
                    </SelectItem>
                    <SelectItem value="2K" className="text-xs">
                      2K - Dengeli ⭐
                    </SelectItem>
                    <SelectItem value="4K" className="text-xs">
                      4K - Maksimum
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Right Controls - Minimal & Functional */}
          <div className="flex items-center gap-2">
            {/* Web Search Toggle */}
            {currentModel?.supportsGrounding && (
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    enableWebSearch: !settings.enableWebSearch,
                  })
                }
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                  settings.enableWebSearch
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Globe className="w-3 h-3" />
                <span className="font-medium">Web</span>
              </button>
            )}

            {/* Settings Popover */}
            <Popover open={showSettings} onOpenChange={setShowSettings}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Sliders className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 rounded-lg border-gray-200 dark:border-gray-800 p-0"
                align="end"
              >
                {/* Header - Fixed */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-10">
                  <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    Gelişmiş Ayarlar
                  </h3>
                </div>

                {/* Scrollable Content */}
                <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
                  {/* Temperature */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        Temperature
                      </Label>
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                        {settings.temperature.toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      value={[settings.temperature]}
                      onValueChange={([value]) =>
                        setSettings({ ...settings, temperature: value })
                      }
                      min={0}
                      max={2}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Tutarlı (0.0)</span>
                      <span>Dengeli (1.0)</span>
                      <span>Yaratıcı (2.0)</span>
                    </div>
                    {currentModel?.supportsImageGen && (
                      <p className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 p-2 rounded-lg">
                        💡 Görsel üretimi için 0.8-1.2 arası önerilir
                        (varsayılan: 1.0)
                      </p>
                    )}
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Hash className="w-4 h-4 text-blue-500" />
                        Max Tokens
                      </Label>
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                        {settings.maxTokens.toLocaleString()}
                      </span>
                    </div>
                    <Slider
                      value={[settings.maxTokens]}
                      onValueChange={([value]) =>
                        setSettings({ ...settings, maxTokens: value })
                      }
                      min={512}
                      max={8192}
                      step={256}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      Yanıt uzunluk limiti (512 - 8192)
                    </p>
                  </div>

                  {/* Image Generation Settings */}
                  {currentModel?.supportsImageGen && (
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Palette className="w-4 h-4 text-purple-500" />
                        Görsel Üretim Ayarları
                      </Label>

                      {/* Response Modalities */}
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Çıktı Türü
                        </Label>
                        <Select
                          value={settings.responseModalities.join(",")}
                          onValueChange={(value) =>
                            setSettings({
                              ...settings,
                              responseModalities: value.split(","),
                            })
                          }
                        >
                          <SelectTrigger className="h-9 text-sm rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="IMAGE,TEXT">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  Görsel + Açıklama ⭐
                                </span>
                                <span className="text-xs text-gray-500">
                                  Hem resim hem metin (Önerilen)
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="IMAGE">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  Sadece Görsel
                                </span>
                                <span className="text-xs text-gray-500">
                                  Yalnızca resim döndürür
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="TEXT">
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  Sadece Açıklama
                                </span>
                                <span className="text-xs text-gray-500">
                                  Görsel olmadan metin
                                </span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Google Search Grounding Toggle */}
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <div className="flex-1">
                          <Label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                            <Globe className="w-4 h-4 text-blue-500" />
                            Google Search Grounding
                          </Label>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Gerçek dünya bilgisiyle destekle
                          </p>
                        </div>
                        <Switch
                          checked={settings.enableGrounding}
                          onCheckedChange={(checked) =>
                            setSettings({
                              ...settings,
                              enableGrounding: checked,
                            })
                          }
                        />
                      </div>

                      {/* Info Box */}
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <p className="font-medium text-purple-700 dark:text-purple-300">
                              Gemini 3 Pro Image Özellikleri:
                            </p>
                            <ul className="list-disc list-inside space-y-0.5 ml-1">
                              <li>4K çözünürlükte görsel üretimi</li>
                              <li>14 adete kadar referans görsel</li>
                              <li>Multi-turn iterative editing</li>
                              <li>Google Search grounding desteği</li>
                              <li>SynthID watermark (görünmez)</li>
                            </ul>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                              💡 İpucu: Temperature 0.8-1.2 arası en iyi
                              sonuçları verir
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* End of scrollable content */}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Image Preview */}
      {images.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, index) => (
              <div key={index} className="relative flex-shrink-0 group">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={img}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="px-6 py-4">
        <div className="relative flex items-end gap-2">
          {/* Image Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Button>

          {/* Textarea Container */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Mesajınızı yazın...`}
              className="min-h-[44px] max-h-[180px] resize-none border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-700 focus:border-gray-300 dark:focus:border-gray-700 px-3 py-2.5 bg-white dark:bg-gray-900"
              disabled={loading}
              rows={1}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={loading || (!message.trim() && images.length === 0)}
            size="icon"
            className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white dark:border-gray-900/30 dark:border-t-gray-900"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              Enter
            </kbd>{" "}
            gönder
          </span>

          {settings.enableWebSearch && currentModel?.supportsGrounding && (
            <span className="text-gray-600 dark:text-gray-400">
              Web arama aktif
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
