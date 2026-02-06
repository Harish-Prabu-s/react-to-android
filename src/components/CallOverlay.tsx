import React from 'react';
import { useCall } from '@/context/CallContext';
import { Ionicons } from '@expo/vector-icons';

export default function CallOverlay() {
  const { callState, endCall, toggleMinimize } = useCall();

  if (!callState.isActive) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (callState.isMinimized) {
    return (
      <div className="fixed bottom-24 right-4 z-50 w-32 bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-700">
        <div className="relative h-40 bg-gray-800 flex flex-col items-center justify-center">
          {callState.type === 'video' || callState.type === 'live' ? (
             <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                <Ionicons name="person" size={48} color="#6b7280" />
             </div>
          ) : (
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2">
               <Ionicons name="person" size={32} color="currentColor" />
            </div>
          )}
          
          <div className="absolute bottom-0 w-full bg-black/60 p-2">
             <p className="text-white text-xs text-center font-mono">{formatDuration(callState.duration)}</p>
             <div className="flex justify-center gap-2 mt-1">
                <button onClick={toggleMinimize} className="p-1 rounded-full bg-gray-600 text-white">
                  <Ionicons name="expand" size={12} color="white" />
                </button>
                <button onClick={endCall} className="p-1 rounded-full bg-red-500 text-white">
                  <Ionicons name="close" size={12} color="white" />
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Full Screen Mode
  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={toggleMinimize}
          className="p-3 bg-black/40 rounded-full text-white backdrop-blur-sm"
        >
          <Ionicons name="contract" size={24} color="white" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Background / Video Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900">
            {/* If video, render video stream here */}
            <div className="w-full h-full flex items-center justify-center">
               <div className="w-40 h-40 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600">
                  <Ionicons name="person" size={80} color="#9ca3af" />
               </div>
            </div>
        </div>

        {/* Call Info */}
        <div className="z-10 text-center mb-20">
          <h2 className="text-3xl font-bold text-white mb-2">Unknown User</h2>
          <p className="text-primary-300 text-lg mb-4 capitalize">{callState.type} Call</p>
          <p className="text-white text-4xl font-mono font-light tracking-wider">
            {formatDuration(callState.duration)}
          </p>
          <p className="text-gray-400 text-sm mt-2">{callState.costPerMinute} coins/min</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-8 pb-12 rounded-t-3xl border-t border-gray-800">
        <div className="flex items-center justify-center gap-8">
          <button className="p-4 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700">
            <Ionicons name="mic" size={24} color="#9ca3af" />
          </button>
          
          <button 
            onClick={endCall}
            className="p-6 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transform active:scale-95 transition-all"
          >
            <Ionicons name="close" size={32} color="white" />
          </button>

          <button className="p-4 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700">
            <Ionicons name="videocam" size={24} color="#9ca3af" />
          </button>
        </div>
      </div>
    </div>
  );
}
