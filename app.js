import { create } from "zustand";
import { api } from "@/services/axiosClient";

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
}

interface ChatStore {
  conversations: Conversation[];
  messagesMap: Record<string, Message[]>;
  selectedConversationId: string | null;
  loading: boolean;
  sending: boolean;

  // actions
  setSelectedConversationId: (id: string) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;

  // getters
  messages: () => Message[];
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  messagesMap: {},
  selectedConversationId: null,
  loading: false,
  sending: false,

  setSelectedConversationId: (id) => set({ selectedConversationId: id }),

  fetchConversations: async () => {
    try {
      set({ loading: true });
      const data = await api.get<Conversation[]>("/chat/conversations");
      set({ conversations: data });
    } catch (error) {
      console.error("Error al obtener conversaciones:", error);
    } finally {
      set({ loading: false });
    }
  },

  fetchMessages: async (conversationId) => {
    try {
      set({ loading: true });
      const data = await api.get<Message[]>(
        `/chat/conversations/${conversationId}/messages`
      );
      set((state) => ({
        messagesMap: { ...state.messagesMap, [conversationId]: data },
      }));
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (text) => {
    const conversationId = get().selectedConversationId;
    if (!conversationId) {
      console.warn("No hay conversación seleccionada");
      return;
    }

    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      createdAt: new Date().toISOString(),
    };

    // UI optimista
    set((state) => ({
      messagesMap: {
        ...state.messagesMap,
        [conversationId]: [...(state.messagesMap[conversationId] || []), newMessage],
      },
    }));

    try {
      set({ sending: true });
      const res = await api.post<Message>(
        `/chat/conversations/${conversationId}/messages`,
        { text }
      );

      set((state) => ({
        messagesMap: {
          ...state.messagesMap,
          [conversationId]: [...(state.messagesMap[conversationId] || []), res],
        },
      }));
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    } finally {
      set({ sending: false });
    }
  },

  messages: () => {
    const { selectedConversationId, messagesMap } = get();
    return selectedConversationId ? messagesMap[selectedConversationId] || [] : [];
  },
}));
