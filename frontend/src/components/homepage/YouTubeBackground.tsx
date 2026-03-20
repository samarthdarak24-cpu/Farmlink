'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface YouTubeBackgroundProps {
  videoId: string;
  overlayOpacity?: number;
  fallbackImage?: string;
  className?: string;
}

export default function YouTubeBackground({
  videoId,
  overlayOpacity = 0.6,
  fallbackImage,
  className = "",
}: YouTubeBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Construction of YouTube embed URL with background parameters:
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1&enablejsapi=1&origin=${origin}&playsinline=1`;

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-black ${className}`}>
      {/* Fallback / Loading State */}
      <AnimatePresence>
        {(!isLoaded && fallbackImage) && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${fallbackImage})` }}
          />
        )}
      </AnimatePresence>

      {/* Modern dark gradient overlay */}
      <div 
        className="absolute inset-0 z-10 transition-opacity duration-1000"
        style={{ 
          background: `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity + 0.1}), rgba(0,0,0,${overlayOpacity - 0.2}), rgba(0,0,0,${overlayOpacity + 0.2}))`,
        }} 
      />

      {/* The YouTube Iframe */}
      <motion.iframe
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1.5 }}
        className="absolute top-1/2 left-1/2 w-[115vw] h-[115vh] -translate-x-1/2 -translate-y-1/2 object-cover border-none scale-[1.05]"
        src={embedUrl}
        title="YouTube Background Video"
        allow="autoplay; encrypted-media"
        onLoad={() => setIsLoaded(true)}
      />

      {/* Subtle scanline/noise texture overlay for premium feel */}
      <div className="absolute inset-0 z-20 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}
