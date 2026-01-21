"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { DEFAULT_CHAT_MODEL } from "@/lib/gemini";
import {
  createChat,
  getUserChats,
  getChatMessages,
  addMessage,
  deleteChat,
  updateChat,
  uploadUserImagesToStorage,
} from "@/lib/services/gemini-chat-service";
import { getAllGeneratedContents } from "@/lib/services/social-media-service";

const GeminiChatContext = createContext(undefined);

export function GeminiChatProvider({ children, user }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_CHAT_MODEL);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Content Visualize states
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [selectedContentTitle, setSelectedContentTitle] = useState(null);
  const [contentList, setContentList] = useState([]);

  // Load user's chats
  const loadChats = useCallback(async () => {
    if (!user) return;

    try {
      setChatsLoading(true);
      const userChats = await getUserChats(user.uid);
      setChats(userChats);

      // Auto-select first chat if available and no chat is selected
      if (userChats.length > 0 && !activeChatId) {
        setActiveChatId(userChats[0].id);
      }
    } catch (error) {
      console.error("Chatler yüklenirken hata:", error);
      toast.error("Sohbetler yüklenemedi");
    } finally {
      setChatsLoading(false);
    }
  }, [user, activeChatId]);

  // Load messages when active chat changes
  const loadMessages = useCallback(async (chatId, limit = 50) => {
    try {
      const chatMessages = await getChatMessages(chatId, limit);
      setMessages(chatMessages);
      // Check if there are more messages
      setHasMoreMessages(chatMessages.length === limit);
    } catch (error) {
      console.error("Mesajlar yüklenirken hata:", error);
      toast.error("Mesajlar yüklenemedi");
    }
  }, []);

  // Load content list for content visualize
  const loadContentList = useCallback(async () => {
    try {
      console.log("📚 Loading content list from social-media-content...");
      const contents = await getAllGeneratedContents();
      console.log("📚 Content list loaded:", contents?.length || 0, "items");
      setContentList(contents || []);
    } catch (error) {
      console.error("📚 İçerik listesi yüklenirken hata:", error);
      toast.error("İçerik listesi yüklenemedi");
    }
  }, []);

  // Load chats on mount
  useEffect(() => {
    if (user) {
      loadChats();
      loadContentList();
    }
  }, [user, loadChats, loadContentList]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
      // Load selected content if this is a contentVisualize chat
      const activeChat = chats.find((c) => c.id === activeChatId);
      if (activeChat?.type === "contentVisualize" && activeChat?.contentId) {
        setSelectedContentId(activeChat.contentId);
        setSelectedContentTitle(activeChat.contentTitle || null);
      } else {
        setSelectedContentId(null);
        setSelectedContentTitle(null);
      }
    } else {
      setMessages([]);
      setSelectedContentId(null);
      setSelectedContentTitle(null);
    }
  }, [activeChatId, loadMessages, chats]);

  const handleNewChat = async (chatType = "chat") => {
    try {
      const newChatId = await createChat({
        title:
          chatType === "contentVisualize"
            ? `Yeni Görsel ${new Date().toLocaleDateString("tr-TR")}`
            : `Yeni Sohbet ${new Date().toLocaleDateString("tr-TR")}`,
        userId: user.uid,
        model: selectedModel,
        type: chatType,
      });

      await loadChats();
      setActiveChatId(newChatId);
      toast.success(
        chatType === "contentVisualize"
          ? "Yeni görsel oluşturma başlatıldı"
          : "Yeni sohbet oluşturuldu"
      );
    } catch (error) {
      console.error("Yeni chat oluşturulurken hata:", error);
      toast.error("Oluşturulamadı");
    }
  };

  const handleChatSelect = (chatId) => {
    setActiveChatId(chatId);
  };

  const handleContentSelect = async (contentId) => {
    try {
      // Find content details
      const content = contentList.find((c) => c.id === contentId);
      if (!content) {
        toast.error("İçerik bulunamadı");
        return;
      }

      setSelectedContentId(contentId);
      setSelectedContentTitle(content.title || "");

      // Create new content visualize chat if no active chat
      if (!activeChatId) {
        const newChatId = await createChat({
          title: `${content.title} - Görsel`,
          userId: user.uid,
          model: selectedModel,
          type: "contentVisualize",
          contentId: contentId,
          contentTitle: content.title || "",
        });

        await loadChats();
        setActiveChatId(newChatId);
      } else {
        // Update existing chat with content
        await updateChat(activeChatId, {
          contentId: contentId,
          contentTitle: content.title || "",
        });
        await loadChats();
      }

      toast.success("İçerik seçildi");
    } catch (error) {
      console.error("İçerik seçilirken hata:", error);
      toast.error("İçerik seçilemedi");
    }
  };

  const handleContentClear = () => {
    setSelectedContentId(null);
    setSelectedContentTitle(null);
  };

  const handleDeleteChat = async (chatId) => {
    try {
      const chatMessages = await getChatMessages(chatId);
      const messageCount = chatMessages.length;
      const imageCount = chatMessages.reduce((count, msg) => {
        return count + (msg.imageUrls?.length || 0);
      }, 0);

      const chat = chats.find((c) => c.id === chatId);
      setChatToDelete({
        id: chatId,
        title: chat?.title || "Sohbet",
        messageCount,
        imageCount,
      });
      setDeleteDialogOpen(true);
    } catch (error) {
      console.error("Sohbet bilgisi alınırken hata:", error);
      toast.error("Sohbet bilgisi alınamadı");
    }
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete?.id) return;

    try {
      await deleteChat(chatToDelete.id);

      if (activeChatId === chatToDelete.id) {
        setActiveChatId(null);
        setMessages([]);
      }

      await loadChats();
      toast.success("Sohbet, tüm mesajlar ve görseller silindi");
    } catch (error) {
      console.error("Chat silinirken hata:", error);
      toast.error("Sohbet silinemedi: " + error.message);
    } finally {
      setDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };

  const handleSendMessage = async (messageData) => {
    const activeChat = chats.find((c) => c.id === activeChatId);
    const isContentVisualize = activeChat?.type === "contentVisualize";

    if (!activeChatId) {
      await handleNewChat(isContentVisualize ? "contentVisualize" : "chat");
      return;
    }

    // For content visualize, ensure content is selected
    if (isContentVisualize && !messageData.contentId && !selectedContentId) {
      toast.error("Lütfen önce bir içerik seçin");
      return;
    }

    try {
      setLoading(true);

      // Upload user images to Firebase Storage (for regular chat)
      let uploadedImageUrls = [];
      if (messageData.images && messageData.images.length > 0) {
        try {
          uploadedImageUrls = await uploadUserImagesToStorage(
            messageData.images,
            activeChatId
          );
          console.log(`✅ User images uploaded:`, uploadedImageUrls);
        } catch (uploadError) {
          console.error("❌ Image upload failed:", uploadError);
          toast.error("Görseller yüklenemedi, mesaj gönderilemiyor");
          return;
        }
      }

      // Add user message to UI immediately
      const userMessage = {
        id: `temp-${Date.now()}`,
        chatId: activeChatId,
        role: "user",
        content: messageData.displayContent || messageData.content, // Use displayContent if provided
        imageUrls: uploadedImageUrls,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Save user message to Firestore (use original content)
      await addMessage({
        chatId: activeChatId,
        role: "user",
        content: messageData.displayContent || messageData.content,
        imageUrls: uploadedImageUrls,
        model: messageData.model,
      });

      await new Promise((resolve) => setTimeout(resolve, 300));

      // Determine API endpoint based on chat type
      const apiEndpoint = isContentVisualize
        ? "/api/admin/ai/gemini/content-visualize"
        : "/api/admin/ai/gemini/chat";

      // Call Gemini API
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChatId,
          message: messageData.content,
          images: messageData.images,
          model: messageData.model,
          settings: messageData.settings,
          contentId: isContentVisualize
            ? messageData.contentId || selectedContentId
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error("API request failed");
      }

      const data = await response.json();

      if (!data.response || data.response.trim() === "") {
        console.error("❌ Empty response from API");
        throw new Error("Boş yanıt alındı");
      }

      // Add AI response to UI
      const aiMessage = {
        id: `temp-ai-${Date.now()}`,
        chatId: activeChatId,
        role: "assistant",
        content: data.response,
        imageUrls: data.generatedImageUrls || [],
        model: messageData.model,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Save AI message to Firestore
      await addMessage({
        chatId: activeChatId,
        role: "assistant",
        content: data.response,
        imageUrls: data.generatedImageUrls || [],
        model: messageData.model,
        tokens: data.tokens,
      });

      // Update chat title if it's the first message
      const currentChat = chats.find((c) => c.id === activeChatId);
      if (currentChat && currentChat.messageCount === 0) {
        const newTitle =
          messageData.content.slice(0, 50) +
          (messageData.content.length > 50 ? "..." : "");
        await updateChat(activeChatId, { title: newTitle });
        await loadChats();
      }

      // Clear selected content after successful message send (for content visualize)
      if (isContentVisualize && selectedContentId) {
        handleContentClear();
      }
    } catch (error) {
      console.error("Mesaj gönderilirken hata:", error);
      toast.error("Mesaj gönderilemedi");
    } finally {
      setLoading(false);
    }
  };

  // Load more messages (for infinite scroll)
  const loadMoreMessages = useCallback(async () => {
    if (!activeChatId || !hasMoreMessages || loadingMore) return;

    try {
      setLoadingMore(true);
      const currentOldestMessage = messages[0];
      if (!currentOldestMessage) return;

      const olderMessages = await getChatMessages(
        activeChatId,
        30,
        currentOldestMessage.createdAt
      );

      if (olderMessages.length > 0) {
        setMessages((prev) => [...olderMessages, ...prev]);
        setHasMoreMessages(olderMessages.length === 30);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Eski mesajlar yüklenirken hata:", error);
      toast.error("Eski mesajlar yüklenemedi");
    } finally {
      setLoadingMore(false);
    }
  }, [activeChatId, hasMoreMessages, loadingMore, messages]);

  const value = {
    chats,
    activeChatId,
    messages,
    loading,
    chatsLoading,
    selectedModel,
    deleteDialogOpen,
    chatToDelete,
    hasMoreMessages,
    loadingMore,
    selectedContentId,
    selectedContentTitle,
    contentList,
    setSelectedModel,
    setDeleteDialogOpen,
    handleNewChat,
    handleChatSelect,
    handleDeleteChat,
    confirmDeleteChat,
    handleSendMessage,
    loadMoreMessages,
    handleContentSelect,
    handleContentClear,
  };

  return (
    <GeminiChatContext.Provider value={value}>
      {children}
    </GeminiChatContext.Provider>
  );
}

export function useGeminiChat() {
  const context = useContext(GeminiChatContext);
  if (context === undefined) {
    throw new Error("useGeminiChat must be used within a GeminiChatProvider");
  }
  return context;
}
