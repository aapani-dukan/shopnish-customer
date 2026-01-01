import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = "https://shopnish-seprate.onrender.com";

export const useSocket = (orderId: number) => {
  const socketRef = useRef<Socket | null>(null);
  const [riderLocation, setRiderLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Mobile ke liye hamesha 'websocket' transport best hai
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to tracking server');
      socketRef.current?.emit('join-order-room', { orderId });
    });

    // Backend event listener
    socketRef.current.on('order:delivery_location', (data) => {
      if (data.lat && data.lng) {
        setRiderLocation({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [orderId]);

  return { riderLocation };
};