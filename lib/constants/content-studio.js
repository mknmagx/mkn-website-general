import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";

/**
 * @deprecated AI_MODELS artık kullanılmıyor!
 * Modeller Firestore ai_models koleksiyonundan useUnifiedAI hook'u ile çekiliyor.
 * Bu export sadece geriye dönük uyumluluk için korunuyor.
 * YENİ KULLANIM: useUnifiedAI(AI_CONTEXTS.XXX) -> availableModels
 */
export const AI_MODELS = [];
// NOT: Eski hardcode model listesi kaldırıldı - Firestore'dan dinamik yükleme kullanın

export const PLATFORMS = [
  {
    value: "instagram",
    label: "Instagram",
    icon: Instagram,
    color: "from-pink-500 to-purple-500",
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: Facebook,
    color: "from-blue-500 to-blue-600",
  },
  {
    value: "x",
    label: "X (Twitter)",
    icon: Twitter,
    color: "from-gray-700 to-gray-900",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    color: "from-blue-600 to-blue-700",
  },
];

export const CONTENT_TYPES = {
  instagram: [
    { value: "post", label: "Post" },
    { value: "carousel", label: "Carousel" },
    { value: "reel", label: "Reel" },
    { value: "story", label: "Story" },
  ],
  facebook: [
    { value: "post", label: "Post" },
    { value: "video", label: "Video" },
  ],
  x: [
    { value: "tweet", label: "Tweet" },
    { value: "thread", label: "Thread" },
  ],
  linkedin: [
    { value: "post", label: "Post" },
    { value: "carousel", label: "Carousel" },
  ],
};
