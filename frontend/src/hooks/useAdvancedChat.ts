'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthZustand } from '@/store/authZustand';
import { messagesApi } from '@/lib/api';

export type MessageStatus = 'sent' | 'delivered' | 'seen';
export type MessageType = 'text' | 'image' | 'document' | 'voice' | 'negotiation';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  negotiationData?: any;
  attachments?: string[];
  createdAt: string;
}

export const useAdvancedChat = (conversationId: string | null, recipientId: string | null) => {
  const { token, user } = useAuthZustand();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState<'online' | 'offline'>('offline');
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !user?.id) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token },
    });
    socketRef.current = socket;

    socket.emit('authenticate', user.id);

    socket.on('receive_message', (msg: ChatMessage) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
        // Auto-emit seen if we are in this conversation
        socket.emit('message_seen', {
          messageId: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId
        });
      }
    });

    socket.on('message_delivered', ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: 'delivered' } : m))
      );
    });

    socket.on('message_seen_update', ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: 'seen' } : m))
      );
    });

    socket.on('user_typing', (data: { conversationId: string; isTyping: boolean }) => {
      if (data.conversationId === conversationId) {
        setIsTyping(data.isTyping);
      }
    });

    socket.on('user_status_change', (data: { userId: string; status: 'online' | 'offline'; lastSeen?: string }) => {
      if (data.userId === recipientId) {
        setOnlineStatus(data.status);
        if (data.lastSeen) setLastSeen(data.lastSeen);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId, recipientId, token, user?.id]);

  const sendMessage = useCallback(async (content: string, type: MessageType = 'text', extra?: any) => {
    if (!conversationId || !recipientId) return;
    try {
      const { data } = await messagesApi.sendMessage(conversationId, {
        content,
        type,
        recipientId,
        ...extra
      });
      setMessages((prev) => [...prev, data]);
      socketRef.current?.emit('send_message', data);
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  }, [conversationId, recipientId]);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!conversationId || !recipientId) return;
    socketRef.current?.emit(isTyping ? 'typing_start' : 'typing_stop', {
      conversationId,
      recipientId
    });
  }, [conversationId, recipientId]);

  return {
    messages,
    setMessages,
    sendMessage,
    sendTyping,
    isTyping,
    onlineStatus,
    lastSeen,
  };
};
