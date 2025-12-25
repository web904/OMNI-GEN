
import React, { useState } from 'react';
import { getAI, pollVideoOperation } from '../services/geminiService';
import { MODELS } from '../constants';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // API Key Check for Veo
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
    }

    setIsLoading(true);
    setStatus('Initializing operation...');
    try {
      const ai = getAI();
      let operation = await ai.models.generateVideos({
        model: MODELS.VIDEO_FAST,
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setStatus('Generating video (this may take 2-5 minutes)...');
      const downloadUri = await pollVideoOperation(operation);
      
      if (downloadUri) {
        const fullUri = `${downloadUri}&key=${process.env.API_KEY}`;
        setVideoUrl(fullUri);
      }
    } catch (error: any) {
      alert("Video generation failed: " + error.message);
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <h2 className="text-4xl font-extrabold mb-3">Veo Video Studio</h2>
        <p className="text-slate-400">Transform complex prompts into high-fidelity 720p/1080p video sequences.</p>
        <p className="mt-2 text-xs text-amber-500/80">
            Note: Veo requires a paid GCP project API key. 
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-1">Learn more</a>
        </p>
      </header>

      <div className="glass rounded-3xl border border-white/10 p-8 space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-widest">Dynamic Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cinematic drone shot of a futuristic neon city in the rain at night, cyberpunk aesthetic..."
            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none text-lg leading-relaxed transition-all"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 rounded-2xl font-bold text-xl shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all"
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>🎬</span>
              <span>Generate Cinematic Video</span>
            </>
          )}
        </button>

        {isLoading && (
          <div className="text-center animate-pulse">
            <p className="text-indigo-400 font-medium">{status}</p>
            <p className="text-xs text-slate-500 mt-2">Please do not close this window</p>
          </div>
        )}
      </div>

      {videoUrl && (
        <div className="animate-in fade-in zoom-in duration-700">
          <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <video 
              src={videoUrl} 
              controls 
              className="w-full h-auto aspect-video" 
              autoPlay 
              loop
            />
            <div className="p-4 bg-white/5 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Generated Sequence</span>
              <a 
                href={videoUrl} 
                download="ai-video.mp4" 
                className="text-indigo-400 text-sm hover:underline"
              >
                Download MP4
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
