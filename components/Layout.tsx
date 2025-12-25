
import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const navItems = [
    { label: 'Dashboard', view: AppView.DASHBOARD, icon: '🏠' },
    { label: 'Text/Chat', view: AppView.TEXT, icon: '💬' },
    { label: 'Image', view: AppView.IMAGE, icon: '🎨' },
    { label: 'Video', view: AppView.VIDEO, icon: '🎬' },
    { label: 'Speech', view: AppView.AUDIO, icon: '🎙️' },
    { label: 'Live', view: AppView.LIVE, icon: '✨' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/10 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Omni-Gen AI
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Gemini Suite</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                currentView === item.view
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            API Ready
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-transparent">
        {/* Mobile Nav Header */}
        <header className="md:hidden flex items-center justify-between p-4 glass border-b border-white/10 sticky top-0 z-50">
           <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Omni-Gen
          </h1>
          <select 
            value={currentView}
            onChange={(e) => setView(e.target.value as AppView)}
            className="bg-slate-800 text-white rounded-md px-3 py-1 text-sm border border-white/10"
          >
            {navItems.map(item => (
              <option key={item.view} value={item.view}>{item.label}</option>
            ))}
          </select>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
};
