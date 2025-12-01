import {
  Sparkles,
  Zap,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";

export const AI_MODELS = [
  {
    value: "claude-sonnet-4",
    label: "Claude Sonnet 4 (Önerilen)",
    icon: Sparkles,
    color: "from-purple-500 to-purple-600",
  },
  {
    value: "claude-opus-4",
    label: "Claude Opus 4 (Güçlü)",
    icon: Zap,
    color: "from-orange-500 to-red-500",
  },
  {
    value: "claude-haiku-4",
    label: "Claude Haiku 4 (Hızlı)",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
  },
];

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
