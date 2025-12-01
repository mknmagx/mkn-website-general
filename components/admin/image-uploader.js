"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const PLATFORM_SPECS = {
  instagram_post: {
    label: "Instagram Post",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    maxSize: 8,
  },
  instagram_carousel: {
    label: "Instagram Carousel",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    maxSize: 8,
  },
  instagram_reel: {
    label: "Instagram Reel",
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    maxSize: 10,
  },
  instagram_story: {
    label: "Instagram Story",
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    maxSize: 8,
  },
  facebook_post: {
    label: "Facebook Post",
    aspectRatio: "16:9",
    width: 1200,
    height: 630,
    maxSize: 10,
  },
  facebook_video: {
    label: "Facebook Video",
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    maxSize: 15,
  },
  x_tweet: {
    label: "X Post",
    aspectRatio: "16:9",
    width: 1200,
    height: 675,
    maxSize: 5,
  },
  x_thread: {
    label: "X Thread",
    aspectRatio: "16:9",
    width: 1200,
    height: 675,
    maxSize: 5,
  },
  linkedin_post: {
    label: "LinkedIn Post",
    aspectRatio: "1.91:1",
    width: 1200,
    height: 627,
    maxSize: 10,
  },
  linkedin_carousel: {
    label: "LinkedIn Carousel",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    maxSize: 10,
  },
};

export default function ImageUploader({
  platform,
  contentType,
  onImageSelect,
  currentImage,
  onRemove,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const fileInputRef = useRef(null);

  const contentKey = `${platform}_${contentType}`;
  const specs = PLATFORM_SPECS[contentKey] || {
    label: "Generic",
    aspectRatio: "16:9",
    width: 1200,
    height: 675,
    maxSize: 10,
  };

  const validateImage = (file) => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel dosyası seçin");
      return false;
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > specs.maxSize) {
      toast.error(`Görsel ${specs.maxSize}MB'dan küçük olmalı`);
      return false;
    }

    return true;
  };

  const handleFile = async (file) => {
    if (!validateImage(file)) return;

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Check dimensions
          const aspectRatio = img.width / img.height;
          const targetRatio = specs.width / specs.height;
          const ratioDiff = Math.abs(aspectRatio - targetRatio);

          if (ratioDiff > 0.1) {
            toast.warning(
              `Önerilen oran: ${specs.aspectRatio} (${specs.width}x${specs.height})`
            );
          }

          setPreview(e.target.result);
          onImageSelect(file, e.target.result);
          toast.success("Görsel eklendi");
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image processing error:", error);
      toast.error("Görsel işlenirken hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Görsel kaldırıldı");
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-500" />
                Görsel Ekle
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                {specs.label} - {specs.aspectRatio} ({specs.width}x{specs.height}
                ), Max {specs.maxSize}MB
              </p>
            </div>
            {preview && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemove}
                className="text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Kaldır
              </Button>
            )}
          </div>

          {/* Preview or Upload Area */}
          {preview ? (
            <div className="relative">
              <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto object-cover"
                  style={{
                    aspectRatio: `${specs.width}/${specs.height}`,
                    maxHeight: "400px",
                  }}
                />
              </div>
              <Badge
                className="absolute top-3 right-3 bg-green-500 text-white"
                variant="default"
              >
                <Check className="h-3 w-3 mr-1" />
                Hazır
              </Badge>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {uploading ? (
                <div className="space-y-3">
                  <Loader2 className="h-10 w-10 text-blue-500 mx-auto animate-spin" />
                  <p className="text-sm text-gray-600">İşleniyor...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Görsel yüklemek için tıklayın veya sürükleyin
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WEBP (Max {specs.maxSize}MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Specs Info */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <p className="text-xs text-blue-600 font-medium">Oran</p>
              <p className="text-sm font-bold text-blue-900">
                {specs.aspectRatio}
              </p>
            </div>
            <div className="text-center border-l border-r border-blue-200">
              <p className="text-xs text-blue-600 font-medium">Boyut</p>
              <p className="text-sm font-bold text-blue-900">
                {specs.width}×{specs.height}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-600 font-medium">Max</p>
              <p className="text-sm font-bold text-blue-900">{specs.maxSize}MB</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
