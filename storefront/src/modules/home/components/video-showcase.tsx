"use client"

import { useState } from "react"
import { Play, X } from "lucide-react"

type VideoItem = {
  id: string
  title: string
  thumbnail: string
  videoUrl: string
  duration: string
}

export default function VideoShowcase() {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)

  // Replace these with your actual video URLs and thumbnails
  // You can use YouTube embeds, Vimeo, or self-hosted videos
  const videos: VideoItem[] = [
    {
      id: "1",
      title: "Premium Phone Cases Collection",
      thumbnail: "/video-thumb-1.jpg",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
      duration: "2:30",
    },
    {
      id: "2",
      title: "Unboxing Latest Tech Accessories",
      thumbnail: "/video-thumb-2.jpg",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
      duration: "3:45",
    },
    {
      id: "3",
      title: "Why Choose Letscase Ghana",
      thumbnail: "/video-thumb-3.jpg",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
      duration: "1:55",
    },
  ]

  // Use brand theme color for all video thumbnails
  const brandGradient = "from-brand to-brand-dark"

  return (
    <>
      <div className="py-16 small:py-20 bg-gradient-to-b from-white to-grey-5">
        <div className="mx-auto max-w-[1440px] px-5 small:px-10">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand/10 text-brand text-[12px] font-semibold uppercase tracking-wider mb-4">
              Watch & Explore
            </span>
            <h2 className="text-[28px] small:text-[36px] font-bold text-grey-90">
              See Our Products In Action
            </h2>
            <p className="mt-3 text-[14px] text-grey-50 max-w-[500px] mx-auto">
              Watch our latest videos showcasing premium tech accessories and customer experiences
            </p>
          </div>

          <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-1 small:grid-cols-3 gap-6">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideo(video)}
                  className="group relative aspect-video rounded-[20px] overflow-hidden border border-grey-20 bg-grey-10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-transparent"
                >
                  {/* Thumbnail or Gradient Placeholder */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${brandGradient}`}>
                    {/* If you have actual thumbnails, use Image component here */}
                    {/* <Image src={video.thumbnail} alt={video.title} fill className="object-cover" /> */}
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center text-grey-90 shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                      <Play size={28} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="text-[14px] font-semibold text-white text-left">
                      {video.title}
                    </div>
                    <div className="text-[12px] text-white/70 text-left mt-1">
                      {video.duration}
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute top-4 right-4 px-2 py-1 rounded-md bg-black/60 text-white text-[11px] font-medium">
                    {video.duration}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="relative w-full max-w-[900px] aspect-video rounded-[16px] overflow-hidden bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={activeVideo.videoUrl}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
            
            {/* Close Button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
              aria-label="Close video"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
