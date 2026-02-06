/**
 * WhatsApp Real-time Hook
 * Firestore onSnapshot ile gerçek zamanlı mesaj ve sohbet dinleme
 * Polling yerine real-time listener kullanarak WhatsApp deneyimi sağlar
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";

// Collection names
const COLLECTIONS = {
  CONVERSATIONS: "whatsapp_conversations",
  MESSAGES: "whatsapp_messages",
};

/**
 * Real-time conversations listener
 */
export function useConversations(options = {}) {
  const { statusFilter = "all", searchQuery = "" } = options;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Build query
      let q = query(
        collection(db, COLLECTIONS.CONVERSATIONS),
        orderBy("lastMessageAt", "desc"),
        limit(100)
      );

      // Status filter
      if (statusFilter !== "all") {
        q = query(
          collection(db, COLLECTIONS.CONVERSATIONS),
          where("status", "==", statusFilter),
          orderBy("lastMessageAt", "desc"),
          limit(100)
        );
      }

      // Set up real-time listener
      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          let convs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Client-side search filter (Firestore doesn't support text search well)
          if (searchQuery) {
            const search = searchQuery.toLowerCase();
            convs = convs.filter(
              (c) =>
                c.waId?.toLowerCase().includes(search) ||
                c.profileName?.toLowerCase().includes(search) ||
                c.displayPhoneNumber?.toLowerCase().includes(search)
            );
          }

          setConversations(convs);
          setLoading(false);
        },
        (err) => {
          console.error("Conversations listener error:", err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Error setting up conversations listener:", err);
      setError(err.message);
      setLoading(false);
    }

    // Cleanup
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [statusFilter, searchQuery]);

  // Mark conversation as read
  const markAsRead = useCallback(async (conversationId) => {
    try {
      const docRef = doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
      await updateDoc(docRef, {
        unreadCount: 0,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  }, []);

  return {
    conversations,
    loading,
    error,
    markAsRead,
  };
}

/**
 * Real-time messages listener for a conversation
 */
export function useMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);
  const prevMessagesRef = useRef([]);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // Clear messages when conversation changes
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      isInitialLoadRef.current = true;
      prevMessagesRef.current = [];
      return;
    }

    setLoading(true);
    setError(null);
    isInitialLoadRef.current = true;

    try {
      const q = query(
        collection(db, COLLECTIONS.MESSAGES),
        where("conversationId", "==", conversationId),
        orderBy("timestamp", "asc")
      );

      unsubscribeRef.current = onSnapshot(
        q,
        (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Check if this is just a status update or real new messages
          const prevIds = new Set(prevMessagesRef.current.map((m) => m.id));
          const newIds = new Set(msgs.map((m) => m.id));
          
          // Only count truly new messages (not seen before)
          const hasNewMessages = msgs.some((m) => !prevIds.has(m.id));
          
          // Store for next comparison
          prevMessagesRef.current = msgs;

          // Update state
          setMessages(msgs);
          setLoading(false);

          // Mark initial load as complete after first snapshot
          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
          }
        },
        (err) => {
          console.error("Messages listener error:", err);
          setError(err.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Error setting up messages listener:", err);
      setError(err.message);
      setLoading(false);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [conversationId]);

  return {
    messages,
    loading,
    error,
    isInitialLoad: isInitialLoadRef.current,
  };
}

/**
 * Combined hook for WhatsApp real-time functionality
 */
export function useWhatsAppRealtime(options = {}) {
  const { statusFilter = "all", searchQuery = "" } = options;
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  
  // Conversations listener
  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    markAsRead,
  } = useConversations({ statusFilter, searchQuery });

  // Messages listener (for selected conversation)
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    isInitialLoad,
  } = useMessages(selectedConversationId);

  // Get selected conversation object
  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  // Select conversation handler
  const selectConversation = useCallback(
    (conversation) => {
      if (conversation?.id !== selectedConversationId) {
        setSelectedConversationId(conversation?.id || null);
        // Mark as read when selecting
        if (conversation?.id) {
          markAsRead(conversation.id);
        }
      }
    },
    [selectedConversationId, markAsRead]
  );

  return {
    // Conversations
    conversations,
    conversationsLoading,
    conversationsError,
    
    // Messages
    messages,
    messagesLoading,
    messagesError,
    isInitialLoad,
    
    // Selection
    selectedConversation,
    selectedConversationId,
    selectConversation,
    
    // Actions
    markAsRead,
  };
}

export default useWhatsAppRealtime;
