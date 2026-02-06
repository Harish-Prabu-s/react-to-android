import React, { useEffect, useRef, useState } from 'react';
import { Camera, Upload as UploadIcon, Wand2, Type, Image as ImageIcon, Save, X } from 'lucide-react';
import { storiesApi } from '@/api/stories';

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function StoryComposer({ onClose, onCreated }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textOverlay, setTextOverlay] = useState<string>('');
  const [gifUrl, setGifUrl] = useState<string>('');
  const [filter, setFilter] = useState({ brightness: 100, contrast: 100, saturate: 100, blur: 0 });

  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: mode === 'video' });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
    } catch (e) {
      setStream(null);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile(f);
    }
  };

  const capturePhoto = async () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.filter = `brightness(${filter.brightness}%) contrast(${filter.contrast}%) saturate(${filter.saturate}%) blur(${filter.blur}px)`;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    if (gifUrl) {
      try {
        const img = await loadImage(gifUrl);
        const size = Math.min(c.width, c.height) / 3;
        ctx.drawImage(img, c.width - size - 20, c.height - size - 20, size, size);
      } catch (e) {
        void 0;
      }
    }
    if (textOverlay) {
      ctx.font = `${Math.floor(c.width / 15)}px sans-serif`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      ctx.strokeText(textOverlay, c.width / 2, c.height - 50);
      ctx.fillText(textOverlay, c.width / 2, c.height - 50);
    }
    c.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `story_${Date.now()}.jpg`, { type: 'image/jpeg' });
      await uploadAndCreate(file);
    }, 'image/jpeg', 0.92);
  };

  const startRecording = () => {
    if (!stream) return;
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorderRef.current = recorder;
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setRecordingBlob(blob);
      setRecording(false);
    };
    recorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
  };

  const uploadAndCreate = async (file: File) => {
    try {
      const { url } = await storiesApi.uploadMedia(file);
      await storiesApi.create(url);
      onCreated();
      onClose();
    } catch {
      onClose();
    }
  };

  const save = async () => {
    if (mode === 'photo') {
      if (selectedFile) {
        await uploadAndCreate(selectedFile);
      } else {
        await capturePhoto();
      }
    } else {
      const file = selectedFile || (recordingBlob ? new File([recordingBlob], `story_${Date.now()}.webm`, { type: 'video/webm' }) : null);
      if (file) {
        await uploadAndCreate(file);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex gap-2">
            <button className={`px-3 py-1 rounded ${mode==='photo'?'bg-primary text-white':'bg-gray-100'}`} onClick={() => setMode('photo')}>Photo</button>
            <button className={`px-3 py-1 rounded ${mode==='video'?'bg-primary text-white':'bg-gray-100'}`} onClick={() => setMode('video')}>Video</button>
          </div>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 gap-4">
          <div className="flex gap-2">
            <button onClick={startCamera} className="px-3 py-2 bg-gray-100 rounded inline-flex items-center gap-2"><Camera className="w-4 h-4" /> Camera</button>
            <label className="px-3 py-2 bg-gray-100 rounded inline-flex items-center gap-2 cursor-pointer">
              <UploadIcon className="w-4 h-4" /> Upload
              <input type="file" accept={mode==='photo' ? 'image/*' : 'video/*'} className="hidden" onChange={handleFileSelect} />
            </label>
          </div>

          <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
            {mode === 'photo' ? (
              <>
                <video ref={videoRef} className="max-h-[60vh] w-full object-contain" />
                <canvas ref={canvasRef} className="hidden" />
              </>
            ) : (
              <>
                <video ref={videoRef} className="max-h-[60vh] w-full object-contain" />
                {recording ? (
                  <button onClick={stopRecording} className="absolute bottom-4 right-4 px-4 py-2 bg-red-500 text-white rounded">Stop</button>
                ) : (
                  stream ? <button onClick={startRecording} className="absolute bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded">Record</button> : null
                )}
              </>
            )}
          </div>

          {mode === 'photo' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2"><Wand2 className="w-4 h-4" /><span className="text-sm font-medium">Filters</span></div>
                <label className="block text-xs">Brightness {filter.brightness}%</label>
                <input type="range" min={0} max={200} value={filter.brightness} onChange={(e)=>setFilter({...filter, brightness: Number(e.target.value)})} />
                <label className="block text-xs">Contrast {filter.contrast}%</label>
                <input type="range" min={0} max={200} value={filter.contrast} onChange={(e)=>setFilter({...filter, contrast: Number(e.target.value)})} />
                <label className="block text-xs">Saturate {filter.saturate}%</label>
                <input type="range" min={0} max={200} value={filter.saturate} onChange={(e)=>setFilter({...filter, saturate: Number(e.target.value)})} />
                <label className="block text-xs">Blur {filter.blur}px</label>
                <input type="range" min={0} max={10} value={filter.blur} onChange={(e)=>setFilter({...filter, blur: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><Type className="w-4 h-4" /><span className="text-sm font-medium">Text</span></div>
                <input className="w-full border rounded px-2 py-1 text-sm" placeholder="Add text..." value={textOverlay} onChange={(e)=>setTextOverlay(e.target.value)} />
                <div className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /><span className="text-sm font-medium">GIF (URL)</span></div>
                <input className="w-full border rounded px-2 py-1 text-sm" placeholder="Paste GIF URL" value={gifUrl} onChange={(e)=>setGifUrl(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t flex justify-end">
          <button onClick={save} className="px-4 py-2 bg-primary text-white rounded inline-flex items-center gap-2">
            <Save className="w-4 h-4" /> Share to Story
          </button>
        </div>
      </div>
    </div>
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
