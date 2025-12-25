
import React, { useState, useRef, useEffect } from 'react';
import { getAI } from '../services/geminiService';
import { Modality, LiveServerMessage } from '@google/genai';

// Implement required manual encoding/decoding functions for Live API
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

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

const LiveGenerator: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [status, setStatus] = useState('Standby');
  
  const nextStartTimeRef = useRef(0);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const currentTranscriptionRef = useRef({ user: '', model: '' });

  const stopSession = () => {
    setIsActive(false);
    setStatus('Ending session...');
    
    // Stop audio
    for (const source of sourcesRef.current.values()) {
        source.stop();
    }
    sourcesRef.current.clear();
    
    // Stop mic stream
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setStatus('Standby');
  };

  const startSession = async () => {
    setIsActive(true);
    setStatus('Connecting to Gemini...');
    
    try {
      const ai = getAI();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      if (!inputAudioContextRef.current) {
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        outputNodeRef.current = outputAudioContextRef.current.createGain();
        outputNodeRef.current.connect(outputAudioContextRef.current.destination);
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('Active - Speak now');
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Audio Output Handling
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNodeRef.current!);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            // Interrupt handling
            if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }

            // Transcription handling
            if (message.serverContent?.inputTranscription) {
              currentTranscriptionRef.current.user += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              currentTranscriptionRef.current.model += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
              const u = currentTranscriptionRef.current.user;
              const m = currentTranscriptionRef.current.model;
              setTranscription(prev => [...prev, `User: ${u}`, `Gemini: ${m}`]);
              currentTranscriptionRef.current = { user: '', model: '' };
            }
          },
          onerror: () => setStatus('Connection Error'),
          onclose: () => {
              setStatus('Standby');
              setIsActive(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are a friendly, witty, and real-time AI companion. Keep answers concise and human-like.'
        },
      });
    } catch (err: any) {
      alert("Live error: " + err.message);
      setIsActive(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">Gemini Live</h2>
        <p className="text-slate-400 mt-2">Natural, zero-latency voice conversations.</p>
      </header>

      <div className="flex flex-col items-center justify-center p-12 glass rounded-full border border-white/10 w-64 h-64 mx-auto relative group">
        <div className={`absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl transition-all duration-1000 ${isActive ? 'scale-150 opacity-50' : 'scale-0 opacity-0'}`}></div>
        
        <button
          onClick={isActive ? stopSession : startSession}
          className={`relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 transition-all shadow-2xl ${
            isActive ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          <span className="text-4xl">{isActive ? '⏹️' : '🎙️'}</span>
          <span className="text-sm font-bold uppercase tracking-widest">{isActive ? 'Stop' : 'Connect'}</span>
        </button>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
          <span className="text-sm font-medium">{status}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest text-center">Live Transcript</h3>
        <div className="glass rounded-2xl border border-white/5 p-6 min-h-[200px] max-h-[400px] overflow-y-auto space-y-4 font-medium">
          {transcription.length === 0 && (
            <p className="text-center text-slate-600 italic py-10">Start a session to see the real-time conversation...</p>
          )}
          {transcription.map((line, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-xl max-w-[80%] ${
                line.startsWith('User:') ? 'bg-white/5 mr-auto' : 'bg-emerald-500/10 border border-emerald-500/10 ml-auto text-emerald-100'
              }`}
            >
              <p className="text-sm leading-relaxed">{line}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveGenerator;
