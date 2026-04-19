"use client";

import { useState } from "react";
import { Play, Maximize, Settings, Volume2 } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  onComplete?: () => void;
}

export default function VideoPlayer({ url, onComplete }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Helper to transform common video URLs into embed URLs
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return "";
    
    try {
      // YouTube Full URL: https://www.youtube.com/watch?v=1mEf954rnV8
      if (rawUrl.includes("youtube.com/watch")) {
        const urlObj = new URL(rawUrl);
        const v = urlObj.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}`;
      }
      
      // YouTube Short URL: https://youtu.be/1mEf954rnV8
      if (rawUrl.includes("youtu.be/")) {
        const id = rawUrl.split("youtu.be/")[1]?.split("?")[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      
      // Vimeo: https://vimeo.com/123456789
      if (rawUrl.includes("vimeo.com/") && !rawUrl.includes("player.vimeo.com")) {
        const id = rawUrl.split("vimeo.com/")[1]?.split("/")[0]?.split("?")[0];
        if (id) return `https://player.vimeo.com/video/${id}`;
      }
    } catch(e) {
      // Fallback if URL parsing fails
    }
    
    // Return original if it doesn't match known patterns (could be a direct MP4 or already an embed)
    return rawUrl;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
