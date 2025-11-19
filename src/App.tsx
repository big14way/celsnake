import React, { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { Toaster } from 'react-hot-toast';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './wagmi.config';
import GameContainer from './components/GameContainer';
import MultiplayerContainer from './components/MultiplayerContainer';
import PlayerProfile from './components/PlayerProfile';
import AchievementBrowser from './components/AchievementBrowser';

const queryClient = new QueryClient();

const App = () => {
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [showProfile, setShowProfile] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {/* Toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                borderRadius: '0.5rem',
                padding: '1rem',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          {/* Top Navigation */}
          <div className="fixed top-20 right-4 z-40 flex gap-2 flex-wrap justify-end">
            <button
              onClick={() => setMode('single')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                mode === 'single'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Single Player
            </button>
            <button
              onClick={() => setMode('multi')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                mode === 'multi'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Multiplayer 🎮
            </button>
            <button
              onClick={() => setShowAchievements(true)}
              className="px-4 py-2 rounded-lg font-bold bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
            >
              🏆 Achievements
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="px-4 py-2 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              👤 Profile
            </button>
          </div>

          {/* Render appropriate mode */}
          {mode === 'single' ? <GameContainer /> : <MultiplayerContainer />}

          {/* Achievement Modals */}
          {showProfile && <PlayerProfile onClose={() => setShowProfile(false)} />}
          {showAchievements && <AchievementBrowser onClose={() => setShowAchievements(false)} />}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
