'use client';

import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthZustand } from '@/store/authZustand';
import { decodeJwtPayload } from '@/lib/jwtDecode';
import { createAppSocket } from '@/lib/socketClient';

export default function DashboardRealtimeListener({
  onProposalUpdate,
  onOrderUpdate,
}: {
  onProposalUpdate?: (data: any) => void;
  onOrderUpdate?: (data: any) => void;
}) {
  const { token } = useAuthZustand((s) => ({ token: s.token }));
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    const payload = decodeJwtPayload<{ userId: string }>(token);
    const userId = payload?.userId;
    if (!userId) return;

    const socket = createAppSocket();
    socketRef.current = socket;
    socket.connect();
    socket.emit('authenticate', userId);

    socket.on('proposal_update', (data: any) => {
      onProposalUpdate?.(data);
      toast('Proposal updated', { id: `proposal-${data?.rfqId || ''}` });
    });

    socket.on('order_update', (data: any) => {
      onOrderUpdate?.(data);
      toast('Order updated', { id: `order-${data?.orderId || ''}` });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, onOrderUpdate, onProposalUpdate]);

  return null;
}

