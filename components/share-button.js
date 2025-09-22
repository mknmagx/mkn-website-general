"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function ShareButton({ 
  title, 
  description, 
  url, 
  image,
  className = "",
  variant = "outline",
  size = "sm" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Paylaşım URL'lerini oluştur
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
  };

  // Web Share API kontrolü
  const canUseNativeShare = typeof navigator !== 'undefined' && navigator.share;

  // Native paylaşım fonksiyonu
  const handleNativeShare = async () => {
    if (canUseNativeShare) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        setIsOpen(false);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Paylaşım hatası:', error);
          toast.error("Paylaşım sırasında bir hata oluştu");
        }
      }
    }
  };

  // Sosyal medya paylaşımı
  const handleSocialShare = (platform) => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    setIsOpen(false);
    
    // Analytics tracking (isteğe bağlı)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        method: platform,
        content_type: 'article',
        content_id: url,
      });
    }
  };

  // Link kopyalama
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link kopyalandı!");
      
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Kopyalama hatası:', error);
      toast.error("Link kopyalanamadı");
    }
  };

  // Fallback link kopyalama (eski tarayıcılar için)
  const handleFallbackCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopied(true);
      toast.success("Link kopyalandı!");
      
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Kopyalama hatası:', error);
      toast.error("Link kopyalanamadı");
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const copyToClipboard = navigator.clipboard ? handleCopyLink : handleFallbackCopy;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`flex items-center gap-2 rounded-full ${className}`}
        >
          <Share2 className="w-4 h-4" />
          Paylaş
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Bu yazıyı paylaş</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>

          <div className="space-y-3">
            {/* Native Share (mobil cihazlarda) */}
            {canUseNativeShare && (
              <Button
                onClick={handleNativeShare}
                variant="outline"
                className="w-full justify-start gap-3 h-12"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">Paylaş</div>
                  <div className="text-xs text-muted-foreground">
                    Sistem paylaşım menüsü
                  </div>
                </div>
              </Button>
            )}

            {/* Sosyal Medya Butonları */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleSocialShare('facebook')}
                variant="outline"
                className="justify-start gap-3 h-12"
              >
                <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <Facebook className="w-4 h-4 text-white fill-current" />
                </div>
                <span className="font-medium text-sm">Facebook</span>
              </Button>

              <Button
                onClick={() => handleSocialShare('twitter')}
                variant="outline"
                className="justify-start gap-3 h-12"
              >
                <div className="w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center">
                  <Twitter className="w-4 h-4 text-white fill-current" />
                </div>
                <span className="font-medium text-sm">Twitter</span>
              </Button>

              <Button
                onClick={() => handleSocialShare('linkedin')}
                variant="outline"
                className="justify-start gap-3 h-12"
              >
                <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center">
                  <Linkedin className="w-4 h-4 text-white fill-current" />
                </div>
                <span className="font-medium text-sm">LinkedIn</span>
              </Button>

              <Button
                onClick={() => handleSocialShare('whatsapp')}
                variant="outline"
                className="justify-start gap-3 h-12"
              >
                <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white fill-current" />
                </div>
                <span className="font-medium text-sm">WhatsApp</span>
              </Button>
            </div>

            {/* Link Kopyalama */}
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              disabled={copied}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">
                  {copied ? "Kopyalandı!" : "Linki Kopyala"}
                </div>
                <div className="text-xs text-muted-foreground truncate max-w-48">
                  {url}
                </div>
              </div>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}