import type { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const setSocketServer = (io: SocketIOServer): void => {
  ioInstance = io;
};

export const getSocketServer = (): SocketIOServer | null => ioInstance;
