
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gallery, setGallery] = useState<{ url: string; prompt: string }[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const url = await generateImage(prompt, isPro, aspectRatio);
      setGallery(prev => [{ url, prompt }, ...prev]);
    } catch (error: any) {
      alert("Generation failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold">Image Generator</h2>
        <p className="text-slate-400">Bring your imagination to life with AI-generated art.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-2xl border border-white/5 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic city with bioluminescent plants..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 h-32 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {['1:1', '16:9', '9:16', '3:4', '4:3'].map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      aspectRatio === ratio 
                        ? 'border-purple-500 bg-purple-500/10 text-purple-400' 
                        : 'border-white/5 bg-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm font-medium">Use Pro Model</span>
              <button 
                onClick={() => setIsPro(!isPro)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isPro ? 'bg-purple-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPro ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : 'Generate Image'}
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Recent Generations 
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full font-normal text-slate-400">{gallery.length}</span>
          </h3>
          
          {gallery.length === 0 ? (
            <div className="h-[400px] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500">
              <span className="text-4xl mb-4 opacity-20">🖼️</span>
              <p>Your generated images will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gallery.map((item, idx) => (
                <div key={idx} className="group relative glass rounded-2xl border border-white/5 overflow-hidden animate-in zoom-in-95 duration-500">
                  <img src={item.url} alt={item.prompt} className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-xs text-white line-clamp-2 italic">"{item.prompt}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
