"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  Upload,
  X,
  Loader2,
  Link2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MEDIA_TYPES = [
  { id: "image", label: "Görsel", icon: ImageIcon, accept: "image/jpeg,image/png,image/webp", maxSize: 5 },
  { id: "document", label: "Doküman", icon: FileText, accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt", maxSize: 100 },
  { id: "video", label: "Video", icon: Film, accept: "video/mp4,video/3gpp", maxSize: 16 },
  { id: "audio", label: "Ses", icon: Music, accept: "audio/aac,audio/mp4,audio/mpeg,audio/amr,audio/ogg", maxSize: 16 },
];

export function MediaUploadDialog({
  open,
  onOpenChange,
  conversationId,
  recipientPhone,
  onMediaSent,
}) {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState("image");
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [urlMode, setUrlMode] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");

  // Reset state
  const resetState = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption("");
    setMediaUrl("");
    setUrlMode(false);
  };

  // Handle dialog close
  const handleOpenChange = (open) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaType = MEDIA_TYPES.find((t) => t.id === activeTab);
    const maxSizeMB = mediaType?.maxSize || 5;

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "Dosya çok büyük",
        description: `Maksimum dosya boyutu ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (activeTab === "image" && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // Handle send
  const handleSend = async () => {
    if (!recipientPhone) {
      toast({
        title: "Hata",
        description: "Alıcı telefon numarası gerekli",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile && !mediaUrl) {
      toast({
        title: "Hata",
        description: "Lütfen bir dosya seçin veya URL girin",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      let finalMediaUrl = mediaUrl;

      // Upload file if using file mode
      if (selectedFile && !urlMode) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("type", activeTab);

        const uploadResponse = await fetch("/api/admin/whatsapp/media/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadData.success) {
          throw new Error(uploadData.error || "Dosya yüklenemedi");
        }

        finalMediaUrl = uploadData.mediaUrl || uploadData.mediaId;
      }

      // Send media message
      const response = await fetch("/api/admin/whatsapp/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          to: recipientPhone,
          conversationId,
          mediaUrl: finalMediaUrl,
          caption: caption.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Medya gönderildi",
        });
        handleOpenChange(false);
        if (onMediaSent) {
          onMediaSent(data);
        }
      } else if (data.requiresTemplate) {
        toast({
          title: "Şablon Gerekli",
          description: "24 saatlik pencere kapalı. Önce şablon mesajı göndermelisiniz.",
          variant: "destructive",
        });
      } else {
        throw new Error(data.error || "Medya gönderilemedi");
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const currentMediaType = MEDIA_TYPES.find((t) => t.id === activeTab);
  const Icon = currentMediaType?.icon || ImageIcon;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-green-600" />
            Medya Gönder
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); resetState(); }}>
          <TabsList className="grid grid-cols-4 w-full">
            {MEDIA_TYPES.map((type) => (
              <TabsTrigger key={type.id} value={type.id} className="text-xs">
                <type.icon className="h-4 w-4 mr-1" />
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {MEDIA_TYPES.map((type) => (
            <TabsContent key={type.id} value={type.id} className="space-y-4 mt-4">
              {/* Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={!urlMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setUrlMode(false); setMediaUrl(""); }}
                  className={cn(!urlMode && "bg-green-600 hover:bg-green-700")}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Dosya Yükle
                </Button>
                <Button
                  variant={urlMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setUrlMode(true); setSelectedFile(null); setPreview(null); }}
                  className={cn(urlMode && "bg-green-600 hover:bg-green-700")}
                >
                  <Link2 className="h-4 w-4 mr-1" />
                  URL Gir
                </Button>
              </div>

              {urlMode ? (
                /* URL Input */
                <div className="space-y-2">
                  <Label>Medya URL</Label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Herkese açık bir URL girin. WhatsApp bu URL'den medyayı indirecek.
                  </p>
                </div>
              ) : (
                /* File Upload */
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={type.accept}
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {preview ? (
                            <img
                              src={preview}
                              alt="Preview"
                              className="h-16 w-16 object-cover rounded"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                              <Icon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium truncate max-w-[200px]">
                              {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setSelectedFile(null); setPreview(null); }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Icon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">
                        Dosya seçmek için tıklayın
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Maksimum {type.maxSize}MB
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Caption (for image, video, document) */}
              {["image", "video", "document"].includes(type.id) && (
                <div className="space-y-2">
                  <Label>Açıklama (isteğe bağlı)</Label>
                  <Textarea
                    placeholder="Medya açıklaması..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={2}
                    maxLength={1024}
                  />
                </div>
              )}

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-xs">
                  {type.id === "image" && "Desteklenen formatlar: JPEG, PNG, WebP. Max 5MB."}
                  {type.id === "document" && "Desteklenen formatlar: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT. Max 100MB."}
                  {type.id === "video" && "Desteklenen formatlar: MP4, 3GPP. Max 16MB."}
                  {type.id === "audio" && "Desteklenen formatlar: AAC, MP4, MPEG, AMR, OGG. Max 16MB."}
                </AlertDescription>
              </Alert>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={sending}
          >
            İptal
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || (!selectedFile && !mediaUrl)}
            className="bg-green-600 hover:bg-green-700"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              "Gönder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MediaUploadDialog;
