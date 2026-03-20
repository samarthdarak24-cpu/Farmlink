'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface VideoBackgroundProps {
  src: string;
  fallbackImage?: string;
  overlayClass?: string;
  className?: string;
}

export default function VideoBackground({
  src,
  fallbackImage,
  overlayClass = 'bg-gradient-to-b from-black/80 via-black/50 to-black/80',
  className = '',
}: VideoBackgroundProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      // Force play if it didn't autoplay
      videoRef.current.play().catch(() => {
        console.warn('Video autoplay prevented');
      });
    }
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden w-full h-full -z-10 bg-gray-950 ${className}`}>
      {fallbackImage && (
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          style={{ backgroundImage: `url(${fallbackImage})` }}
        />
      )}

      <motion.video
        ref={videoRef}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: isVideoLoaded ? 1 : 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setIsVideoLoaded(true)}
      >
        <source src={src} type="video/mp4" />
      </motion.video>

      <div className={`absolute inset-0 ${overlayClass}`} />

      {/* Subtle grid mesh overlay for premium texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
