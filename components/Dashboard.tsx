
import React from 'react';
import { AppView } from '../types';

interface DashboardProps {
  setView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const cards = [
    {
      view: AppView.TEXT,
      title: 'Text & Logic',
      description: 'Conversational AI, complex reasoning, coding, and structured JSON output.',
      icon: '💬',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      view: AppView.IMAGE,
      title: 'Image Generation',
      description: 'Create stunning visuals from prompts using Nano Banana and Imagen models.',
      icon: '🎨',
      color: 'from-purple-500 to-pink-500',
    },
    {
      view: AppView.VIDEO,
      title: 'Cinematic Video',
      description: 'High-quality video generation with Veo 3.1. Text-to-video and image-to-video.',
      icon: '🎬',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      view: AppView.AUDIO,
      title: 'Speech & Audio',
      description: 'Multilingual text-to-speech with natural voices and conversation simulation.',
      icon: '🎙️',
      color: 'from-orange-500 to-yellow-500',
    },
    {
      view: AppView.LIVE,
      title: 'Live Interaction',
      description: 'Real-time low-latency voice and video conversation with Gemini Live.',
      icon: '✨',
      color: 'from-emerald-500 to-teal-400',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-4xl font-extrabold tracking-tight mb-2">Welcome to Gemini <span className="text-blue-400">Omni-Gen</span></h2>
        <p className="text-slate-400 text-lg max-w-2xl">
          A powerful playground to explore the frontiers of generative AI. Every capability of the Gemini API, in one interface.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <button
            key={card.view}
            onClick={() => setView(card.view)}
            className="group relative flex flex-col items-start p-8 rounded-2xl glass border border-white/5 hover:border-white/20 transition-all text-left overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity rounded-bl-full`}></div>
            <span className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">{card.icon}</span>
            <h3 className="text-xl font-bold mb-3">{card.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed flex-1">{card.description}</p>
            <div className="mt-6 flex items-center text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
              Launch Generator <span className="ml-2">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
