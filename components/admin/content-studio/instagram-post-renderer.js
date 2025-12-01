"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Zap, ImageIcon, Sparkles } from "lucide-react";

export function InstagramPostRenderer({ content, updateContent, handleCopy }) {
  return (
    <div className="space-y-6">
      {/* Hook Section */}
      {content.hook && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Hook (İlk 125 Karakter)
            </Label>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(content.hook)}
            >
              <Copy className="w-4 h-4 mr-1" />
              Kopyala
            </Button>
          </div>
          <Textarea
            value={content.hook}
            onChange={(e) => updateContent("hook", e.target.value)}
            rows={2}
            className="border-yellow-200 bg-yellow-50 focus:border-yellow-500 rounded-xl resize-none font-medium"
          />
          <p className="text-xs text-gray-500">
            {content.hook?.length || 0} karakter
          </p>
        </div>
      )}

      {/* Full Caption */}
      {content.fullCaption && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-gray-700">
              Tam Caption
            </Label>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(content.fullCaption)}
            >
              <Copy className="w-4 h-4 mr-1" />
              Kopyala
            </Button>
          </div>
          <Textarea
            value={content.fullCaption}
            onChange={(e) => updateContent("fullCaption", e.target.value)}
            rows={12}
            className="border-gray-200 focus:border-purple-500 rounded-xl resize-none"
          />
        </div>
      )}

      {/* Hashtags */}
      {content.hashtagStrategy?.hashtags && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700">
            Hashtag Stratejisi
          </Label>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="flex flex-wrap gap-2 mb-3">
              {content.hashtagStrategy.hashtags.map((tag, idx) => (
                <Badge
                  key={idx}
                  className="bg-white text-purple-700 border border-purple-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {content.hashtagStrategy.rationale && (
              <p className="text-xs text-gray-600 italic">
                {content.hashtagStrategy.rationale}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Visual Suggestions */}
      {content.visualSuggestions && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-blue-500" />
            Görsel Önerileri
          </Label>
          <div className="grid gap-3">
            {content.visualSuggestions.primary && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 mb-2">
                  Ana Görsel
                </p>
                <p className="text-sm text-gray-700">
                  {content.visualSuggestions.primary}
                </p>
              </div>
            )}
            {content.visualSuggestions.carouselIdea && (
              <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                <p className="text-xs font-semibold text-cyan-700 mb-2">
                  Carousel Fikri
                </p>
                <p className="text-sm text-gray-700">
                  {content.visualSuggestions.carouselIdea}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance Optimization */}
      {content.performanceOptimization && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <p className="text-xs font-semibold text-green-700 mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Performans Optimizasyonu
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {content.performanceOptimization.bestPostTime && (
              <p>
                <span className="font-medium">En İyi Paylaşım Saati:</span>{" "}
                {content.performanceOptimization.bestPostTime}
              </p>
            )}
            {content.performanceOptimization.saveWorthiness && (
              <p>
                <span className="font-medium">Neden Kaydedilir:</span>{" "}
                {content.performanceOptimization.saveWorthiness}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
