import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useMultiplayerStore } from '../stores/multiplayerStore';
import type { Difficulty } from '../types/multiplayer';

interface MultiplayerLobbyProps {
  onStartGame: () => void;
}

const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({ onStartGame }) => {
  const { address } = useAccount();
  const { 
    connected, 
    rooms, 
    currentRoom,
    connect,
    createRoom, 
    joinRoom, 
    leaveRoom,
    fetchRooms,
  } = useMultiplayerStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    difficulty: 'easy' as Difficulty,
    betAmount: '0.1',
    maxPlayers: 2,
    nickname: '',
  });

  useEffect(() => {
    if (!connected) {
      connect();
    }

    return () => {
      if (currentRoom) {
        leaveRoom();
      }
    };
  }, []);

  useEffect(() => {
    if (connected) {
      const interval = setInterval(() => {
        fetchRooms();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [connected, fetchRooms]);

  useEffect(() => {
    if (currentRoom && currentRoom.status === 'playing') {
      onStartGame();
    }
  }, [currentRoom, onStartGame]);

  const handleCreateRoom = () => {
    if (!address || !createForm.nickname) {
      alert('Please connect wallet and enter nickname');
      return;
    }

    createRoom({
      host: address,
      nickname: createForm.nickname,
      difficulty: createForm.difficulty,
      betAmount: createForm.betAmount,
      maxPlayers: createForm.maxPlayers,
    });

    setShowCreateModal(false);
  };

  const handleJoinRoom = (roomId: string) => {
    if (!address) {
      alert('Please connect wallet');
      return;
    }

    const nickname = prompt('Enter your nickname:');
    if (!nickname) return;

    joinRoom(roomId, address, nickname);
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#1a232b] flex items-center justify-center">
        <div className="text-white text-xl">Connecting to multiplayer server...</div>
      </div>
    );
  }

  if (currentRoom) {
    return (
      <div className="min-h-screen bg-[#1a232b] flex flex-col items-center justify-center p-8">
        <div className="bg-[#232e38] rounded-xl p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-white mb-6">Waiting Room</h2>
          
          <div className="mb-6">
            <div className="text-gray-300 mb-2">Room ID: {currentRoom.id.slice(0, 8)}...</div>
            <div className="text-gray-300 mb-2">Difficulty: {currentRoom.difficulty}</div>
            <div className="text-gray-300 mb-2">Bet Amount: {currentRoom.betAmount} CELO</div>
            <div className="text-gray-300 mb-4">
              Players: {currentRoom.players.length} / {currentRoom.maxPlayers}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Players:</h3>
            <div className="space-y-2">
              {currentRoom.players.map((player) => (
                <div 
                  key={player.address}
                  className="bg-[#1a232b] rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-bold">{player.nickname}</div>
                    <div className="text-gray-400 text-sm">
                      {player.address.slice(0, 6)}...{player.address.slice(-4)}
                    </div>
                  </div>
                  {player.address === currentRoom.host && (
                    <div className="bg-yellow-500 text-black px-3 py-1 rounded text-sm font-bold">
                      Host
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-gray-400 mb-6">
            {currentRoom.players.length < currentRoom.maxPlayers 
              ? `Waiting for ${currentRoom.maxPlayers - currentRoom.players.length} more player(s)...`
              : 'Game starting soon...'}
          </div>

          <button
            onClick={leaveRoom}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            Leave Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a232b] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Multiplayer Lobby</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg"
          >
            Create Room
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12">
              No active rooms. Create one to start playing!
            </div>
          ) : (
            rooms.map(room => (
              <div 
                key={room.id}
                className="bg-[#232e38] rounded-xl p-6 hover:bg-[#2a3544] transition-colors"
              >
                <div className="mb-4">
                  <div className="text-white font-bold text-xl mb-2">
                    {room.difficulty.charAt(0).toUpperCase() + room.difficulty.slice(1)} Game
                  </div>
                  <div className="text-gray-300 text-sm">
                    Bet: {room.betAmount} CELO
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-gray-400 text-sm mb-2">
                    Players: {room.players.length} / {room.maxPlayers}
                  </div>
                  <div className="flex gap-2">
                    {Array.from({ length: room.maxPlayers }).map((_, idx) => (
                      <div 
                        key={idx}
                        className={`w-8 h-8 rounded-full ${
                          idx < room.players.length 
                            ? 'bg-green-500' 
                            : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={room.players.length >= room.maxPlayers}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg"
                >
                  {room.players.length >= room.maxPlayers ? 'Full' : 'Join Room'}
                </button>
              </div>
            ))
          )}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-[#232e38] rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-white mb-6">Create Room</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Nickname</label>
                  <input
                    type="text"
                    value={createForm.nickname}
                    onChange={e => setCreateForm({ ...createForm, nickname: e.target.value })}
                    className="w-full bg-[#1a232b] text-white rounded-lg px-4 py-2"
                    placeholder="Enter your nickname"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Difficulty</label>
                  <select
                    value={createForm.difficulty}
                    onChange={e => setCreateForm({ ...createForm, difficulty: e.target.value as Difficulty })}
                    className="w-full bg-[#1a232b] text-white rounded-lg px-4 py-2"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                    <option value="master">Master</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Bet Amount (CELO)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={createForm.betAmount}
                    onChange={e => setCreateForm({ ...createForm, betAmount: e.target.value })}
                    className="w-full bg-[#1a232b] text-white rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Max Players</label>
                  <select
                    value={createForm.maxPlayers}
                    onChange={e => setCreateForm({ ...createForm, maxPlayers: parseInt(e.target.value) })}
                    className="w-full bg-[#1a232b] text-white rounded-lg px-4 py-2"
                  >
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRoom}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerLobby;
