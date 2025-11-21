import React, { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { Toaster } from 'react-hot-toast';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './wagmi.config';
import GameContainer from './components/GameContainer';
import MultiplayerContainer from './components/MultiplayerContainer';
import TournamentContainer from './components/TournamentContainer';
import PlayerProfile from './components/PlayerProfile';
import AchievementBrowser from './components/AchievementBrowser';

const queryClient = new QueryClient();

const App = () => {
  const [mode, setMode] = useState<'single' | 'multi' | 'tournament'>('single');
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

          {/* Render game content first */}
          {mode === 'single' && <GameContainer />}
          {mode === 'multi' && <MultiplayerContainer />}
          {mode === 'tournament' && <TournamentContainer />}

          {/* Bottom Navigation - Mobile Responsive (moved to bottom) */}
          <div className="fixed bottom-4 left-0 right-0 z-30 px-2 sm:px-4">
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-center max-w-screen-xl mx-auto bg-gray-900/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-700">
              <button
                onClick={() => setMode('single')}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg font-bold transition-colors text-xs sm:text-sm ${
                  mode === 'single'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="hidden sm:inline">Single</span>
                <span className="sm:hidden">🎯</span>
              </button>
              <button
                onClick={() => setMode('multi')}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg font-bold transition-colors text-xs sm:text-sm ${
                  mode === 'multi'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="hidden sm:inline">Multi</span>
                <span className="sm:hidden">🎮</span>
              </button>
              <button
                onClick={() => setMode('tournament')}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg font-bold transition-colors text-xs sm:text-sm ${
                  mode === 'tournament'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="hidden sm:inline">Tournament</span>
                <span className="sm:hidden">🏆</span>
              </button>
              <button
                onClick={() => setShowAchievements(true)}
                className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg font-bold bg-yellow-600 text-white hover:bg-yellow-700 transition-colors text-xs sm:text-sm"
              >
                🎖️<span className="hidden md:inline ml-1">Achievements</span>
              </button>
              <button
                onClick={() => setShowProfile(true)}
                className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 transition-colors text-xs sm:text-sm"
              >
                👤<span className="hidden md:inline ml-1">Profile</span>
              </button>
            </div>
          </div>

          {/* Achievement Modals */}
          {showProfile && <PlayerProfile onClose={() => setShowProfile(false)} />}
          {showAchievements && <AchievementBrowser onClose={() => setShowAchievements(false)} />}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
