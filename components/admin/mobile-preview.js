"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Repeat,
  Share2,
  ThumbsUp,
  Video,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// MKN Group Logo URL
const MKN_LOGO = "/MKN-GROUP-LOGO.png";

// Platform configurations with real-world image dimensions
const PLATFORM_CONFIG = {
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "from-purple-600 via-pink-600 to-orange-500",
    bgColor: "bg-white",
    username: "mkngroup",
    displayName: "MKN Group",
    contentTypes: {
      post: {
        aspectRatio: "aspect-square", // 1080x1080 (1:1)
        width: 1080,
        height: 1080,
        layout: "feed",
      },
      "post-portrait": {
        aspectRatio: "aspect-[4/5]", // 1080x1350 (4:5)
        width: 1080,
        height: 1350,
        layout: "feed",
      },
      "post-landscape": {
        aspectRatio: "aspect-[1.91/1]", // 1080x566 (~1.91:1)
        width: 1080,
        height: 566,
        layout: "feed",
      },
      story: {
        aspectRatio: "aspect-[9/16]", // 1080x1920 (9:16)
        width: 1080,
        height: 1920,
        layout: "fullscreen",
      },
      reel: {
        aspectRatio: "aspect-[9/16]", // 1080x1920 (9:16)
        width: 1080,
        height: 1920,
        layout: "fullscreen",
      },
      carousel: {
        aspectRatio: "aspect-square", // 1080x1080 (1:1) or 1080x1350 (4:5)
        width: 1080,
        height: 1080,
        layout: "feed",
      },
    },
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "from-blue-600 to-blue-700",
    bgColor: "bg-gray-50",
    username: "MKN Group",
    displayName: "MKN Group",
    contentTypes: {
      post: {
        aspectRatio: "aspect-[1.91/1]", // 1200x630 (1.91:1)
        width: 1200,
        height: 630,
        layout: "feed",
      },
      video: {
        aspectRatio: "aspect-video", // 1280x720 or 1080x1080
        width: 1280,
        height: 720,
        layout: "feed",
      },
      story: {
        aspectRatio: "aspect-[9/16]", // 1080x1920 (9:16)
        width: 1080,
        height: 1920,
        layout: "fullscreen",
      },
    },
  },
  x: {
    name: "X (Twitter)",
    icon: Twitter,
    color: "from-black to-gray-800",
    bgColor: "bg-black",
    username: "@mkngroup",
    displayName: "MKN Group",
    contentTypes: {
      post: {
        aspectRatio: "aspect-[2/1]", // 1024x512 or 1200x628
        width: 1200,
        height: 628,
        layout: "feed",
      },
      thread: {
        aspectRatio: "aspect-[2/1]", // 1024x512 or 1200x628
        width: 1200,
        height: 628,
        layout: "feed",
      },
    },
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "from-blue-700 to-blue-800",
    bgColor: "bg-white",
    username: "MKN Group",
    displayName: "MKN Group",
    contentTypes: {
      post: {
        aspectRatio: "aspect-[1.91/1]", // 1200x627 (1.91:1)
        width: 1200,
        height: 627,
        layout: "feed",
      },
      article: {
        aspectRatio: "aspect-[1.91/1]", // 1200x628
        width: 1200,
        height: 628,
        layout: "feed",
      },
    },
  },
};

export default function MobilePreview({
  platform = "instagram",
  contentType = "post",
  content = {},
  image = null,
  images = [],
  isVideo = false,
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.instagram;
  const contentConfig =
    config.contentTypes[contentType] || config.contentTypes.post;
  const PlatformIcon = config.icon;

  // Extract content text based on structure
  const getContentText = () => {
    if (!content) return "İçerik önizlemesi...";

    // Try different possible text fields based on platform and content type
    return (
      // Instagram
      content.captionForReel ||
      content.fullCaption ||
      content.caption?.text ||
      content.caption ||
      // LinkedIn & Facebook
      content.fullPost ||
      content.fullText?.text ||
      content.fullText ||
      content.body ||
      // X (Twitter)
      content.tweetText ||
      content.text ||
      // General
      content.title ||
      content.hook ||
      content.openingHook ||
      "İçerik önizlemesi..."
    );
  };

  // Extract hashtags
  const getHashtags = () => {
    if (!content) return [];

    // Check various hashtag locations
    const hashtags =
      content.hashtags ||
      content.hashtagStrategy?.hashtags ||
      content.hashtag ||
      [];

    if (Array.isArray(hashtags)) return hashtags;
    if (typeof hashtags === "string") {
      return hashtags.split(" ").filter((tag) => tag.startsWith("#"));
    }
    return [];
  };

  // Render Instagram Content
  const renderInstagram = () => {
    if (contentType === "story") {
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900">
          {/* Story Background */}
          {image && (
            <>
              <Image
                src={image}
                alt="Story"
                fill
                sizes="(max-width: 360px) 100vw, 360px"
                className="object-contain"
                quality={90}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            </>
          )}

          {/* Story Progress Bar */}
          <div className="absolute top-2 left-2 right-2 flex gap-1">
            <div className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-white rounded-full" />
            </div>
          </div>

          {/* Story Header */}
          <div className="absolute top-4 left-0 right-0 px-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
              <Avatar className="w-full h-full bg-white">
                <AvatarImage src={MKN_LOGO} />
                <AvatarFallback>MKN</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-white font-semibold text-sm drop-shadow-lg">
              {config.username}
            </span>
            <span className="text-white/80 text-xs">2dk</span>
            <MoreHorizontal className="ml-auto w-5 h-5 text-white drop-shadow-lg" />
          </div>

          {/* Story Content */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="text-center">
              {content?.visualSuggestion?.emoji && (
                <div className="text-7xl mb-4 animate-bounce">
                  {content.visualSuggestion.emoji}
                </div>
              )}
              <p className="text-white text-2xl font-bold drop-shadow-2xl leading-tight">
                {getContentText()}
              </p>
            </div>
          </div>

          {/* Story Actions */}
          <div className="absolute bottom-4 left-0 right-0 px-3 flex items-center gap-3">
            <input
              type="text"
              placeholder="Mesaj gönder..."
              className="flex-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 text-white placeholder:text-white/70 text-sm"
              readOnly
            />
            <Heart className="w-7 h-7 text-white drop-shadow-lg" />
            <Send className="w-7 h-7 text-white drop-shadow-lg" />
          </div>
        </div>
      );
    }

    if (contentType === "reel") {
      return (
        <div className="relative w-full h-full bg-black">
          {/* Reel Video */}
          <div className="absolute inset-0">
            {image && isVideo ? (
              <div className="relative w-full h-full">
                <video
                  key={image}
                  src={image}
                  loop
                  muted={isMuted}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                  ref={(video) => {
                    if (video) {
                      video.play().catch(() => {});
                      isPlaying ? video.play().catch(() => {}) : video.pause();
                    }
                  }}
                />

                  {/* Video Controls - Minimalist */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                </div>
            ) : image && !isVideo ? (
              <Image
                src={image}
                alt="Reel"
                fill
                sizes="(max-width: 360px) 100vw, 360px"
                className="object-contain"
                quality={90}
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                <Play className="w-20 h-20 text-white/70" />
              </div>
            )}
          </div>

          {/* Reel Sidebar Actions */}
          <div className="absolute right-2 bottom-16 flex flex-col gap-5">
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => setLiked(!liked)}>
                <Heart
                  className={`w-7 h-7 ${
                    liked ? "fill-white text-white" : "text-white"
                  } drop-shadow-lg`}
                />
              </button>
              <span className="text-white text-xs font-semibold drop-shadow-lg">
                2.5K
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
              <span className="text-white text-xs font-semibold drop-shadow-lg">
                142
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Send className="w-7 h-7 text-white drop-shadow-lg" />
              <span className="text-white text-xs font-semibold drop-shadow-lg">
                89
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <MoreHorizontal className="w-7 h-7 text-white drop-shadow-lg" />
            </div>
            <div className="w-8 h-8 rounded-lg border-2 border-white overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
            </div>
          </div>

          {/* Reel Info */}
          <div className="absolute bottom-0 left-0 right-12 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="w-8 h-8 bg-white">
                <AvatarImage src={MKN_LOGO} />
                <AvatarFallback>MKN</AvatarFallback>
              </Avatar>
              <span className="text-white font-semibold text-sm">
                {config.username}
              </span>
              <button className="px-3 py-1 border border-white rounded-lg text-white text-xs font-semibold">
                Takip Et
              </button>
            </div>

            {/* Caption with expand functionality */}
            <div
              onClick={() => setExpanded(!expanded)}
              className="cursor-pointer"
            >
              <p
                className={`text-white text-sm ${
                  expanded ? "" : "line-clamp-2"
                }`}
              >
                <span className="font-semibold">{config.username}</span>{" "}
                {expanded ? (
                  getContentText()
                ) : (
                  <>
                    {getContentText().length > 80 ? (
                      <>
                        {getContentText().substring(0, 80)}...{" "}
                        <span className="text-white/70">daha fazla</span>
                      </>
                    ) : (
                      getContentText()
                    )}
                  </>
                )}
              </p>
            </div>

            {getHashtags().length > 0 && (
              <p className="text-white text-sm mt-1 line-clamp-1">
                {getHashtags().join(" ")}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Instagram Post (Feed)
    return (
      <div className="w-full h-full overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {/* Post Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
              <Avatar className="w-full h-full bg-white">
                <AvatarImage src={MKN_LOGO} />
                <AvatarFallback>MKN</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="font-semibold text-sm">{config.username}</p>
              <p className="text-xs text-gray-500">İstanbul, Türkiye</p>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5" />
        </div>

        {/* Post Image/Video */}
        <div
          className={`w-full ${contentConfig.aspectRatio} bg-gray-100 flex items-center justify-center overflow-hidden relative`}
        >
          {images.length > 0 ? (
            // Carousel Mode - Multiple Images
            <>
              <Image
                src={images[currentImageIndex]}
                alt={`Post ${currentImageIndex + 1}`}
                fill
                sizes="(max-width: 360px) 100vw, 360px"
                className="object-contain"
                quality={85}
              />

              {/* Carousel Indicators */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                <p className="text-white text-xs font-medium">
                  {currentImageIndex + 1}/{images.length}
                </p>
              </div>

              {/* Carousel Navigation Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "bg-blue-500 w-2 h-2"
                        : "bg-white/60"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Arrows (on hover) */}
              {images.length > 1 && (
                <>
                  {currentImageIndex > 0 && (
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                  )}
                  {currentImageIndex < images.length - 1 && (
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </>
          ) : image ? (
            // Single Image/Video Mode
            isVideo ? (
              <div className="relative w-full h-full">
                <video
                  src={image}
                  controls={false}
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error("Post video loading error:", e);
                    console.log("Post video src:", image);
                  }}
                  onLoadedData={() => {
                    console.log("Post video loaded successfully:", image);
                  }}
                  ref={(video) => {
                    if (video) {
                      isPlaying ? video.play() : video.pause();
                    }
                  }}
                />

                {/* Video Controls - Minimalist */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <Image
                src={image}
                alt="Post"
                fill
                sizes="(max-width: 360px) 100vw, 360px"
                className="object-contain"
                quality={85}
              />
            )
          ) : (
            <div className="text-center">
              <Instagram className="w-16 h-16 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-400 text-sm">Görsel Yok</p>
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button onClick={() => setLiked(!liked)}>
                <Heart
                  className={`w-6 h-6 ${
                    liked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </button>
              <MessageCircle className="w-6 h-6" />
              <Send className="w-6 h-6" />
            </div>
            <button onClick={() => setSaved(!saved)}>
              <Bookmark className={`w-6 h-6 ${saved ? "fill-black" : ""}`} />
            </button>
          </div>

          <p className="font-semibold text-sm mb-2">3,547 beğenme</p>

          <div className="text-sm space-y-1">
            <p>
              <span className="font-semibold">{config.username}</span>{" "}
              <span className="whitespace-pre-wrap">
                {expanded ? (
                  getContentText()
                ) : (
                  <>
                    {getContentText().length > 100 ? (
                      <>
                        {getContentText().substring(0, 100)}...
                        <button
                          onClick={() => setExpanded(true)}
                          className="text-gray-500 ml-1"
                        >
                          daha fazla
                        </button>
                      </>
                    ) : (
                      getContentText()
                    )}
                  </>
                )}
              </span>
            </p>
            {getHashtags().length > 0 && (
              <p className="text-blue-900">{getHashtags().join(" ")}</p>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-2">2 saat önce</p>
        </div>
      </div>
    );
  };

  // Render Facebook Content
  const renderFacebook = () => {
    if (contentType === "story") {
      return (
        <div className="relative w-full h-full bg-gradient-to-br from-blue-900 to-blue-700">
          {image && (
            <>
              <Image
                src={image}
                alt="Story"
                fill
                sizes="(max-width: 360px) 100vw, 360px"
                className="object-contain"
                quality={90}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
            </>
          )}

          <div className="absolute top-4 left-3 right-3 flex items-center gap-2">
            <Avatar className="w-10 h-10 bg-white">
              <AvatarImage src={MKN_LOGO} />
              <AvatarFallback>MKN</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold text-sm drop-shadow-lg">
                {config.displayName}
              </p>
              <p className="text-white/80 text-xs">2dk önce</p>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="text-white text-2xl font-bold text-center drop-shadow-2xl">
              {getContentText()}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full overflow-y-auto bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        <div className="bg-white">
          {/* Post Header */}
          <div className="p-3 flex items-start gap-2">
            <Avatar className="w-10 h-10 bg-white">
              <AvatarImage src={MKN_LOGO} />
              <AvatarFallback>MKN</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">{config.displayName}</p>
              <p className="text-xs text-gray-500">2 saat · 🌍</p>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </div>

          {/* Post Text */}
          <div className="px-3 pb-3">
            <p className="text-sm whitespace-pre-wrap">
              {expanded ? (
                getContentText()
              ) : (
                <>
                  {getContentText().length > 150 ? (
                    <>
                      {getContentText().substring(0, 150)}...
                      <button
                        onClick={() => setExpanded(true)}
                        className="text-gray-600 font-semibold ml-1"
                      >
                        Daha fazla görüntüle
                      </button>
                    </>
                  ) : (
                    getContentText()
                  )}
                </>
              )}
            </p>
            {getHashtags().length > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                {getHashtags().join(" ")}
              </p>
            )}
          </div>
        </div>

        {/* Post Image/Video */}
        <div
          className={`w-full ${contentConfig.aspectRatio} relative bg-gray-200`}
        >
          {image ? (
            isVideo ? (
              <div className="relative w-full h-full">
                <video
                  src={image}
                  controls={false}
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-contain"
                  ref={(video) => {
                    if (video) {
                      isPlaying ? video.play() : video.pause();
                    }
                  }}
                />

                {/* Video Controls - Minimalist */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <Image
                src={image}
                alt="Post"
                fill
                sizes="(max-width: 360px) 100vw, 360px"
                className="object-contain"
                quality={85}
              />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Facebook className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Post Stats & Actions */}
        <div className="bg-white">
          <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-600">
            <span>👍❤️ 2.8K</span>
            <span>156 yorum · 89 paylaşım</span>
          </div>

          <div className="border-t grid grid-cols-3">
            <button className="flex items-center justify-center gap-1 py-2 hover:bg-gray-50">
              <ThumbsUp className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Beğen</span>
            </button>
            <button className="flex items-center justify-center gap-1 py-2 hover:bg-gray-50 border-x">
              <MessageCircle className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Yorum</span>
            </button>
            <button className="flex items-center justify-center gap-1 py-2 hover:bg-gray-50">
              <Share2 className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Paylaş</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render X (Twitter) Content
  const renderX = () => {
    const isThread =
      contentType === "thread" ||
      (content?.tweets && Array.isArray(content.tweets));
    const tweets = isThread ? content.tweets || [] : [content];

    return (
      <div className="w-full h-full overflow-y-auto bg-black text-white scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
        {tweets.slice(0, 3).map((tweet, idx) => (
          <div
            key={idx}
            className={`${idx > 0 ? "border-t border-gray-800" : ""}`}
          >
            <div className="p-3">
              <div className="flex items-start gap-2">
                <Avatar className="w-10 h-10 flex-shrink-0 bg-white">
                  <AvatarImage src={MKN_LOGO} />
                  <AvatarFallback>MKN</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-sm">
                      {config.displayName}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {config.username}
                    </span>
                    <span className="text-gray-500 text-sm">· 2s</span>
                  </div>

                  <p className="text-sm whitespace-pre-wrap mb-2">
                    {typeof tweet === "string"
                      ? tweet
                      : tweet?.text || tweet?.title || getContentText()}
                  </p>

                  {idx === 0 && image && (
                    <div
                      className={`rounded-2xl overflow-hidden border border-gray-800 mb-2 ${contentConfig.aspectRatio} relative bg-gray-900`}
                    >
                      {isVideo ? (
                        <>
                          <video
                            src={image}
                            controls={false}
                            loop
                            muted={isMuted}
                            playsInline
                            className="w-full h-full object-contain"
                            ref={(video) => {
                              if (video) {
                                isPlaying ? video.play() : video.pause();
                              }
                            }}
                          />

                          {/* Video Controls */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/80 transition-all"
                            >
                              {isPlaying ? (
                                <Pause className="w-4 h-4 text-white" />
                              ) : (
                                <Play className="w-4 h-4 text-white ml-0.5" />
                              )}
                            </button>
                            <button
                              onClick={() => setIsMuted(!isMuted)}
                              className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/80 transition-all"
                            >
                              {isMuted ? (
                                <VolumeX className="w-4 h-4 text-white" />
                              ) : (
                                <Volume2 className="w-4 h-4 text-white" />
                              )}
                            </button>
                          </div>
                        </>
                      ) : (
                        <Image
                          src={image}
                          alt="Tweet media"
                          fill
                          sizes="(max-width: 360px) 100vw, 360px"
                          className="object-contain"
                          quality={85}
                        />
                      )}
                    </div>
                  )}

                  {idx === 0 && getHashtags().length > 0 && (
                    <p className="text-sm text-blue-500 mb-2">
                      {getHashtags().join(" ")}
                    </p>
                  )}

                  <div className="flex items-center justify-between max-w-md text-gray-500">
                    <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">24</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                      <Repeat className="w-4 h-4" />
                      <span className="text-xs">12</span>
                    </button>
                    <button
                      onClick={() => setLiked(!liked)}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          liked ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                      <span className="text-xs">156</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <MoreHorizontal className="w-5 h-5 text-gray-500 flex-shrink-0" />
              </div>

              {isThread && idx < tweets.length - 1 && (
                <div className="ml-5 mt-2 mb-2 w-[2px] h-4 bg-gray-800" />
              )}
            </div>
          </div>
        ))}

        {isThread && tweets.length > 3 && (
          <div className="px-3 pb-3">
            <p className="text-blue-500 text-sm">
              Thread'in devamını göster ({tweets.length - 3} tweet daha)
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render LinkedIn Content
  const renderLinkedIn = () => {
    // Get full caption text - prioritize caption field
    const fullCaption =
      content?.caption?.text ||
      content?.caption ||
      content?.fullPost ||
      content?.fullText?.text ||
      content?.fullText ||
      content?.text ||
      content?.body?.text ||
      content?.body ||
      getContentText() ||
      "";

    return (
      <div className="w-full h-full overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        <div className="border-b">
          {/* Post Header */}
          <div className="p-3 flex items-start gap-2">
            <Avatar className="w-12 h-12 bg-white">
              <AvatarImage src={MKN_LOGO} />
              <AvatarFallback>MKN</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">{config.displayName}</p>
              <p className="text-xs text-gray-600">
                Kozmetik Üretim · E-Ticaret
              </p>
              <p className="text-xs text-gray-500">2 saat · 🌍</p>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </div>

          {/* Post Text */}
          <div className="px-3 pb-3">
            <p className="text-sm whitespace-pre-wrap">
              {fullCaption ? (
                expanded ? (
                  fullCaption
                ) : (
                  <>
                    {fullCaption.length > 200 ? (
                      <>
                        {fullCaption.substring(0, 200)}...
                        <button
                          onClick={() => setExpanded(true)}
                          className="text-gray-600 font-semibold ml-1 hover:underline"
                        >
                          ...daha fazla görüntüle
                        </button>
                      </>
                    ) : (
                      fullCaption
                    )}
                  </>
                )
              ) : (
                "İçerik önizlemesi..."
              )}
            </p>

            {content?.takeaways &&
              Array.isArray(content.takeaways) &&
              content.takeaways.length > 0 &&
              expanded && (
                <div className="mt-3 space-y-1">
                  {content.takeaways.map((item, idx) => (
                    <p key={idx} className="text-sm">
                      • {item}
                    </p>
                  ))}
                </div>
              )}

            {getHashtags().length > 0 && (
              <p className="text-sm text-blue-700 mt-2">
                {getHashtags().join(" ")}
              </p>
            )}
          </div>
        </div>

        {/* Post Image/Carousel */}
        <div
          className={`w-full ${contentConfig.aspectRatio} relative bg-gray-100`}
        >
          {images.length > 0 ? (
            // Carousel Mode - Multiple Images
            <>
              <Image
                src={images[currentImageIndex]}
                alt={`Slide ${currentImageIndex + 1}`}
                fill
                sizes="(max-width: 360px) 100vw, 360px"
                className="object-contain"
                quality={85}
              />

              {/* Carousel Counter */}
              <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg">
                <p className="text-white text-xs font-semibold">
                  {currentImageIndex + 1}/{images.length}
                </p>
              </div>

              {/* Carousel Navigation */}
              {images.length > 1 && (
                <>
                  {currentImageIndex > 0 && (
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180 text-gray-700" />
                    </button>
                  )}
                  {currentImageIndex < images.length - 1 && (
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  )}
                </>
              )}

              {/* Slide Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "bg-blue-600 w-6"
                        : "bg-gray-300 w-2"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : image ? (
            // Single Image/Video Mode
            isVideo ? (
              <>
                <video
                  src={image}
                  controls={false}
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-contain"
                  ref={(video) => {
                    if (video) {
                      isPlaying ? video.play() : video.pause();
                    }
                  }}
                />

                {/* Video Controls */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <Image
                src={image}
                alt="Post"
                fill
                sizes="(max-width: 360px) 100vw, 360px"
                className="object-contain"
                quality={85}
              />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Linkedin className="w-16 h-16 text-gray-300" />
            </div>
          )}
        </div>

        {/* Post Stats & Actions */}
        <div className="bg-white">
          <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-600 border-b">
            <span>👍💡 1.2K</span>
            <span>87 yorum · 34 paylaşım</span>
          </div>

          <div className="grid grid-cols-4">
            <button className="flex flex-col items-center justify-center py-2 hover:bg-gray-50">
              <ThumbsUp className="w-5 h-5 text-gray-600" />
              <span className="text-[10px] text-gray-600 mt-1">Beğen</span>
            </button>
            <button className="flex flex-col items-center justify-center py-2 hover:bg-gray-50 border-x">
              <MessageCircle className="w-5 h-5 text-gray-600" />
              <span className="text-[10px] text-gray-600 mt-1">Yorum</span>
            </button>
            <button className="flex flex-col items-center justify-center py-2 hover:bg-gray-50 border-r">
              <Repeat className="w-5 h-5 text-gray-600" />
              <span className="text-[10px] text-gray-600 mt-1">Paylaş</span>
            </button>
            <button className="flex flex-col items-center justify-center py-2 hover:bg-gray-50">
              <Send className="w-5 h-5 text-gray-600" />
              <span className="text-[10px] text-gray-600 mt-1">Gönder</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full h-full bg-white border-0 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlatformIcon className="w-5 h-5 text-gray-700" />
          <span className="text-gray-900 font-semibold text-sm">
            {config.name}
          </span>
        </div>
        <Badge
          variant="secondary"
          className="text-xs font-medium bg-gray-100 text-gray-700 border-0"
        >
          {contentType}
        </Badge>
      </div>

      {/* Mobile Device Frame */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative mx-auto max-w-[360px]">
          {/* Device Frame */}
          <div className="relative aspect-[9/19.5] bg-black rounded-[2.5rem] shadow-2xl overflow-hidden border-[10px] border-black">
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-black z-20 flex items-center justify-between px-8 text-white text-xs font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2.5 border border-white/50 rounded-sm relative">
                  <div className="absolute inset-0.5 bg-white rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="absolute inset-0 top-6 overflow-hidden">
              {platform === "instagram" && renderInstagram()}
              {platform === "facebook" && renderFacebook()}
              {platform === "x" && renderX()}
              {platform === "linkedin" && renderLinkedIn()}
            </div>

            {/* Home Indicator (iPhone style) */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}
