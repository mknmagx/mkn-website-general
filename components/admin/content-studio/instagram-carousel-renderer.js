"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ImageIcon, Sparkles, Layers, Zap } from "lucide-react";

export function InstagramCarouselRenderer({ content, updateContent, handleCopy }) {
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
            rows={16}
            className="border-gray-200 focus:border-pink-500 rounded-xl resize-none"
          />
          <p className="text-xs text-gray-500">
            {content.fullCaption?.length || 0} karakter
          </p>
        </div>
      )}

      {/* Caption Structure */}
      {content.captionStructure && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-500" />
            Caption Yapısı
          </Label>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 space-y-3">
            {content.captionStructure.hook && (
              <div>
                <p className="text-xs font-semibold text-purple-700 mb-1">Hook:</p>
                <p className="text-sm text-gray-700">{content.captionStructure.hook}</p>
              </div>
            )}
            {content.captionStructure.body && (
              <div>
                <p className="text-xs font-semibold text-purple-700 mb-1">Body:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{content.captionStructure.body}</p>
              </div>
            )}
            {content.captionStructure.engagement && (
              <div>
                <p className="text-xs font-semibold text-purple-700 mb-1">Etkileşim:</p>
                <p className="text-sm text-gray-700">{content.captionStructure.engagement}</p>
              </div>
            )}
            {content.captionStructure.hashtags && (
              <div>
                <p className="text-xs font-semibold text-purple-700 mb-1">Hashtags:</p>
                <p className="text-sm text-gray-700">{content.captionStructure.hashtags}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Suggestions */}
      {content.visualSuggestions && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-pink-500" />
            Görsel Önerileri
          </Label>
          <div className="space-y-3">
            {content.visualSuggestions.primary && (
              <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                <p className="text-xs font-semibold text-pink-700 mb-2">
                  Ana Görsel Önerisi
                </p>
                <p className="text-sm text-gray-700">
                  {content.visualSuggestions.primary}
                </p>
              </div>
            )}
            {content.visualSuggestions.alternative && (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-xs font-semibold text-purple-700 mb-2">
                  Alternatif Öneri
                </p>
                <p className="text-sm text-gray-700">
                  {content.visualSuggestions.alternative}
                </p>
              </div>
            )}
            {content.visualSuggestions.carouselIdea && (
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                <p className="text-xs font-semibold text-cyan-700 mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Carousel Slide Fikirleri
                </p>
                <div className="space-y-2">
                  {Array.isArray(content.visualSuggestions.carouselIdea) ? (
                    content.visualSuggestions.carouselIdea.map((slide, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 bg-white rounded-lg"
                      >
                        <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white shrink-0">
                          {idx + 1}
                        </Badge>
                        <p className="text-sm text-gray-700">{slide}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-700">
                      {content.visualSuggestions.carouselIdea}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Carousel Concept (if AI provides it) */}
      {content.carouselConcept && (
        <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="h-5 w-5 text-pink-600" />
            <p className="text-sm font-semibold text-pink-700">
              Carousel Konsepti
            </p>
          </div>
          <p className="text-sm text-gray-700 mb-3">{content.carouselConcept}</p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            {content.totalSlides && (
              <span>
                <strong>Slide Sayısı:</strong> {content.totalSlides}
              </span>
            )}
            {content.format && (
              <span>
                <strong>Format:</strong> {content.format}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Design Theme (if AI provides it) */}
      {content.designTheme && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700">
            Tasarım Teması
          </Label>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            {content.designTheme.colorPalette &&
              content.designTheme.colorPalette.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-purple-700 mb-2">
                    Renk Paleti:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {content.designTheme.colorPalette.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg border-2 border-white shadow-md"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-mono text-gray-600">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            <div className="space-y-1.5 text-sm text-gray-700">
              {content.designTheme.fontFamily && (
                <p>
                  <strong>Font:</strong> {content.designTheme.fontFamily}
                </p>
              )}
              {content.designTheme.layoutStyle && (
                <p>
                  <strong>Layout Stili:</strong> {content.designTheme.layoutStyle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Carousel Slides (if AI provides detailed slides) */}
      {content.slides && content.slides.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Layers className="h-4 w-4 text-pink-500" />
            Carousel Slides ({content.slides.length})
          </Label>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {content.slides.map((slide, idx) => (
              <div
                key={idx}
                className="p-4 bg-white rounded-xl border-2 border-pink-200 hover:border-pink-300 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                    Slide {slide.slideNumber || idx + 1}
                  </Badge>
                  {slide.slideType && (
                    <Badge variant="outline" className="text-xs">
                      {slide.slideType}
                    </Badge>
                  )}
                </div>

                {slide.title && (
                  <h4 className="font-bold text-gray-900 mb-2 text-base">
                    {slide.title}
                  </h4>
                )}

                {slide.subtitle && (
                  <p className="text-sm text-gray-600 mb-2">{slide.subtitle}</p>
                )}

                {slide.body && (
                  <div className="mt-3 space-y-1.5">
                    {Array.isArray(slide.body) ? (
                      slide.body.map((item, bIdx) => (
                        <p key={bIdx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-pink-500 mt-0.5">•</span>
                          <span>{item}</span>
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-gray-700">{slide.body}</p>
                    )}
                  </div>
                )}

                {slide.visualSuggestion && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                    <p className="text-xs font-semibold text-pink-700 mb-1 flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      Görsel Önerisi
                    </p>
                    <p className="text-xs text-gray-700">{slide.visualSuggestion}</p>
                  </div>
                )}

                {slide.design && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      {slide.design.background && `BG: ${slide.design.background}`}
                      {slide.design.icon && ` | Icon: ${slide.design.icon}`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Caption for Carousel (alternative field) */}
      {content.captionForCarousel && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-gray-700">
              Carousel Caption
            </Label>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(content.captionForCarousel)}
            >
              <Copy className="w-4 h-4 mr-1" />
              Kopyala
            </Button>
          </div>
          <Textarea
            value={content.captionForCarousel}
            onChange={(e) =>
              updateContent("captionForCarousel", e.target.value)
            }
            rows={8}
            className="border-gray-200 focus:border-pink-500 rounded-xl resize-none"
          />
          <p className="text-xs text-gray-500">
            {content.captionForCarousel?.length || 0} karakter
          </p>
        </div>
      )}

      {/* Engagement Strategy */}
      {content.engagementStrategy && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <p className="text-xs font-semibold text-green-700 mb-3">
            Etkileşim Stratejisi
          </p>
          <p className="text-sm text-gray-700">{content.engagementStrategy}</p>
        </div>
      )}

      {/* Hashtags */}
      {content.hashtagStrategy?.hashtags && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700">
            Hashtag Stratejisi
          </Label>
          <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
            <div className="flex flex-wrap gap-2 mb-3">
              {content.hashtagStrategy.hashtags.map((tag, idx) => (
                <Badge
                  key={idx}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {content.hashtagStrategy.placement && (
              <p className="text-xs text-gray-600 mb-1">
                <strong>Yerleşim:</strong> {content.hashtagStrategy.placement}
              </p>
            )}
            {content.hashtagStrategy.rationale && (
              <p className="text-xs text-gray-600 italic">
                <strong>Mantık:</strong> {content.hashtagStrategy.rationale}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Visual Assets (if AI provides it) */}
      {content.visualAssets && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-teal-500" />
            Görsel Varlıklar
          </Label>
          <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
            <div className="space-y-3">
              {content.visualAssets.iconsNeeded &&
                content.visualAssets.iconsNeeded.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-teal-700 mb-2">
                      Gerekli İkonlar:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {content.visualAssets.iconsNeeded.map((icon, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {icon}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              {content.visualAssets.imagesNeeded &&
                content.visualAssets.imagesNeeded.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-teal-700 mb-2">
                      Gerekli Görseller:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {content.visualAssets.imagesNeeded.map((image, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {image}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Expected Performance */}
      {content.performanceOptimization && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <p className="text-xs font-semibold text-purple-700 mb-3 flex items-center gap-2">
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
            {content.performanceOptimization.expectedMetrics && (
              <p>
                <span className="font-medium">Beklenen Metrikler:</span>{" "}
                {content.performanceOptimization.expectedMetrics}
              </p>
            )}
            {content.performanceOptimization.saveWorthiness && (
              <p>
                <span className="font-medium">Kaydetme Değeri:</span>{" "}
                {content.performanceOptimization.saveWorthiness}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Alternative: Expected Performance */}
      {content.expectedPerformance && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <p className="text-xs font-semibold text-purple-700 mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Beklenen Performans
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {content.expectedPerformance.swipeRate && (
              <p>
                <span className="font-medium">Kaydırma Oranı:</span>{" "}
                {content.expectedPerformance.swipeRate}
              </p>
            )}
            {content.expectedPerformance.slideCompletion && (
              <p>
                <span className="font-medium">Slide Tamamlama:</span>{" "}
                {content.expectedPerformance.slideCompletion}
              </p>
            )}
            {content.expectedPerformance.saveWorthiness && (
              <p>
                <span className="font-medium">Kaydetme Değeri:</span>{" "}
                {content.expectedPerformance.saveWorthiness}
              </p>
            )}
            {content.expectedPerformance.shareability && (
              <p>
                <span className="font-medium">Paylaşılabilirlik:</span>{" "}
                {content.expectedPerformance.shareability}
              </p>
            )}
            {content.expectedPerformance.bestPostTime && (
              <p>
                <span className="font-medium">En İyi Paylaşım Saati:</span>{" "}
                {content.expectedPerformance.bestPostTime}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
