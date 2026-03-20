'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { type Socket } from 'socket.io-client';
import { useAuthZustand } from '@/store/authZustand';
import { decodeJwtPayload } from '@/lib/jwtDecode';
import { createAppSocket } from '@/lib/socketClient';
import { messagesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Send, MessageSquare, Plus } from 'lucide-react';

type Conversation = {
  id: string;
  participants: string[];
  createdAt?: string;
  updatedAt?: string;
};

type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export default function ChatPanel() {
  const { token, user } = useAuthZustand((s) => ({ token: s.token, user: s.user }));
  const userId = useMemo(() => {
    if (!token) return null;
    const payload = decodeJwtPayload<{ userId: string }>(token);
    return payload?.userId ?? null;
  }, [token]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typingBy, setTypingBy] = useState<string | null>(null);

  const [newRecipientId, setNewRecipientId] = useState('');
  const [newInitialMessage, setNewInitialMessage] = useState('');
  const [startingConversation, setStartingConversation] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const typingTimerRef = useRef<number | null>(null);

  const refreshConversations = async () => {
    try {
      const { data } = await messagesApi.getConversations();
      setConversations(data);
      if (!selectedConversationId && data?.length) {
        setSelectedConversationId(data[0].id);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to load conversations');
    }
  };

  const refreshMessages = async (conversationId: string) => {
    try {
      const { data } = await messagesApi.getMessages(conversationId);
      setMessages(data);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to load messages');
    }
  };

  useEffect(() => {
    if (!token) return;
    refreshConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!selectedConversationId) return;
    refreshMessages(selectedConversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId]);

  useEffect(() => {
    if (!token || !userId) return;

    const socket = createAppSocket();
    socketRef.current = socket;

    socket.connect();
    socket.emit('authenticate', userId);

    socket.on('new-message', (data: any) => {
      if (data?.conversationId === selectedConversationId) {
        if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = window.setTimeout(() => {
          refreshMessages(selectedConversationId!);
        }, 120);
      }
    });

    socket.on('receive_message', (data: any) => {
      if (data?.conversationId === selectedConversationId) {
        if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = window.setTimeout(() => {
          refreshMessages(selectedConversationId!);
        }, 120);
      }
    });

    socket.on('user-typing', (data: { conversationId: string; userId: string }) => {
      if (data.conversationId !== selectedConversationId) return;
      setTypingBy(data.userId);
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = window.setTimeout(() => setTypingBy(null), 1600);
    });

    return () => {
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId]);

  useEffect(() => {
    if (!socketRef.current || !userId) return;
    if (!selectedConversationId) return;
    socketRef.current.emit('join-conversation', selectedConversationId);
    return () => {
      socketRef.current?.emit('leave-conversation', selectedConversationId);
    };
  }, [selectedConversationId, userId]);

  const sendTyping = () => {
    if (!socketRef.current || !selectedConversationId || !userId) return;
    socketRef.current.emit('typing', { conversationId: selectedConversationId, userId });
  };

  const recipientIdForConversation = (conv: Conversation) => {
    if (!userId) return null;
    return conv.participants.find((p) => p !== userId) ?? null;
  };

  const handleSend = async () => {
    if (!selectedConversationId || !userId) return;
    if (!input.trim()) return;

    const conv = conversations.find((c) => c.id === selectedConversationId);
    const recipientId = conv ? recipientIdForConversation(conv) : null;
    if (!recipientId) {
      toast.error('Recipient not found for this conversation');
      return;
    }

    const content = input.trim();
    setInput('');

    try {
      // Persist message via REST
      await messagesApi.sendMessage(selectedConversationId, content);
      // Notify recipient via socket
      socketRef.current?.emit('send_message', {
        recipientId,
        message: content,
        conversationId: selectedConversationId,
      });
      // Also emit old event name for compatibility
      socketRef.current?.emit('send-message', {
        recipientId,
        message: content,
        conversationId: selectedConversationId,
      });
      await refreshMessages(selectedConversationId);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to send message');
    }
  };

  const handleStartConversation = async () => {
    if (!newRecipientId.trim()) return;
    setStartingConversation(true);
    try {
      const initialMessage = newInitialMessage.trim() || 'Hi! I’d like to discuss a trade.';
      const { data } = await messagesApi.startConversation(newRecipientId.trim(), initialMessage);
      setSelectedConversationId(data.id);
      setNewRecipientId('');
      setNewInitialMessage('');
      toast.success('Conversation started');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to start conversation');
    } finally {
      setStartingConversation(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="lg:col-span-4 glass-card border border-white/20 rounded-3xl p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-300" />
            <p className="font-display font-bold text-gray-900 dark:text-white">Conversations</p>
          </div>
        </div>

        <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {conversations.length ? (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedConversationId(c.id)}
                className={`w-full text-left px-3 py-2 rounded-2xl border transition-colors ${
                  selectedConversationId === c.id
                    ? 'border-primary-500/40 bg-primary-50/60 text-primary-700 dark:text-primary-200'
                    : 'border-transparent hover:border-white/20 hover:bg-white/10 text-gray-700 dark:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold truncate">
                    {c.participants.includes(userId || '') ? 'Chat' : 'Conversation'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {c.id.slice(0, 6)}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No conversations yet.
            </p>
          )}
        </div>

        <div className="mt-4 border-t border-white/20 pt-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Start new</p>
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Recipient userId</span>
              <input
                value={newRecipientId}
                onChange={(e) => setNewRecipientId(e.target.value)}
                className="input mt-1"
                placeholder="e.g. buyer userId"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Initial message</span>
              <input
                value={newInitialMessage}
                onChange={(e) => setNewInitialMessage(e.target.value)}
                className="input mt-1"
                placeholder="Hi! I’m interested in..."
              />
            </label>
            <button
              type="button"
              onClick={handleStartConversation}
              disabled={startingConversation}
              className="btn btn-primary w-full"
            >
              <span className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                {startingConversation ? 'Starting...' : 'Start'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="lg:col-span-8 glass-card border border-white/20 rounded-3xl p-4 flex flex-col"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-display font-bold text-gray-900 dark:text-white">
            {selectedConversationId ? `Chat • ${selectedConversationId.slice(0, 8)}` : 'Select a conversation'}
          </p>
          {typingBy && typingBy !== userId ? (
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-300">Typing...</p>
          ) : null}
        </div>

        <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-3">
          {messages.length ? (
            messages.map((m) => {
              const mine = m.senderId === userId;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 border ${
                      mine
                        ? 'bg-primary-50/70 border-primary-500/30'
                        : 'bg-white/10 border-white/20'
                    }`}
                  >
                    <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                      {m.content}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {selectedConversationId ? 'No messages yet.' : 'Pick a conversation to start chatting.'}
            </p>
          )}
        </div>

        <div className="mt-4 border-t border-white/20 pt-4">
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                sendTyping();
              }}
              disabled={!selectedConversationId}
              className="input flex-1"
              placeholder={selectedConversationId ? 'Type a message...' : 'Select a conversation'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!selectedConversationId || !input.trim()}
              className="btn btn-primary"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

