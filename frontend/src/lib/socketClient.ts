import { io, type Socket } from 'socket.io-client';

export function getSocketUrl() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  if (apiBase.endsWith('/api')) return apiBase.slice(0, -3);
  if (apiBase.endsWith('/api/')) return apiBase.slice(0, -4);
  return apiBase;
}

export function createAppSocket(): Socket {
  return io(getSocketUrl(), {
    autoConnect: false,
    transports: ['websocket'],
  });
}

