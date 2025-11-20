import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "../firebase";

// Collection Names
const SOCIAL_POSTS_COLLECTION = "socialPosts";
const SOCIAL_TEMPLATES_COLLECTION = "socialTemplates";
const SOCIAL_CAMPAIGNS_COLLECTION = "socialCampaigns";
const SOCIAL_ANALYTICS_COLLECTION = "socialAnalytics";

// Post Status Enum
export const POST_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// Platform Enum
export const PLATFORMS = {
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok'
};

// Content Type Enum
export const CONTENT_TYPES = {
  PROMOTIONAL: 'promotional',
  EDUCATIONAL: 'educational',
  ENTERTAINMENT: 'entertainment',
  NEWS: 'news',
  COMMUNITY: 'community'
};

/**
 * SOCIAL POSTS CRUD OPERATIONS
 */

// Create a new social media post with platform-specific content
export const createSocialPost = async (postData) => {
  try {
    // Platform-specific content structure
    const platformContent = {};
    
    // If platforms and platformSpecificContent provided, use them
    if (postData.platformSpecificContent) {
      Object.keys(postData.platformSpecificContent).forEach(platform => {
        platformContent[platform] = {
          content: postData.platformSpecificContent[platform].content || '',
          hashtags: postData.platformSpecificContent[platform].hashtags || [],
          mentions: postData.platformSpecificContent[platform].mentions || [],
          mediaUrls: postData.platformSpecificContent[platform].mediaUrls || [],
          customizations: postData.platformSpecificContent[platform].customizations || {},
          analytics: {
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            clicks: 0,
            engagement: 0
          }
        };
      });
    } else {
      // Backward compatibility: if old structure, convert to new
      (postData.platforms || []).forEach(platform => {
        platformContent[platform] = {
          content: postData.content || '',
          hashtags: postData.hashtags || [],
          mentions: postData.mentions || [],
          mediaUrls: postData.mediaUrls || [],
          customizations: {},
          analytics: {
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            clicks: 0,
            engagement: 0
          }
        };
      });
    }

    const docRef = await addDoc(collection(db, SOCIAL_POSTS_COLLECTION), {
      title: postData.title || '',
      campaignId: postData.campaignId || null,
      contentType: postData.contentType || 'general',
      tone: postData.tone || 'professional',
      targetAudience: postData.targetAudience || 'general',
      platformContent, // New structure for platform-specific content
      platforms: Object.keys(platformContent), // Derived from platformContent
      status: postData.status || POST_STATUS.DRAFT,
      authorId: postData.authorId || null,
      authorName: postData.authorName || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      scheduledAt: postData.scheduledAt ? new Date(postData.scheduledAt) : null,
      publishedAt: postData.publishedAt ? new Date(postData.publishedAt) : null,
      // Global analytics (sum of all platforms)
      globalAnalytics: {
        totalViews: 0,
        totalLikes: 0,
        totalShares: 0,
        totalComments: 0,
        totalClicks: 0,
        totalEngagement: 0
      },
      // Metadata
      metadata: {
        aiGenerated: postData.metadata?.aiGenerated || false,
        template: postData.metadata?.template || null,
        version: '2.0' // New schema version
      }
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Sosyal medya postu oluşturulurken hata:", error);
    throw error;
  }
};

// Update a social media post with platform-specific content
export const updateSocialPost = async (postId, postData) => {
  try {
    const docRef = doc(db, SOCIAL_POSTS_COLLECTION, postId);
    
    // Prepare update data
    const updateData = {
      updatedAt: serverTimestamp(),
      scheduledAt: postData.scheduledAt ? new Date(postData.scheduledAt) : null,
      publishedAt: postData.publishedAt ? new Date(postData.publishedAt) : null,
    };

    // Handle platform-specific content updates
    if (postData.platformSpecificContent) {
      const platformContent = {};
      Object.keys(postData.platformSpecificContent).forEach(platform => {
        platformContent[platform] = {
          content: postData.platformSpecificContent[platform].content || '',
          hashtags: postData.platformSpecificContent[platform].hashtags || [],
          mentions: postData.platformSpecificContent[platform].mentions || [],
          mediaUrls: postData.platformSpecificContent[platform].mediaUrls || [],
          customizations: postData.platformSpecificContent[platform].customizations || {},
          analytics: postData.platformSpecificContent[platform].analytics || {
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            clicks: 0,
            engagement: 0
          }
        };
      });
      updateData.platformContent = platformContent;
      updateData.platforms = Object.keys(platformContent);
    }

    // Add other fields that might be updated
    if (postData.title !== undefined) updateData.title = postData.title;
    if (postData.status !== undefined) updateData.status = postData.status;
    if (postData.contentType !== undefined) updateData.contentType = postData.contentType;
    if (postData.tone !== undefined) updateData.tone = postData.tone;
    if (postData.targetAudience !== undefined) updateData.targetAudience = postData.targetAudience;
    if (postData.globalAnalytics !== undefined) updateData.globalAnalytics = postData.globalAnalytics;

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Sosyal medya postu güncellenirken hata:", error);
    throw error;
  }
};

// Delete a social media post
export const deleteSocialPost = async (postId) => {
  try {
    await deleteDoc(doc(db, SOCIAL_POSTS_COLLECTION, postId));
  } catch (error) {
    console.error("Sosyal medya postu silinirken hata:", error);
    throw error;
  }
};

// Get a single social media post
export const getSocialPost = async (postId) => {
  try {
    const docRef = doc(db, SOCIAL_POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Post bulunamadı");
    }
  } catch (error) {
    console.error("Sosyal medya postu getirilirken hata:", error);
    throw error;
  }
};

// Get all social media posts with optional filtering
export const getAllSocialPosts = async (filters = {}) => {
  try {
    let q = collection(db, SOCIAL_POSTS_COLLECTION);
    
    const conditions = [];
    
    if (filters.status) {
      conditions.push(where("status", "==", filters.status));
    }
    
    if (filters.platform) {
      conditions.push(where("platforms", "array-contains", filters.platform));
    }
    
    if (filters.contentType) {
      conditions.push(where("contentType", "==", filters.contentType));
    }
    
    if (filters.authorId) {
      conditions.push(where("authorId", "==", filters.authorId));
    }
    
    // Add ordering
    const orderField = filters.orderBy || "createdAt";
    const orderDirection = filters.orderDirection || "desc";
    conditions.push(orderBy(orderField, orderDirection));
    
    // Add limit if specified
    if (filters.limit) {
      conditions.push(limit(filters.limit));
    }
    
    q = query(q, ...conditions);
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    
    return posts;
  } catch (error) {
    console.error("Sosyal medya postları getirilirken hata:", error);
    throw error;
  }
};

// Get posts by date range
export const getSocialPostsByDateRange = async (startDate, endDate, platform = null) => {
  try {
    const conditions = [
      where("createdAt", ">=", Timestamp.fromDate(new Date(startDate))),
      where("createdAt", "<=", Timestamp.fromDate(new Date(endDate))),
      orderBy("createdAt", "desc")
    ];
    
    if (platform) {
      conditions.unshift(where("platforms", "array-contains", platform));
    }
    
    const q = query(collection(db, SOCIAL_POSTS_COLLECTION), ...conditions);
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    
    return posts;
  } catch (error) {
    console.error("Tarih aralığına göre postlar getirilirken hata:", error);
    throw error;
  }
};

// Update post analytics
export const updatePostAnalytics = async (postId, analyticsData) => {
  try {
    const docRef = doc(db, SOCIAL_POSTS_COLLECTION, postId);
    await updateDoc(docRef, {
      analytics: analyticsData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Post analitikleri güncellenirken hata:", error);
    throw error;
  }
};

/**
 * SOCIAL TEMPLATES CRUD OPERATIONS
 */

// Create a new social media template
export const createSocialTemplate = async (templateData) => {
  try {
    const docRef = await addDoc(collection(db, SOCIAL_TEMPLATES_COLLECTION), {
      ...templateData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      usageCount: 0,
      isActive: templateData.isActive !== undefined ? templateData.isActive : true
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Sosyal medya şablonu oluşturulurken hata:", error);
    throw error;
  }
};

// Update a social media template
export const updateSocialTemplate = async (templateId, templateData) => {
  try {
    const docRef = doc(db, SOCIAL_TEMPLATES_COLLECTION, templateId);
    await updateDoc(docRef, {
      ...templateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Sosyal medya şablonu güncellenirken hata:", error);
    throw error;
  }
};

// Delete a social media template
export const deleteSocialTemplate = async (templateId) => {
  try {
    await deleteDoc(doc(db, SOCIAL_TEMPLATES_COLLECTION, templateId));
  } catch (error) {
    console.error("Sosyal medya şablonu silinirken hata:", error);
    throw error;
  }
};

// Get all social media templates
export const getAllSocialTemplates = async (filters = {}) => {
  try {
    let q = collection(db, SOCIAL_TEMPLATES_COLLECTION);
    
    const conditions = [];
    
    if (filters.platform) {
      conditions.push(where("platforms", "array-contains", filters.platform));
    }
    
    if (filters.contentType) {
      conditions.push(where("contentType", "==", filters.contentType));
    }
    
    if (filters.isActive !== undefined) {
      conditions.push(where("isActive", "==", filters.isActive));
    }
    
    conditions.push(orderBy("createdAt", "desc"));
    
    if (conditions.length > 0) {
      q = query(q, ...conditions);
    }
    
    const querySnapshot = await getDocs(q);
    const templates = [];
    
    querySnapshot.forEach((doc) => {
      templates.push({ id: doc.id, ...doc.data() });
    });
    
    return templates;
  } catch (error) {
    console.error("Sosyal medya şablonları getirilirken hata:", error);
    throw error;
  }
};

// Increment template usage count
export const incrementTemplateUsage = async (templateId) => {
  try {
    const docRef = doc(db, SOCIAL_TEMPLATES_COLLECTION, templateId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentCount = docSnap.data().usageCount || 0;
      await updateDoc(docRef, {
        usageCount: currentCount + 1,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Şablon kullanım sayısı güncellenirken hata:", error);
    throw error;
  }
};

/**
 * SOCIAL CAMPAIGNS CRUD OPERATIONS
 */

// Create a new social media campaign
export const createSocialCampaign = async (campaignData) => {
  try {
    const docRef = await addDoc(collection(db, SOCIAL_CAMPAIGNS_COLLECTION), {
      ...campaignData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      startDate: campaignData.startDate ? new Date(campaignData.startDate) : null,
      endDate: campaignData.endDate ? new Date(campaignData.endDate) : null,
      status: campaignData.status || 'draft',
      postIds: campaignData.postIds || [],
      analytics: {
        totalPosts: 0,
        totalViews: 0,
        totalEngagement: 0,
        totalClicks: 0
      }
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Sosyal medya kampanyası oluşturulurken hata:", error);
    throw error;
  }
};

// Add post to campaign
export const addPostToCampaign = async (campaignId, postId) => {
  try {
    const docRef = doc(db, SOCIAL_CAMPAIGNS_COLLECTION, campaignId);
    await updateDoc(docRef, {
      postIds: arrayUnion(postId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Post kampanyaya eklenirken hata:", error);
    throw error;
  }
};

// Remove post from campaign
export const removePostFromCampaign = async (campaignId, postId) => {
  try {
    const docRef = doc(db, SOCIAL_CAMPAIGNS_COLLECTION, campaignId);
    await updateDoc(docRef, {
      postIds: arrayRemove(postId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Post kampanyadan çıkarılırken hata:", error);
    throw error;
  }
};

// Get all social media campaigns
export const getAllSocialCampaigns = async () => {
  try {
    const q = query(
      collection(db, SOCIAL_CAMPAIGNS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const campaigns = [];
    
    querySnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });
    
    return campaigns;
  } catch (error) {
    console.error("Sosyal medya kampanyaları getirilirken hata:", error);
    throw error;
  }
};

/**
 * ANALYTICS FUNCTIONS
 */

// Get social media analytics summary
export const getSocialMediaAnalytics = async (dateRange = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    
    // Get posts from date range
    const posts = await getSocialPostsByDateRange(startDate, new Date());
    
    // Calculate analytics
    const analytics = {
      totalPosts: posts.length,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
      totalClicks: 0,
      platformBreakdown: {},
      contentTypeBreakdown: {},
      engagementRate: 0,
      topPerformingPosts: []
    };
    
    posts.forEach(post => {
      const postAnalytics = post.analytics || {};
      
      analytics.totalViews += postAnalytics.views || 0;
      analytics.totalLikes += postAnalytics.likes || 0;
      analytics.totalShares += postAnalytics.shares || 0;
      analytics.totalComments += postAnalytics.comments || 0;
      analytics.totalClicks += postAnalytics.clicks || 0;
      
      // Platform breakdown
      post.platforms?.forEach(platform => {
        if (!analytics.platformBreakdown[platform]) {
          analytics.platformBreakdown[platform] = 0;
        }
        analytics.platformBreakdown[platform]++;
      });
      
      // Content type breakdown
      const contentType = post.contentType || 'other';
      if (!analytics.contentTypeBreakdown[contentType]) {
        analytics.contentTypeBreakdown[contentType] = 0;
      }
      analytics.contentTypeBreakdown[contentType]++;
    });
    
    // Calculate engagement rate
    if (analytics.totalViews > 0) {
      const totalEngagement = analytics.totalLikes + analytics.totalShares + analytics.totalComments;
      analytics.engagementRate = ((totalEngagement / analytics.totalViews) * 100).toFixed(2);
    }
    
    // Get top performing posts
    analytics.topPerformingPosts = posts
      .sort((a, b) => (b.analytics?.engagement || 0) - (a.analytics?.engagement || 0))
      .slice(0, 5)
      .map(post => ({
        id: post.id,
        title: post.title,
        platforms: post.platforms,
        engagement: post.analytics?.engagement || 0,
        views: post.analytics?.views || 0,
        createdAt: post.createdAt
      }));
    
    return analytics;
  } catch (error) {
    console.error("Sosyal medya analitikleri getirilirken hata:", error);
    throw error;
  }
};

// Get platform-specific analytics
export const getPlatformAnalytics = async (platform, dateRange = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    
    const posts = await getSocialPostsByDateRange(startDate, new Date(), platform);
    
    const platformAnalytics = {
      platform,
      totalPosts: posts.length,
      totalViews: 0,
      totalLikes: 0,
      totalShares: 0,
      totalComments: 0,
      avgEngagement: 0,
      bestPostingTimes: {},
      topHashtags: {},
      contentTypePerformance: {}
    };
    
    posts.forEach(post => {
      const analytics = post.analytics || {};
      
      platformAnalytics.totalViews += analytics.views || 0;
      platformAnalytics.totalLikes += analytics.likes || 0;
      platformAnalytics.totalShares += analytics.shares || 0;
      platformAnalytics.totalComments += analytics.comments || 0;
      
      // Analyze posting times (if publishedAt exists)
      if (post.publishedAt) {
        const hour = new Date(post.publishedAt.toDate()).getHours();
        if (!platformAnalytics.bestPostingTimes[hour]) {
          platformAnalytics.bestPostingTimes[hour] = { count: 0, totalEngagement: 0 };
        }
        platformAnalytics.bestPostingTimes[hour].count++;
        platformAnalytics.bestPostingTimes[hour].totalEngagement += (analytics.engagement || 0);
      }
      
      // Analyze hashtags
      post.hashtags?.forEach(hashtag => {
        if (!platformAnalytics.topHashtags[hashtag]) {
          platformAnalytics.topHashtags[hashtag] = { count: 0, totalEngagement: 0 };
        }
        platformAnalytics.topHashtags[hashtag].count++;
        platformAnalytics.topHashtags[hashtag].totalEngagement += (analytics.engagement || 0);
      });
      
      // Content type performance
      const contentType = post.contentType || 'other';
      if (!platformAnalytics.contentTypePerformance[contentType]) {
        platformAnalytics.contentTypePerformance[contentType] = { count: 0, totalEngagement: 0 };
      }
      platformAnalytics.contentTypePerformance[contentType].count++;
      platformAnalytics.contentTypePerformance[contentType].totalEngagement += (analytics.engagement || 0);
    });
    
    // Calculate average engagement
    if (platformAnalytics.totalPosts > 0) {
      const totalEngagement = platformAnalytics.totalLikes + 
                              platformAnalytics.totalShares + 
                              platformAnalytics.totalComments;
      platformAnalytics.avgEngagement = (totalEngagement / platformAnalytics.totalPosts).toFixed(2);
    }
    
    return platformAnalytics;
  } catch (error) {
    console.error("Platform analitikleri getirilirken hata:", error);
    throw error;
  }
};

/**
 * PLATFORM-SPECIFIC CONTENT FUNCTIONS
 */

// Update content for a specific platform
export const updatePlatformContent = async (postId, platform, platformData) => {
  try {
    const docRef = doc(db, SOCIAL_POSTS_COLLECTION, postId);
    
    await updateDoc(docRef, {
      [`platformContent.${platform}`]: {
        content: platformData.content || '',
        hashtags: platformData.hashtags || [],
        mentions: platformData.mentions || [],
        mediaUrls: platformData.mediaUrls || [],
        customizations: platformData.customizations || {},
        analytics: platformData.analytics || {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          clicks: 0,
          engagement: 0
        }
      },
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Platform içeriği güncellenirken hata:", error);
    throw error;
  }
};

// Get content for a specific platform
export const getPlatformContent = async (postId, platform) => {
  try {
    const post = await getSocialPost(postId);
    return post.platformContent?.[platform] || null;
  } catch (error) {
    console.error("Platform içeriği getirilirken hata:", error);
    throw error;
  }
};

// Add a platform to existing post
export const addPlatformToPost = async (postId, platform, platformData = {}) => {
  try {
    const docRef = doc(db, SOCIAL_POSTS_COLLECTION, postId);
    
    await updateDoc(docRef, {
      [`platformContent.${platform}`]: {
        content: platformData.content || '',
        hashtags: platformData.hashtags || [],
        mentions: platformData.mentions || [],
        mediaUrls: platformData.mediaUrls || [],
        customizations: platformData.customizations || {},
        analytics: {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          clicks: 0,
          engagement: 0
        }
      },
      platforms: arrayUnion(platform),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Post'a platform eklenirken hata:", error);
    throw error;
  }
};

// Remove a platform from existing post
export const removePlatformFromPost = async (postId, platform) => {
  try {
    const docRef = doc(db, SOCIAL_POSTS_COLLECTION, postId);
    
    // First, remove platform from platforms array
    await updateDoc(docRef, {
      platforms: arrayRemove(platform),
      updatedAt: serverTimestamp()
    });

    // Then remove the platform content
    await updateDoc(docRef, {
      [`platformContent.${platform}`]: null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Platform post'tan çıkarılırken hata:", error);
    throw error;
  }
};

// Migrate old posts to new structure
export const migrateLegacyPost = async (postId) => {
  try {
    const post = await getSocialPost(postId);
    
    // Check if already migrated
    if (post.metadata?.version === '2.0' || post.platformContent) {
      return; // Already migrated
    }

    const platformContent = {};
    
    // Convert old structure to new
    (post.platforms || []).forEach(platform => {
      platformContent[platform] = {
        content: post.content || '',
        hashtags: post.hashtags || [],
        mentions: post.mentions || [],
        mediaUrls: post.mediaUrls || [],
        customizations: {},
        analytics: post.analytics || {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          clicks: 0,
          engagement: 0
        }
      };
    });

    await updateSocialPost(postId, {
      platformContent,
      globalAnalytics: {
        totalViews: post.analytics?.views || 0,
        totalLikes: post.analytics?.likes || 0,
        totalShares: post.analytics?.shares || 0,
        totalComments: post.analytics?.comments || 0,
        totalClicks: post.analytics?.clicks || 0,
        totalEngagement: post.analytics?.engagement || 0
      },
      metadata: {
        aiGenerated: false,
        template: null,
        version: '2.0'
      }
    });
  } catch (error) {
    console.error("Post migrate edilirken hata:", error);
    throw error;
  }
};

/**
 * UTILITY FUNCTIONS
 */

// Search social posts
export const searchSocialPosts = async (searchQuery, filters = {}) => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation that filters by title and content
    const allPosts = await getAllSocialPosts(filters);
    
    const filteredPosts = allPosts.filter(post => {
      const searchText = searchQuery.toLowerCase();
      const title = (post.title || '').toLowerCase();
      const content = (post.content || '').toLowerCase();
      const hashtags = (post.hashtags || []).join(' ').toLowerCase();
      
      return title.includes(searchText) || 
             content.includes(searchText) || 
             hashtags.includes(searchText);
    });
    
    return filteredPosts;
  } catch (error) {
    console.error("Sosyal medya postları aranırken hata:", error);
    throw error;
  }
};

// Duplicate a post
export const duplicateSocialPost = async (postId) => {
  try {
    const originalPost = await getSocialPost(postId);
    
    // Remove fields that shouldn't be duplicated
    delete originalPost.id;
    delete originalPost.createdAt;
    delete originalPost.updatedAt;
    delete originalPost.publishedAt;
    delete originalPost.analytics;
    
    // Reset status to draft
    originalPost.status = POST_STATUS.DRAFT;
    originalPost.title = `${originalPost.title} (Kopya)`;
    
    return await createSocialPost(originalPost);
  } catch (error) {
    console.error("Post kopyalanırken hata:", error);
    throw error;
  }
};

// Get social media statistics
export const getSocialMediaStats = async () => {
  try {
    const [allPosts, allTemplates, allCampaigns] = await Promise.all([
      getAllSocialPosts(),
      getAllSocialTemplates(),
      getAllSocialCampaigns()
    ]);
    
    const stats = {
      totalPosts: allPosts.length,
      totalTemplates: allTemplates.length,
      totalCampaigns: allCampaigns.length,
      postsByStatus: {},
      postsByPlatform: {},
      postsByContentType: {},
      recentActivity: []
    };
    
    // Count posts by status
    allPosts.forEach(post => {
      const status = post.status || 'unknown';
      stats.postsByStatus[status] = (stats.postsByStatus[status] || 0) + 1;
      
      // Count by platform
      post.platforms?.forEach(platform => {
        stats.postsByPlatform[platform] = (stats.postsByPlatform[platform] || 0) + 1;
      });
      
      // Count by content type
      const contentType = post.contentType || 'other';
      stats.postsByContentType[contentType] = (stats.postsByContentType[contentType] || 0) + 1;
    });
    
    // Recent activity (last 5 posts)
    stats.recentActivity = allPosts
      .sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0))
      .slice(0, 5)
      .map(post => ({
        id: post.id,
        title: post.title,
        status: post.status,
        platforms: post.platforms,
        createdAt: post.createdAt
      }));
    
    return stats;
  } catch (error) {
    console.error("Sosyal medya istatistikleri getirilirken hata:", error);
    throw error;
  }
};