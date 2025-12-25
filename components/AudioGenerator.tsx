
import React, { useState, useRef } from 'react';
import { generateTTS } from '../services/geminiService';
import { AUDIO_VOICES } from '../constants';

// Helper for Base64 Decode
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper for Audio Decoding
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AudioGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(AUDIO_VOICES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handlePlay = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const base64 = await generateTTS(text, selectedVoice);
      if (!base64) throw new Error("Audio generation failed");

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioData = decodeBase64(base64);
      const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (error: any) {
      alert("Audio failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h2 className="text-3xl font-bold">Speech Studio</h2>
        <p className="text-slate-400">Neural text-to-speech with natural intonation.</p>
      </header>

      <div className="glass rounded-2xl border border-white/5 p-6 space-y-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 min-h-[150px] focus:ring-2 focus:ring-orange-500 outline-none"
        />

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {AUDIO_VOICES.map(voice => (
            <button
              key={voice}
              onClick={() => setSelectedVoice(voice)}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                selectedVoice === voice 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {voice}
            </button>
          ))}
        </div>

        <button
          onClick={handlePlay}
          disabled={isLoading}
          className="w-full h-12 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>🔊</span>
              <span>Generate & Play Audio</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-xs text-blue-400">
          <strong>Tip:</strong> You can guide the emotion by adding instructions like "Say cheerfully: " or "Say in a whisper: " before your text.
        </p>
      </div>
    </div>
  );
};

export default AudioGenerator;
