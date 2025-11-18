import React, { useState } from 'react';
import MultiplayerLobby from './MultiplayerLobby';
import MultiplayerGame from './MultiplayerGame';
import { useMultiplayerStore } from '../stores/multiplayerStore';

const MultiplayerContainer: React.FC = () => {
  const { isPlaying } = useMultiplayerStore();
  const [gameStarted, setGameStarted] = useState(false);

  if (isPlaying || gameStarted) {
    return <MultiplayerGame />;
  }

  return <MultiplayerLobby onStartGame={() => setGameStarted(true)} />;
};

export default MultiplayerContainer;
