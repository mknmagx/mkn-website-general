/**
 * Content Studio - Platform ve Post Tiplerine Göre Field Yapıları
 * 
 * Bu dosya tüm platformların tüm post tiplerinin içerik field yapılarını içerir.
 * Calendar view, content preview dialog ve diğer yerlerde kullanılabilir.
 * 
 * Her platform ve post tipi için:
 * - Field adları ve tipleri
 * - Field açıklamaları
 * - Zorunlu/opsiyonel durumları
 * - Alt yapılar (nested objects/arrays)
 */

// ============================================================================
// INSTAGRAM CONTENT FIELDS
// ============================================================================

export const INSTAGRAM_POST_FIELDS = {
  platform: "instagram",
  contentType: "post",
  fields: {
    hook: {
      type: "string",
      required: true,
      description: "İlk 125 karakter - kullanıcıyı çeken açılış",
      maxLength: 125,
      displayPriority: 1,
      editable: true
    },
    fullCaption: {
      type: "string",
      required: true,
      description: "Tam caption metni",
      maxLength: 2200,
      displayPriority: 2,
      editable: true
    },
    hashtagStrategy: {
      type: "object",
      required: false,
      description: "Hashtag stratejisi ve seçimi",
      displayPriority: 5,
      fields: {
        hashtags: {
          type: "array",
          required: true,
          description: "Kullanılacak hashtag listesi",
          itemType: "string",
          maxItems: 30
        },
        rationale: {
          type: "string",
          required: false,
          description: "Hashtag seçim mantığı"
        },
        placement: {
          type: "string",
          required: false,
          description: "Hashtag yerleşimi (caption içi/yorum)"
        }
      }
    },
    visualSuggestions: {
      type: "object",
      required: false,
      description: "Görsel önerileri",
      displayPriority: 4,
      fields: {
        primary: {
          type: "string",
          required: false,
          description: "Ana görsel önerisi"
        },
        carouselIdea: {
          type: "string",
          required: false,
          description: "Carousel fikri"
        },
        alternativeVisuals: {
          type: "array",
          required: false,
          description: "Alternatif görsel fikirleri",
          itemType: "string"
        }
      }
    },
    performanceOptimization: {
      type: "object",
      required: false,
      description: "Performans optimizasyon önerileri",
      displayPriority: 6,
      fields: {
        bestPostTime: {
          type: "string",
          required: false,
          description: "En iyi paylaşım zamanı"
        },
        saveWorthiness: {
          type: "string",
          required: false,
          description: "Neden kaydedilir analizi"
        },
        engagementHooks: {
          type: "array",
          required: false,
          description: "Etkileşim tetikleyicileri",
          itemType: "string"
        }
      }
    },
    cta: {
      type: "string",
      required: false,
      description: "Call to action metni",
      displayPriority: 3
    },
    tone: {
      type: "string",
      required: false,
      description: "İçerik tonu"
    },
    targetAudience: {
      type: "string",
      required: false,
      description: "Hedef kitle"
    }
  }
};

export const INSTAGRAM_REEL_FIELDS = {
  platform: "instagram",
  contentType: "reel",
  fields: {
    reelConcept: {
      type: "string",
      required: true,
      description: "Reel konsepti ve ana fikir",
      displayPriority: 1,
      editable: true
    },
    duration: {
      type: "string",
      required: false,
      description: "Reel süresi (örn: '15 saniye', '30 saniye')",
      displayPriority: 2
    },
    script: {
      type: "object",
      required: true,
      description: "Detaylı timeline script",
      displayPriority: 3,
      fields: {
        hook: {
          type: "object",
          required: true,
          description: "İlk 1-2 saniye hook",
          fields: {
            timestamp: {
              type: "string",
              required: true,
              description: "Zaman damgası (örn: '0-1 sn')"
            },
            visual: {
              type: "string",
              required: true,
              description: "Görsel açıklaması"
            },
            cameraAngle: {
              type: "string",
              required: false,
              description: "Kamera açısı"
            },
            onScreenText: {
              type: "string",
              required: true,
              description: "Ekranda görünecek metin"
            },
            audio: {
              type: "string",
              required: false,
              description: "Ses/müzik açıklaması"
            }
          }
        },
        promise: {
          type: "object",
          required: false,
          description: "İzleyiciye verilen söz/vaad",
          fields: {
            timestamp: {
              type: "string",
              required: true,
              description: "Zaman damgası"
            },
            visual: {
              type: "string",
              required: true,
              description: "Görsel açıklaması"
            },
            transition: {
              type: "string",
              required: false,
              description: "Geçiş efekti"
            },
            onScreenText: {
              type: "string",
              required: true,
              description: "Ekran metni"
            }
          }
        },
        valuePoints: {
          type: "array",
          required: true,
          description: "Ana değer noktaları/adımlar",
          itemType: "object",
          fields: {
            timestamp: {
              type: "string",
              required: true,
              description: "Zaman damgası"
            },
            point: {
              type: "string",
              required: true,
              description: "Ana nokta/mesaj"
            },
            visual: {
              type: "string",
              required: true,
              description: "Görsel açıklaması"
            },
            transition: {
              type: "string",
              required: false,
              description: "Geçiş efekti"
            },
            onScreenText: {
              type: "string",
              required: true,
              description: "Ekran metni"
            }
          }
        },
        payoff: {
          type: "object",
          required: true,
          description: "Son - sonuç/CTA",
          fields: {
            timestamp: {
              type: "string",
              required: true,
              description: "Zaman damgası"
            },
            visual: {
              type: "string",
              required: true,
              description: "Görsel açıklaması"
            },
            onScreenText: {
              type: "string",
              required: true,
              description: "Ekran metni"
            },
            loopability: {
              type: "string",
              required: false,
              description: "Döngü özelliği"
            }
          }
        }
      }
    },
    audioSuggestions: {
      type: "object",
      required: false,
      description: "Ses/müzik önerileri",
      displayPriority: 5,
      fields: {
        original: {
          type: "string",
          required: false,
          description: "Orijinal ses önerisi"
        },
        trending: {
          type: "array",
          required: false,
          description: "Trending ses önerileri",
          itemType: "string"
        },
        voiceoverScript: {
          type: "string",
          required: false,
          description: "Voiceover script metni"
        }
      }
    },
    shootingNotes: {
      type: "object",
      required: false,
      description: "Çekim notları",
      displayPriority: 7,
      fields: {
        location: {
          type: "string",
          required: false,
          description: "Lokasyon"
        },
        equipment: {
          type: "string",
          required: false,
          description: "Gerekli ekipman"
        },
        lighting: {
          type: "string",
          required: false,
          description: "Işık ayarları"
        },
        props: {
          type: "string",
          required: false,
          description: "Gerekli props"
        }
      }
    },
    captionForReel: {
      type: "string",
      required: false,
      description: "Reel için caption",
      displayPriority: 4,
      editable: true,
      maxLength: 2200
    },
    editingNotes: {
      type: "object",
      required: false,
      description: "Düzenleme notları",
      displayPriority: 8,
      fields: {
        software: {
          type: "string",
          required: false,
          description: "Önerilen yazılım"
        },
        effects: {
          type: "array",
          required: false,
          description: "Kullanılacak efektler",
          itemType: "string"
        },
        colorGrade: {
          type: "string",
          required: false,
          description: "Renk düzeltme önerisi"
        },
        pacing: {
          type: "string",
          required: false,
          description: "Tempo/hız"
        }
      }
    },
    expectedPerformance: {
      type: "string",
      required: false,
      description: "Beklenen performans analizi",
      displayPriority: 9
    }
  }
};

export const INSTAGRAM_STORY_FIELDS = {
  platform: "instagram",
  contentType: "story",
  fields: {
    seriesConcept: {
      type: "string",
      required: true,
      description: "Story serisi genel konsepti",
      displayPriority: 1,
      editable: true
    },
    totalStories: {
      type: "number",
      required: false,
      description: "Toplam story sayısı",
      displayPriority: 2
    },
    stories: {
      type: "array",
      required: true,
      description: "Story listesi",
      displayPriority: 3,
      itemType: "object",
      fields: {
        storyNumber: {
          type: "number",
          required: true,
          description: "Story numarası"
        },
        type: {
          type: "string",
          required: true,
          description: "Story tipi (static, interactive, video, boomerang vb.)"
        },
        visual: {
          type: "object",
          required: true,
          description: "Görsel detayları",
          fields: {
            background: {
              type: "string",
              required: true,
              description: "Arka plan açıklaması"
            },
            mainElement: {
              type: "string",
              required: false,
              description: "Ana görsel element"
            },
            filterSuggestion: {
              type: "string",
              required: false,
              description: "Filtre önerisi"
            }
          }
        },
        text: {
          type: "object",
          required: false,
          description: "Metin içeriği",
          fields: {
            mainText: {
              type: "string",
              required: true,
              description: "Ana metin"
            },
            placement: {
              type: "string",
              required: false,
              description: "Metin pozisyonu (top, center, bottom)"
            },
            font: {
              type: "string",
              required: false,
              description: "Font stili"
            },
            animation: {
              type: "string",
              required: false,
              description: "Metin animasyonu"
            }
          }
        },
        interactiveElements: {
          type: "array",
          required: false,
          description: "İnteraktif elementler",
          itemType: "object",
          fields: {
            type: {
              type: "string",
              required: true,
              description: "Element tipi (poll, question, quiz, slider, countdown vb.)"
            },
            content: {
              type: "string",
              required: true,
              description: "Element içeriği"
            },
            options: {
              type: "array",
              required: false,
              description: "Seçenekler (poll/quiz için)",
              itemType: "string"
            }
          }
        },
        stickers: {
          type: "array",
          required: false,
          description: "Kullanılacak stickerlar",
          itemType: "string"
        },
        cta: {
          type: "string",
          required: false,
          description: "Call to action"
        },
        linkSwipeUp: {
          type: "string",
          required: false,
          description: "Swipe up link (10k+ takipçi için)"
        },
        hashtags: {
          type: "array",
          required: false,
          description: "Story hashtag'leri",
          itemType: "string"
        },
        mentions: {
          type: "array",
          required: false,
          description: "Mention edilecek hesaplar",
          itemType: "string"
        }
      }
    },
    overallStrategy: {
      type: "object",
      required: false,
      description: "Genel strateji",
      displayPriority: 4,
      fields: {
        narrative: {
          type: "string",
          required: false,
          description: "Hikaye anlatımı"
        },
        engagement: {
          type: "string",
          required: false,
          description: "Etkileşim stratejisi"
        },
        conversion: {
          type: "string",
          required: false,
          description: "Dönüşüm hedefi"
        }
      }
    }
  }
};

// ============================================================================
// X (TWITTER) CONTENT FIELDS
// ============================================================================

export const X_TWEET_FIELDS = {
  platform: "x",
  contentType: "tweet",
  fields: {
    tweetText: {
      type: "string",
      required: true,
      description: "Tweet metni",
      maxLength: 280,
      displayPriority: 1,
      editable: true
    },
    characterCount: {
      type: "number",
      required: false,
      description: "Karakter sayısı",
      displayPriority: 2,
      computed: true
    },
    visualSuggestion: {
      type: "object",
      required: false,
      description: "Görsel önerisi",
      displayPriority: 4,
      fields: {
        imageType: {
          type: "string",
          required: false,
          description: "Görsel tipi"
        },
        imageDescription: {
          type: "string",
          required: false,
          description: "Görsel açıklaması"
        },
        designNotes: {
          type: "string",
          required: false,
          description: "Tasarım notları"
        }
      }
    },
    hashtags: {
      type: "array",
      required: false,
      description: "Hashtag listesi",
      displayPriority: 5,
      itemType: "string",
      maxItems: 5
    },
    engagementHooks: {
      type: "object",
      required: false,
      description: "Etkileşim stratejisi",
      displayPriority: 6,
      fields: {
        quoteTweetBait: {
          type: "string",
          required: false,
          description: "Quote tweet tetikleyicisi"
        },
        replyStarter: {
          type: "string",
          required: false,
          description: "Cevap başlatıcı"
        },
        bookmarkWorthiness: {
          type: "string",
          required: false,
          description: "Bookmark değeri"
        }
      }
    },
    timing: {
      type: "object",
      required: false,
      description: "Zamanlama önerileri",
      displayPriority: 7,
      fields: {
        bestTime: {
          type: "string",
          required: false,
          description: "En iyi paylaşım zamanı"
        },
        trendRelevance: {
          type: "string",
          required: false,
          description: "Trend ilişkisi"
        },
        dayRecommendation: {
          type: "string",
          required: false,
          description: "Gün önerisi"
        }
      }
    },
    expectedPerformance: {
      type: "object",
      required: false,
      description: "Beklenen performans",
      displayPriority: 8,
      fields: {
        viralPotential: {
          type: "string",
          required: false,
          description: "Viral potansiyeli"
        },
        expectedEngagement: {
          type: "string",
          required: false,
          description: "Beklenen etkileşim"
        },
        audienceResonance: {
          type: "string",
          required: false,
          description: "Hedef kitle uyumu"
        }
      }
    },
    threadPotential: {
      type: "object",
      required: false,
      description: "Thread potansiyeli",
      displayPriority: 9,
      fields: {
        canExpandToThread: {
          type: "boolean",
          required: false,
          description: "Thread'e dönüştürülebilir mi"
        },
        threadHookIdea: {
          type: "string",
          required: false,
          description: "Thread hook fikri"
        },
        estimatedTweetCount: {
          type: "number",
          required: false,
          description: "Tahmini tweet sayısı"
        }
      }
    },
    alternativeVersions: {
      type: "array",
      required: false,
      description: "Alternatif tweet versiyonları",
      displayPriority: 10,
      itemType: "string"
    }
  }
};

export const X_THREAD_FIELDS = {
  platform: "x",
  contentType: "thread",
  fields: {
    threadConcept: {
      type: "string",
      required: true,
      description: "Thread konsepti ve genel fikir",
      displayPriority: 1,
      editable: true
    },
    threadLength: {
      type: "number",
      required: true,
      description: "Thread uzunluğu (tweet sayısı)",
      displayPriority: 2
    },
    tweets: {
      type: "array",
      required: true,
      description: "Tweet listesi",
      displayPriority: 3,
      itemType: "object",
      fields: {
        tweetNumber: {
          type: "number",
          required: true,
          description: "Tweet numarası"
        },
        position: {
          type: "string",
          required: false,
          description: "Pozisyon (hook, body, conclusion)"
        },
        text: {
          type: "string",
          required: true,
          description: "Tweet metni",
          maxLength: 280,
          editable: true
        },
        characterCount: {
          type: "number",
          required: false,
          description: "Karakter sayısı",
          computed: true
        },
        visual: {
          type: "object",
          required: false,
          description: "Görsel bilgisi",
          fields: {
            hasVisual: {
              type: "boolean",
              required: false,
              description: "Görsel var mı"
            },
            description: {
              type: "string",
              required: false,
              description: "Görsel açıklaması"
            },
            type: {
              type: "string",
              required: false,
              description: "Görsel tipi"
            }
          }
        },
        standalonePotential: {
          type: "string",
          required: false,
          description: "Bağımsız tweet olarak kullanılabilir mi"
        },
        keyPoint: {
          type: "string",
          required: false,
          description: "Ana nokta/mesaj"
        }
      }
    },
    visualStrategy: {
      type: "object",
      required: false,
      description: "Görsel stratejisi",
      displayPriority: 5,
      fields: {
        totalVisuals: {
          type: "number",
          required: false,
          description: "Toplam görsel sayısı"
        },
        visualPlacements: {
          type: "array",
          required: false,
          description: "Görsel yerleşim tweet numaraları",
          itemType: "number"
        },
        visualTypes: {
          type: "array",
          required: false,
          description: "Kullanılan görsel tipleri",
          itemType: "string"
        }
      }
    },
    threadingStrategy: {
      type: "object",
      required: false,
      description: "Thread stratejisi",
      displayPriority: 6,
      fields: {
        method: {
          type: "string",
          required: false,
          description: "Thread yöntemi"
        },
        numberingSystem: {
          type: "string",
          required: false,
          description: "Numaralama sistemi"
        },
        threadReaderFriendly: {
          type: "boolean",
          required: false,
          description: "Thread Reader uyumlu mu"
        }
      }
    },
    expectedPerformance: {
      type: "object",
      required: false,
      description: "Beklenen performans",
      displayPriority: 7,
      fields: {
        viralPotential: {
          type: "string",
          required: false,
          description: "Viral potansiyeli"
        },
        expectedRetweets: {
          type: "string",
          required: false,
          description: "Beklenen retweet sayısı"
        },
        bookmarkWorthiness: {
          type: "string",
          required: false,
          description: "Bookmark değeri"
        },
        quoteTweetAngles: {
          type: "array",
          required: false,
          description: "Quote tweet açıları",
          itemType: "string"
        }
      }
    },
    alternativeHooks: {
      type: "array",
      required: false,
      description: "Alternatif hook'lar (ilk tweet için)",
      displayPriority: 8,
      itemType: "string"
    }
  }
};

// ============================================================================
// LINKEDIN CONTENT FIELDS
// ============================================================================

export const LINKEDIN_POST_FIELDS = {
  platform: "linkedin",
  contentType: "post",
  fields: {
    hook: {
      type: "string",
      required: true,
      description: "Hook - İlk 2 satır ('See More' öncesi)",
      maxLength: 210,
      displayPriority: 1,
      editable: true
    },
    fullPost: {
      type: "string",
      required: true,
      description: "Tam post metni",
      maxLength: 3000,
      displayPriority: 2,
      editable: true
    },
    postStructure: {
      type: "object",
      required: false,
      description: "Post yapısı breakdown",
      displayPriority: 3,
      fields: {
        hook: {
          type: "string",
          required: false,
          description: "Hook analizi"
        },
        personalStory: {
          type: "string",
          required: false,
          description: "Kişisel hikaye bölümü"
        },
        transition: {
          type: "string",
          required: false,
          description: "Geçiş bölümü"
        },
        insight: {
          type: "string",
          required: false,
          description: "İçgörü/değer bölümü"
        },
        engagement: {
          type: "string",
          required: false,
          description: "Etkileşim çağrısı"
        },
        cta: {
          type: "string",
          required: false,
          description: "Call to action"
        }
      }
    },
    formatting: {
      type: "object",
      required: false,
      description: "Formatlama stratejisi",
      displayPriority: 6,
      fields: {
        paragraphCount: {
          type: "number",
          required: false,
          description: "Paragraf sayısı"
        },
        lineBreaksStrategy: {
          type: "string",
          required: false,
          description: "Satır boşlukları stratejisi"
        },
        listUsage: {
          type: "string",
          required: false,
          description: "Liste kullanımı"
        },
        boldText: {
          type: "string",
          required: false,
          description: "Bold metin kullanımı"
        },
        emojiUsage: {
          type: "string",
          required: false,
          description: "Emoji kullanımı"
        }
      }
    },
    engagementStrategy: {
      type: "object",
      required: false,
      description: "Etkileşim stratejisi",
      displayPriority: 5,
      fields: {
        discussionQuestion: {
          type: "string",
          required: false,
          description: "Tartışma sorusu"
        },
        pollIdea: {
          type: "string",
          required: false,
          description: "Poll fikri"
        },
        commentModeration: {
          type: "string",
          required: false,
          description: "Yorum yönetimi stratejisi"
        },
        followUpContent: {
          type: "string",
          required: false,
          description: "Takip içeriği planı"
        }
      }
    },
    visualSuggestion: {
      type: "object",
      required: false,
      description: "Görsel önerisi",
      displayPriority: 4,
      fields: {
        imageType: {
          type: "string",
          required: false,
          description: "Görsel tipi"
        },
        imageDescription: {
          type: "string",
          required: false,
          description: "Görsel açıklaması"
        },
        carouselAlternative: {
          type: "string",
          required: false,
          description: "Carousel alternatifi"
        }
      }
    },
    hashtagStrategy: {
      type: "object",
      required: false,
      description: "Hashtag stratejisi",
      displayPriority: 7,
      fields: {
        hashtags: {
          type: "array",
          required: false,
          description: "Hashtag listesi",
          itemType: "string",
          maxItems: 5
        },
        placement: {
          type: "string",
          required: false,
          description: "Hashtag yerleşimi"
        },
        rationale: {
          type: "string",
          required: false,
          description: "Hashtag seçim mantığı"
        }
      }
    },
    expectedPerformance: {
      type: "object",
      required: false,
      description: "Beklenen performans",
      displayPriority: 8,
      fields: {
        saveWorthiness: {
          type: "string",
          required: false,
          description: "Kaydetme değeri"
        },
        shareability: {
          type: "string",
          required: false,
          description: "Paylaşılabilirlik"
        },
        commentPotential: {
          type: "string",
          required: false,
          description: "Yorum potansiyeli"
        },
        connectionRequests: {
          type: "string",
          required: false,
          description: "Bağlantı isteği potansiyeli"
        }
      }
    },
    alternativeHooks: {
      type: "array",
      required: false,
      description: "Alternatif hook'lar",
      displayPriority: 9,
      itemType: "string"
    }
  }
};

export const LINKEDIN_CAROUSEL_FIELDS = {
  platform: "linkedin",
  contentType: "carousel",
  fields: {
    carouselConcept: {
      type: "string",
      required: true,
      description: "Carousel konsepti ve ana fikir",
      displayPriority: 1,
      editable: true
    },
    totalSlides: {
      type: "number",
      required: true,
      description: "Toplam slide sayısı",
      displayPriority: 2,
      min: 2,
      max: 20
    },
    format: {
      type: "string",
      required: false,
      description: "Carousel formatı (square, vertical, horizontal)",
      displayPriority: 3
    },
    designTheme: {
      type: "object",
      required: false,
      description: "Tasarım teması",
      displayPriority: 4,
      fields: {
        colorPalette: {
          type: "array",
          required: false,
          description: "Renk paleti (hex kodları)",
          itemType: "string"
        },
        fontFamily: {
          type: "string",
          required: false,
          description: "Font ailesi"
        },
        layoutStyle: {
          type: "string",
          required: false,
          description: "Layout stili"
        }
      }
    },
    slides: {
      type: "array",
      required: true,
      description: "Slide listesi",
      displayPriority: 5,
      itemType: "object",
      fields: {
        slideNumber: {
          type: "number",
          required: true,
          description: "Slide numarası"
        },
        slideType: {
          type: "string",
          required: false,
          description: "Slide tipi (cover, content, cta, conclusion)"
        },
        title: {
          type: "string",
          required: false,
          description: "Slide başlığı",
          editable: true
        },
        subtitle: {
          type: "string",
          required: false,
          description: "Alt başlık",
          editable: true
        },
        body: {
          type: ["string", "array"],
          required: false,
          description: "Slide içeriği (metin veya liste)",
          editable: true
        },
        design: {
          type: "object",
          required: false,
          description: "Slide tasarım detayları",
          fields: {
            background: {
              type: "string",
              required: false,
              description: "Arka plan rengi/gradient"
            },
            icon: {
              type: "string",
              required: false,
              description: "İkon önerisi"
            },
            imageDescription: {
              type: "string",
              required: false,
              description: "Görsel açıklaması"
            }
          }
        }
      }
    },
    captionForCarousel: {
      type: "string",
      required: false,
      description: "Carousel için post caption",
      displayPriority: 6,
      editable: true,
      maxLength: 3000
    },
    productionNotes: {
      type: "object",
      required: false,
      description: "Üretim notları",
      displayPriority: 8,
      fields: {
        software: {
          type: "string",
          required: false,
          description: "Önerilen yazılım (Canva, Figma vb.)"
        },
        templates: {
          type: "string",
          required: false,
          description: "Template önerileri"
        },
        exportFormat: {
          type: "string",
          required: false,
          description: "Export formatı (PDF, PNG)"
        },
        fileSize: {
          type: "string",
          required: false,
          description: "Dosya boyutu limiti"
        }
      }
    },
    visualAssets: {
      type: "object",
      required: false,
      description: "Gerekli görsel varlıklar",
      displayPriority: 9,
      fields: {
        iconsNeeded: {
          type: "array",
          required: false,
          description: "Gerekli ikonlar",
          itemType: "string"
        },
        imagesNeeded: {
          type: "array",
          required: false,
          description: "Gerekli görseller",
          itemType: "string"
        },
        chartsNeeded: {
          type: "array",
          required: false,
          description: "Gerekli grafikler",
          itemType: "string"
        }
      }
    },
    expectedPerformance: {
      type: "object",
      required: false,
      description: "Beklenen performans",
      displayPriority: 10,
      fields: {
        saveRate: {
          type: "string",
          required: false,
          description: "Kaydetme oranı tahmini"
        },
        slideCompletion: {
          type: "string",
          required: false,
          description: "Slide tamamlama tahmini"
        },
        shares: {
          type: "string",
          required: false,
          description: "Paylaşım potansiyeli"
        },
        leadGeneration: {
          type: "string",
          required: false,
          description: "Lead generation potansiyeli"
        }
      }
    },
    alternativeTitles: {
      type: "array",
      required: false,
      description: "Alternatif carousel başlıkları",
      displayPriority: 11,
      itemType: "string"
    }
  }
};

// ============================================================================
// FACEBOOK CONTENT FIELDS
// ============================================================================

export const FACEBOOK_POST_FIELDS = {
  platform: "facebook",
  contentType: "post",
  fields: {
    // Facebook post LinkedIn post ile benzer yapıda
    ...LINKEDIN_POST_FIELDS.fields,
    platform: "facebook"
  }
};

export const FACEBOOK_VIDEO_FIELDS = {
  platform: "facebook",
  contentType: "video",
  fields: {
    // Facebook video Instagram Reel ile benzer yapıda
    ...INSTAGRAM_REEL_FIELDS.fields,
    platform: "facebook",
    videoTitle: {
      type: "string",
      required: true,
      description: "Video başlığı",
      displayPriority: 1,
      editable: true
    },
    thumbnailSuggestion: {
      type: "object",
      required: false,
      description: "Thumbnail önerisi",
      displayPriority: 4,
      fields: {
        description: {
          type: "string",
          required: false,
          description: "Thumbnail açıklaması"
        },
        textOverlay: {
          type: "string",
          required: false,
          description: "Thumbnail üzerindeki metin"
        }
      }
    }
  }
};

// ============================================================================
// TIKTOK CONTENT FIELDS
// ============================================================================

export const TIKTOK_VIDEO_FIELDS = {
  platform: "tiktok",
  contentType: "video",
  fields: {
    videoConcept: {
      type: "string",
      required: true,
      description: "Video konsepti",
      displayPriority: 1,
      editable: true
    },
    duration: {
      type: "string",
      required: false,
      description: "Video süresi",
      displayPriority: 2
    },
    trend: {
      type: "object",
      required: false,
      description: "Kullanılan trend",
      displayPriority: 3,
      fields: {
        name: {
          type: "string",
          required: false,
          description: "Trend adı"
        },
        hashtag: {
          type: "string",
          required: false,
          description: "Trend hashtag"
        },
        adaptation: {
          type: "string",
          required: false,
          description: "Nasıl adapte edildi"
        }
      }
    },
    script: {
      type: "object",
      required: true,
      description: "Video script",
      displayPriority: 4,
      fields: {
        hook: {
          type: "object",
          required: true,
          description: "İlk 1 saniye hook",
          fields: {
            visual: {
              type: "string",
              required: true,
              description: "Görsel"
            },
            text: {
              type: "string",
              required: true,
              description: "Ekran metni"
            }
          }
        },
        content: {
          type: "array",
          required: true,
          description: "Ana içerik bölümleri",
          itemType: "object",
          fields: {
            timestamp: {
              type: "string",
              required: true,
              description: "Zaman"
            },
            visual: {
              type: "string",
              required: true,
              description: "Görsel"
            },
            text: {
              type: "string",
              required: true,
              description: "Ekran metni"
            },
            transition: {
              type: "string",
              required: false,
              description: "Geçiş efekti"
            }
          }
        },
        cta: {
          type: "object",
          required: true,
          description: "Kapanış CTA",
          fields: {
            visual: {
              type: "string",
              required: true,
              description: "Görsel"
            },
            text: {
              type: "string",
              required: true,
              description: "CTA metni"
            }
          }
        }
      }
    },
    audio: {
      type: "object",
      required: false,
      description: "Ses stratejisi",
      displayPriority: 5,
      fields: {
        trendingSound: {
          type: "string",
          required: false,
          description: "Trending ses"
        },
        originalAudio: {
          type: "boolean",
          required: false,
          description: "Orijinal ses kullanılacak mı"
        },
        voiceover: {
          type: "string",
          required: false,
          description: "Voiceover script"
        }
      }
    },
    caption: {
      type: "string",
      required: false,
      description: "Video caption",
      displayPriority: 6,
      editable: true
    },
    hashtags: {
      type: "array",
      required: false,
      description: "Hashtag'ler",
      displayPriority: 7,
      itemType: "string"
    },
    effects: {
      type: "array",
      required: false,
      description: "Kullanılacak efektler",
      displayPriority: 8,
      itemType: "string"
    }
  }
};

// ============================================================================
// YOUTUBE CONTENT FIELDS
// ============================================================================

export const YOUTUBE_VIDEO_FIELDS = {
  platform: "youtube",
  contentType: "video",
  fields: {
    title: {
      type: "string",
      required: true,
      description: "Video başlığı",
      maxLength: 100,
      displayPriority: 1,
      editable: true
    },
    description: {
      type: "string",
      required: true,
      description: "Video açıklaması",
      maxLength: 5000,
      displayPriority: 2,
      editable: true
    },
    script: {
      type: "object",
      required: true,
      description: "Video script",
      displayPriority: 3,
      fields: {
        intro: {
          type: "object",
          required: true,
          description: "Giriş (ilk 15 saniye)",
          fields: {
            hook: {
              type: "string",
              required: true,
              description: "Hook cümlesi"
            },
            promise: {
              type: "string",
              required: true,
              description: "Video vaadi"
            },
            timestamp: {
              type: "string",
              required: false,
              description: "Süre"
            }
          }
        },
        mainContent: {
          type: "array",
          required: true,
          description: "Ana içerik bölümleri",
          itemType: "object",
          fields: {
            section: {
              type: "string",
              required: true,
              description: "Bölüm başlığı"
            },
            timestamp: {
              type: "string",
              required: false,
              description: "Zaman damgası"
            },
            content: {
              type: "string",
              required: true,
              description: "Bölüm içeriği"
            },
            visuals: {
              type: "string",
              required: false,
              description: "Görsel önerileri"
            },
            bRoll: {
              type: "string",
              required: false,
              description: "B-roll önerileri"
            }
          }
        },
        outro: {
          type: "object",
          required: true,
          description: "Kapanış",
          fields: {
            summary: {
              type: "string",
              required: true,
              description: "Özet"
            },
            cta: {
              type: "string",
              required: true,
              description: "Call to action"
            },
            endScreen: {
              type: "string",
              required: false,
              description: "End screen önerileri"
            }
          }
        }
      }
    },
    thumbnailSuggestion: {
      type: "object",
      required: false,
      description: "Thumbnail önerisi",
      displayPriority: 4,
      fields: {
        concept: {
          type: "string",
          required: false,
          description: "Thumbnail konsepti"
        },
        text: {
          type: "string",
          required: false,
          description: "Thumbnail metni"
        },
        colors: {
          type: "array",
          required: false,
          description: "Renk paleti",
          itemType: "string"
        },
        composition: {
          type: "string",
          required: false,
          description: "Kompozisyon açıklaması"
        }
      }
    },
    tags: {
      type: "array",
      required: false,
      description: "Video tag'leri",
      displayPriority: 5,
      itemType: "string",
      maxItems: 15
    },
    chapters: {
      type: "array",
      required: false,
      description: "Video chapter'ları",
      displayPriority: 6,
      itemType: "object",
      fields: {
        timestamp: {
          type: "string",
          required: true,
          description: "Zaman damgası (0:00 formatında)"
        },
        title: {
          type: "string",
          required: true,
          description: "Chapter başlığı"
        }
      }
    },
    seoOptimization: {
      type: "object",
      required: false,
      description: "SEO optimizasyonu",
      displayPriority: 7,
      fields: {
        primaryKeyword: {
          type: "string",
          required: false,
          description: "Ana anahtar kelime"
        },
        secondaryKeywords: {
          type: "array",
          required: false,
          description: "İkincil anahtar kelimeler",
          itemType: "string"
        },
        searchIntent: {
          type: "string",
          required: false,
          description: "Arama niyeti"
        }
      }
    },
    endScreen: {
      type: "object",
      required: false,
      description: "End screen stratejisi",
      displayPriority: 8,
      fields: {
        videoSuggestion: {
          type: "string",
          required: false,
          description: "Önerilen video"
        },
        playlistSuggestion: {
          type: "string",
          required: false,
          description: "Önerilen playlist"
        },
        subscribeButton: {
          type: "boolean",
          required: false,
          description: "Subscribe butonu göster"
        }
      }
    }
  }
};

export const YOUTUBE_SHORT_FIELDS = {
  platform: "youtube",
  contentType: "short",
  fields: {
    // YouTube Shorts TikTok video ile benzer yapıda
    ...TIKTOK_VIDEO_FIELDS.fields,
    platform: "youtube",
    title: {
      type: "string",
      required: true,
      description: "Short başlığı",
      maxLength: 100,
      displayPriority: 1,
      editable: true
    }
  }
};

// ============================================================================
// PINTEREST CONTENT FIELDS
// ============================================================================

export const PINTEREST_PIN_FIELDS = {
  platform: "pinterest",
  contentType: "pin",
  fields: {
    pinTitle: {
      type: "string",
      required: true,
      description: "Pin başlığı",
      maxLength: 100,
      displayPriority: 1,
      editable: true
    },
    description: {
      type: "string",
      required: true,
      description: "Pin açıklaması",
      maxLength: 500,
      displayPriority: 2,
      editable: true
    },
    imageDesign: {
      type: "object",
      required: true,
      description: "Görsel tasarım önerisi",
      displayPriority: 3,
      fields: {
        orientation: {
          type: "string",
          required: true,
          description: "Oryantasyon (vertical recommended: 2:3 ratio)"
        },
        mainVisual: {
          type: "string",
          required: true,
          description: "Ana görsel açıklaması"
        },
        textOverlay: {
          type: "string",
          required: false,
          description: "Görsel üzerindeki metin"
        },
        colorScheme: {
          type: "array",
          required: false,
          description: "Renk paleti",
          itemType: "string"
        },
        designStyle: {
          type: "string",
          required: false,
          description: "Tasarım stili (minimal, bold, lifestyle vb.)"
        }
      }
    },
    boardSuggestion: {
      type: "string",
      required: false,
      description: "Önerilen board",
      displayPriority: 4
    },
    keywords: {
      type: "array",
      required: false,
      description: "SEO anahtar kelimeleri",
      displayPriority: 5,
      itemType: "string"
    },
    hashtags: {
      type: "array",
      required: false,
      description: "Hashtag'ler",
      displayPriority: 6,
      itemType: "string",
      maxItems: 20
    },
    linkDestination: {
      type: "string",
      required: false,
      description: "Pin link hedefi",
      displayPriority: 7
    },
    altText: {
      type: "string",
      required: false,
      description: "Alt text (accessibility)",
      displayPriority: 8
    }
  }
};

// ============================================================================
// ANA EXPORT - TÜM FIELD YAPILARINI İÇEREN MAP
// ============================================================================

export const CONTENT_FIELD_STRUCTURES = {
  // Instagram
  "instagram_post": INSTAGRAM_POST_FIELDS,
  "instagram_reel": INSTAGRAM_REEL_FIELDS,
  "instagram_story": INSTAGRAM_STORY_FIELDS,
  
  // X (Twitter)
  "x_tweet": X_TWEET_FIELDS,
  "x_thread": X_THREAD_FIELDS,
  
  // LinkedIn
  "linkedin_post": LINKEDIN_POST_FIELDS,
  "linkedin_carousel": LINKEDIN_CAROUSEL_FIELDS,
  
  // Facebook
  "facebook_post": FACEBOOK_POST_FIELDS,
  "facebook_video": FACEBOOK_VIDEO_FIELDS,
  
  // TikTok
  "tiktok_video": TIKTOK_VIDEO_FIELDS,
  
  // YouTube
  "youtube_video": YOUTUBE_VIDEO_FIELDS,
  "youtube_short": YOUTUBE_SHORT_FIELDS,
  
  // Pinterest
  "pinterest_pin": PINTEREST_PIN_FIELDS,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Belirli bir platform ve content type için field yapısını getirir
 * @param {string} platform - Platform adı (instagram, x, linkedin vb.)
 * @param {string} contentType - İçerik tipi (post, reel, tweet vb.)
 * @returns {object|null} Field yapısı veya null
 */
export function getContentFieldStructure(platform, contentType) {
  const key = `${platform}_${contentType}`;
  return CONTENT_FIELD_STRUCTURES[key] || null;
}

/**
 * Belirli bir content için editable field'ları getirir
 * @param {string} platform - Platform adı
 * @param {string} contentType - İçerik tipi
 * @returns {array} Editable field path'leri
 */
export function getEditableFields(platform, contentType) {
  const structure = getContentFieldStructure(platform, contentType);
  if (!structure) return [];
  
  const editableFields = [];
  
  function findEditableFields(fields, path = '') {
    for (const [key, field] of Object.entries(fields)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (field.editable) {
        editableFields.push(currentPath);
      }
      
      if (field.fields) {
        findEditableFields(field.fields, currentPath);
      }
    }
  }
  
  findEditableFields(structure.fields);
  return editableFields;
}

/**
 * Belirli bir content için required field'ları getirir
 * @param {string} platform - Platform adı
 * @param {string} contentType - İçerik tipi
 * @returns {array} Required field path'leri
 */
export function getRequiredFields(platform, contentType) {
  const structure = getContentFieldStructure(platform, contentType);
  if (!structure) return [];
  
  const requiredFields = [];
  
  function findRequiredFields(fields, path = '') {
    for (const [key, field] of Object.entries(fields)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (field.required) {
        requiredFields.push(currentPath);
      }
      
      if (field.fields) {
        findRequiredFields(field.fields, currentPath);
      }
    }
  }
  
  findRequiredFields(structure.fields);
  return requiredFields;
}

/**
 * Belirli bir content'in display priority'ye göre sıralı field listesini getirir
 * @param {string} platform - Platform adı
 * @param {string} contentType - İçerik tipi
 * @returns {array} Sıralı field bilgileri
 */
export function getFieldsByPriority(platform, contentType) {
  const structure = getContentFieldStructure(platform, contentType);
  if (!structure) return [];
  
  const fieldsWithPriority = [];
  
  function collectFields(fields, path = '') {
    for (const [key, field] of Object.entries(fields)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (field.displayPriority) {
        fieldsWithPriority.push({
          path: currentPath,
          priority: field.displayPriority,
          ...field
        });
      }
    }
  }
  
  collectFields(structure.fields);
  return fieldsWithPriority.sort((a, b) => a.priority - b.priority);
}

/**
 * Content objesinden belirli bir field'ı güvenli şekilde getirir
 * @param {object} content - Content objesi
 * @param {string} fieldPath - Field path (örn: "script.hook.visual")
 * @returns {any} Field değeri veya undefined
 */
export function getFieldValue(content, fieldPath) {
  const keys = fieldPath.split('.');
  let value = content;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
}

/**
 * Content objesine belirli bir field değeri set eder
 * @param {object} content - Content objesi
 * @param {string} fieldPath - Field path
 * @param {any} value - Yeni değer
 * @returns {object} Güncellenmiş content objesi
 */
export function setFieldValue(content, fieldPath, value) {
  const keys = fieldPath.split('.');
  const lastKey = keys.pop();
  let current = content;
  
  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
  return content;
}

/**
 * Tüm platformların listesini getirir
 * @returns {array} Platform adları
 */
export function getAllPlatforms() {
  const platforms = new Set();
  Object.keys(CONTENT_FIELD_STRUCTURES).forEach(key => {
    const [platform] = key.split('_');
    platforms.add(platform);
  });
  return Array.from(platforms);
}

/**
 * Belirli bir platform için tüm content type'larını getirir
 * @param {string} platform - Platform adı
 * @returns {array} Content type adları
 */
export function getContentTypesForPlatform(platform) {
  return Object.keys(CONTENT_FIELD_STRUCTURES)
    .filter(key => key.startsWith(`${platform}_`))
    .map(key => key.replace(`${platform}_`, ''));
}

/**
 * Content validation - zorunlu alanların kontrolü
 * @param {object} content - Content objesi
 * @param {string} platform - Platform adı
 * @param {string} contentType - İçerik tipi
 * @returns {object} { valid: boolean, missingFields: array }
 */
export function validateContent(content, platform, contentType) {
  const requiredFields = getRequiredFields(platform, contentType);
  const missingFields = [];
  
  for (const fieldPath of requiredFields) {
    const value = getFieldValue(content, fieldPath);
    if (value === undefined || value === null || value === '') {
      missingFields.push(fieldPath);
    }
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
}
