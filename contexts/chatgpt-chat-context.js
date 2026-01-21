"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { DEFAULT_CHATGPT_MODEL } from "@/lib/openai";
import {
  createChatGPTChat,
  getChatGPTUserChats,
  getChatGPTMessages,
  addChatGPTMessage,
  deleteChatGPTChat,
  updateChatGPTChat,
  uploadChatGPTUserImages,
  getAllChatGPTMessages,
} from "@/lib/services/chatgpt-chat-service";

const ChatGPTChatContext = createContext(undefined);

export function ChatGPTChatProvider({ children, user }) {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_CHATGPT_MODEL);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load user's chats
  const loadChats = useCallback(async () => {
    if (!user) return;

    try {
      setChatsLoading(true);
      const userChats = await getChatGPTUserChats(user.uid);
      setChats(userChats);

      // Auto-select first chat if available and no chat is selected
      if (userChats.length > 0 && !activeChatId) {
        setActiveChatId(userChats[0].id);
      }
    } catch (error) {
      console.error("ChatGPT Chatler yüklenirken hata:", error);
      toast.error("Sohbetler yüklenemedi");
    } finally {
      setChatsLoading(false);
    }
  }, [user, activeChatId]);

  // Load messages for active chat
  const loadMessages = useCallback(async () => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    try {
      const result = await getChatGPTMessages(activeChatId, 50);
      setMessages(result.messages);
      setHasMoreMessages(result.hasMore);
    } catch (error) {
      console.error("ChatGPT Mesajlar yüklenirken hata:", error);
      toast.error("Mesajlar yüklenemedi");
    }
  }, [activeChatId]);

  // Load more messages for infinite scroll
  const loadMoreMessages = useCallback(async () => {
    if (!activeChatId || loadingMore || !hasMoreMessages) return;

    try {
      setLoadingMore(true);
      const lastMessage = messages[0];
      const result = await getChatGPTMessages(
        activeChatId,
        50,
        lastMessage?.createdAt
      );
      setMessages((prev) => [...result.messages, ...prev]);
      setHasMoreMessages(result.hasMore);
    } catch (error) {
      console.error("ChatGPT Eski mesajlar yüklenirken hata:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [activeChatId, loadingMore, hasMoreMessages, messages]);

  // Create new chat
  const handleNewChat = useCallback(async () => {
    if (!user) return;

    try {
      const chatId = await createChatGPTChat({
        title: "Yeni Sohbet",
        userId: user.uid,
        model: selectedModel,
      });

      await loadChats();
      setActiveChatId(chatId);
      setMessages([]);
    } catch (error) {
      console.error("ChatGPT Yeni sohbet oluşturulurken hata:", error);
      toast.error("Yeni sohbet oluşturulamadı");
    }
  }, [user, selectedModel, loadChats]);

  // Select chat
  const handleChatSelect = useCallback(async (chatId) => {
    setActiveChatId(chatId);
  }, []);

  // Delete chat dialog
  const handleDeleteChat = useCallback(
    async (chatId) => {
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        setChatToDelete(chat);
        setDeleteDialogOpen(true);
      }
    },
    [chats]
  );

  // Confirm delete chat
  const confirmDeleteChat = useCallback(async () => {
    if (!chatToDelete) return;

    try {
      await deleteChatGPTChat(chatToDelete.id);
      toast.success("Sohbet silindi");

      // Reload chats and select a new one
      await loadChats();

      // If deleted chat was active, select first available
      if (activeChatId === chatToDelete.id) {
        const remainingChats = chats.filter((c) => c.id !== chatToDelete.id);
        if (remainingChats.length > 0) {
          setActiveChatId(remainingChats[0].id);
        } else {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("ChatGPT Sohbet silinirken hata:", error);
      toast.error("Sohbet silinemedi");
    } finally {
      setDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  }, [chatToDelete, activeChatId, chats, loadChats]);

  // Send message
  const handleSendMessage = useCallback(
    async ({ content, images, model, settings }) => {
      if (!user) return;

      // Create new chat if none selected
      let currentChatId = activeChatId;
      if (!currentChatId) {
        try {
          currentChatId = await createChatGPTChat({
            title: content.substring(0, 50) || "Yeni Sohbet",
            userId: user.uid,
            model: model,
          });
          setActiveChatId(currentChatId);
          await loadChats();
        } catch (error) {
          console.error("ChatGPT Yeni sohbet oluşturulurken hata:", error);
          toast.error("Sohbet oluşturulamadı");
          return;
        }
      }

      try {
        setLoading(true);

        // Upload images if any
        let imageUrls = [];
        if (images && images.length > 0) {
          try {
            imageUrls = await uploadChatGPTUserImages(
              images,
              currentChatId,
              user.uid
            );
          } catch (uploadError) {
            console.error("ChatGPT Görsel yüklenirken hata:", uploadError);
            // Continue with base64 images if upload fails
            imageUrls = images;
          }
        }

        // Add user message to Firestore
        await addChatGPTMessage({
          chatId: currentChatId,
          role: "user",
          content: content,
          imageUrls: imageUrls,
          model: model,
        });

        // Update local messages immediately
        const userMessage = {
          id: `temp-user-${Date.now()}`,
          role: "user",
          content: content,
          imageUrls: imageUrls,
          model: model,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Get chat history for context
        const history = await getAllChatGPTMessages(currentChatId);

        // Call API
        const response = await fetch("/api/admin/ai/chatgpt/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId: currentChatId,
            message: content,
            images: images, // Send original base64 for vision
            model: model,
            settings: settings,
            history: history.slice(-20), // Last 20 messages for context
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "API hatası");
        }

        const data = await response.json();

        // Add assistant message to Firestore
        await addChatGPTMessage({
          chatId: currentChatId,
          role: "assistant",
          content: data.response,
          model: data.model || model,
          usage: data.usage,
        });

        // Update local messages
        const assistantMessage = {
          id: `temp-assistant-${Date.now()}`,
          role: "assistant",
          content: data.response,
          model: data.model || model,
          usage: data.usage,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Update chat title if first message
        if (history.length === 0) {
          const title = content.substring(0, 50) + (content.length > 50 ? "..." : "");
          await updateChatGPTChat(currentChatId, { title });
          await loadChats();
        }
      } catch (error) {
        console.error("ChatGPT Mesaj gönderilirken hata:", error);
        toast.error(error.message || "Mesaj gönderilemedi");
      } finally {
        setLoading(false);
      }
    },
    [user, activeChatId, loadChats]
  );

  // Initial load
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Load messages when active chat changes
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

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
    setSelectedModel,
    setDeleteDialogOpen,
    handleNewChat,
    handleChatSelect,
    handleDeleteChat,
    handleSendMessage,
    confirmDeleteChat,
    loadMoreMessages,
  };

  return (
    <ChatGPTChatContext.Provider value={value}>
      {children}
    </ChatGPTChatContext.Provider>
  );
}

export function useChatGPTChat() {
  const context = useContext(ChatGPTChatContext);
  if (context === undefined) {
    throw new Error("useChatGPTChat must be used within a ChatGPTChatProvider");
  }
  return context;
}
