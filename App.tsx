
import React, { useState } from 'react';
import { AppView } from './types';
import Dashboard from './components/Dashboard';
import TextGenerator from './components/TextGenerator';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import AudioGenerator from './components/AudioGenerator';
import LiveGenerator from './components/LiveGenerator';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case AppView.TEXT:
        return <TextGenerator />;
      case AppView.IMAGE:
        return <ImageGenerator />;
      case AppView.VIDEO:
        return <VideoGenerator />;
      case AppView.AUDIO:
        return <AudioGenerator />;
      case AppView.LIVE:
        return <LiveGenerator />;
      case AppView.DASHBOARD:
      default:
        return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
