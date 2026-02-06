import React, { useState, useMemo, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { storiesApi } from '@/api/stories';
import type { Story } from '@/types';
import StoryComposer from './StoryComposer';

// Backend-powered list

export default function StoriesSection() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const followingIds = useMemo(() => {
    try {
      const raw = localStorage.getItem('following_ids');
      return raw ? JSON.parse(raw) as string[] : [];
    } catch {
      return [];
    }
  }, []);
  useEffect(() => {
    const load = async () => {
      try {
        const data = await storiesApi.list();
        setStories(data);
      } catch {
        setStories([]);
      }
    };
    load();
  }, []);
  const filteredStories = useMemo(() => {
    if (!followingIds.length) return stories;
    return stories.filter(s => followingIds.includes(String(s.user)));
  }, [followingIds, stories]);

  const [showComposer, setShowComposer] = useState(false);
  const handleAddStory = () => setShowComposer(true);
  const refreshStories = async () => {
    const data = await storiesApi.list();
    setStories(data);
  };

  return (
    <div className="py-4">
      <h3 className="text-lg font-semibold px-4 mb-2">Stories</h3>
      <div className="flex overflow-x-auto px-4 gap-4 pb-2 scrollbar-hide">
        {/* Add Story Button */}
        <div className="flex flex-col items-center space-y-1 min-w-[70px]">
          <button 
            onClick={handleAddStory}
            className="w-16 h-16 rounded-full border-2 border-dashed border-primary flex items-center justify-center bg-gray-50"
          >
            <Plus className="w-6 h-6 text-primary" />
          </button>
          <span className="text-xs font-medium">Add Status</span>
        </div>

        {/* Story Items */}
        {filteredStories.map((story) => (
          <div 
            key={story.id} 
            className="flex flex-col items-center space-y-1 min-w-[70px] cursor-pointer"
            onClick={() => setSelectedStory(story)}
          >
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-primary">
              <Avatar className="w-full h-full border-2 border-white">
                <AvatarImage src={story.image_url} className="object-cover" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs font-medium truncate w-16 text-center">User #{story.user}</span>
          </div>
        ))}
      </div>

      {showComposer && (
        <StoryComposer onClose={() => setShowComposer(false)} onCreated={refreshStories} />
      )}

      {/* Story Viewer Overlay */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button 
            onClick={() => setSelectedStory(null)}
            className="absolute top-4 right-4 text-white p-2"
          >
            <X className="w-8 h-8" />
          </button>
          
          {/\.(mp4|webm|mov)$/i.test(selectedStory.image_url) ? (
            <video src={selectedStory.image_url} controls autoPlay className="max-h-screen max-w-full object-contain" />
          ) : (
            <img 
              src={selectedStory.image_url} 
              alt="Story" 
              className="max-h-screen max-w-full object-contain"
            />
          )}
          
          <div className="absolute bottom-10 left-0 right-0 text-center text-white">
            <h3 className="text-xl font-bold">User #{selectedStory.user}</h3>
          </div>
        </div>
      )}
    </div>
  );
}
