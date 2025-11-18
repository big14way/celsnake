import React, { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from './wagmi.config';
import GameContainer from './components/GameContainer';
import MultiplayerContainer from './components/MultiplayerContainer';

const queryClient = new QueryClient();

const App = () => {
  const [mode, setMode] = useState<'single' | 'multi'>('single');

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {/* Mode Toggle */}
          <div className="fixed top-4 right-4 z-50 flex gap-2">
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
          </div>

          {/* Render appropriate mode */}
          {mode === 'single' ? <GameContainer /> : <MultiplayerContainer />}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
