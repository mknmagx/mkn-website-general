import React, { useState, useEffect } from 'react';
import { useSmartImageSelection } from '@/hooks/use-smart-image-selection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Sparkles, ImageIcon, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Smart Image Selection Component
 * Provides an interface for AI-powered image selection for blog posts
 */
export function SmartImageSelection({ 
  onImageSelect, 
  blogTitle = '', 
  blogContent = '', 
  blogTags = [],
  selectedImageUrl = null,
  className = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('simple'); // 'simple' or 'ai'
  
  const {
    isLoading,
    images,
    bestImage,
    error,
    searchTerms,
    searchSmartImages,
    searchImages,
    clearResults,
    selectImage,
    hasResults
  } = useSmartImageSelection();

  const handleSimpleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      await searchImages(searchQuery, 20);
    } catch (error) {
      console.error('Simple search failed:', error);
    }
  };

  const handleAiSearch = async () => {
    try {
      await searchSmartImages({
        blogTitle,
        blogContent,
        blogTags,
        searchQuery: searchQuery || undefined,
        maxImages: 20,
        analysisMode: 'quick'
      });
      setSearchMode('ai');
    } catch (error) {
      console.error('AI search failed:', error);
    }
  };

  const handleImageSelect = (image) => {
    selectImage(image.id);
    if (onImageSelect) {
      onImageSelect(image);
    }
  };

  // Auto-generate search terms from blog title for better UX
  const generateSearchTerms = () => {
    if (!blogTitle) return [];
    
    // Simple keyword extraction from Turkish title
    const keywords = blogTitle
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['için', 'olan', 'veya', 'ile', 'bir', 'bu', 'şu', 'o'].includes(word))
      .slice(0, 3);
    
    return keywords;
  };

  const suggestedTerms = generateSearchTerms();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-500" />
            Blog Görseli Seçimi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Arama terimi girin (örn: kozmetik, ambalaj, üretim)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSimpleSearch()}
            />
            <Button 
              onClick={handleSimpleSearch}
              disabled={isLoading || !searchQuery.trim()}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Quick Search Suggestions */}
          {suggestedTerms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600">Önerilen aramalar:</span>
              {suggestedTerms.map((term, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery(term);
                    setTimeout(() => handleSimpleSearch(), 100);
                  }}
                  className="h-7 text-xs"
                >
                  {term}
                </Button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleAiSearch}
              disabled={isLoading || (!blogTitle && !searchQuery)}
              className="flex-1"
              variant="default"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              AI ile Akıllı Öneri
            </Button>
            
            {hasResults && (
              <Button variant="ghost" onClick={clearResults}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Temizle
              </Button>
            )}
          </div>

          {/* Search terms display */}
          {searchTerms.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-sm text-gray-600">Arandı:</span>
              {searchTerms.map((term, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {term}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>Hata: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendation (if available) */}
      {searchMode === 'ai' && bestImage && bestImage.analysis && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Önerisi
              {bestImage.analysis.score && (
                <Badge className="bg-green-600 text-white">
                  %{bestImage.analysis.score} uygun
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden ${
                selectedImageUrl === bestImage.url ? 'border-green-500' : 'border-gray-200'
              }`}
              onClick={() => handleImageSelect(bestImage)}
            >
              <img 
                src={bestImage.thumbnailUrl || bestImage.url}
                alt={bestImage.alt}
                className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity"
              />
              {selectedImageUrl === bestImage.url && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                <p className="text-xs">© {bestImage.photographer}</p>
                {bestImage.analysis.reasoning && (
                  <p className="text-xs mt-1 opacity-90">{bestImage.analysis.reasoning}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Grid */}
      {hasResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Bulunan Görseller ({images.length})
              {searchMode === 'ai' && bestImage && (
                <span className="text-sm font-normal text-gray-600">
                  - AI önerisini de aşağıda bulabilirsiniz
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                    selectedImageUrl === image.url ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                  onClick={() => handleImageSelect(image)}
                >
                  <img 
                    src={image.thumbnailUrl || image.url}
                    alt={image.alt}
                    className="w-full h-32 object-cover group-hover:opacity-80 transition-opacity"
                  />
                  
                  {selectedImageUrl === image.url && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-blue-500 bg-white rounded-full" />
                    </div>
                  )}
                  
                  {/* AI Score Badge (if available) */}
                  {image.analysis && image.analysis.score && (
                    <div className="absolute top-2 left-2">
                      <Badge 
                        className="bg-purple-600 text-white text-xs"
                      >
                        AI: %{image.analysis.score}
                      </Badge>
                    </div>
                  )}

                  {/* Best AI recommendation indicator */}
                  {searchMode === 'ai' && bestImage && image.id === bestImage.id && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-green-600 text-white text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Önerisi
                      </Badge>
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1">
                    <p className="text-xs truncate">© {image.photographer}</p>
                  </div>
                </div>
              ))}
            </div>

            {images.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  Bu arama için görsel bulunamadı. Farklı anahtar kelimeler deneyin.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {searchMode === 'ai' ? 'AI ile analiz ediliyor...' : 'Görseller aranıyor...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !hasResults && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">
                Blog yazınız için görsel seçmek üzere arama yapın
              </p>
              <p className="text-sm text-gray-500">
                • Basit arama: Doğrudan anahtar kelime ile arama yapın<br/>
                • AI önerisi: Blog içeriğine en uygun görseli AI seçsin
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}