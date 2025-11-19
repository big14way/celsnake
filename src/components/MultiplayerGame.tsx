import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useMultiplayerStore } from '../stores/multiplayerStore';
import GameBoard from './GameBoard';
import { generateBoard, generatePath, BoardCell } from '../utils/gameLogic';
import { triggerHaptic } from '../utils/minipay';

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const MultiplayerGame: React.FC = () => {
  const { address } = useAccount();
  const {
    currentRoom,
    isPlaying,
    currentTurnPlayer,
    gameHistory,
    rollDice,
    eliminatePlayer,
    finishGame,
    leaveRoom,
  } = useMultiplayerStore();

  const [board, setBoard] = useState<BoardCell[][] | null>(null);
  const [path, setPath] = useState<{x:number, y:number}[] | null>(null);
  const [rolling, setRolling] = useState(false);
  const [dice1, setDice1] = useState<number | null>(null);
  const [dice2, setDice2] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  // Initialize board when game starts
  useEffect(() => {
    if (currentRoom && isPlaying && !board) {
      const gameBoard = generateBoard(currentRoom.difficulty);
      const gamePath = generatePath();
      setBoard(gameBoard);
      setPath(gamePath);
    }
  }, [currentRoom, isPlaying, board]);

  // Animate moves from game history
  useEffect(() => {
    if (!gameHistory.length || !path || !board) return;

    const latestMove = gameHistory[gameHistory.length - 1];

    // Update dice display with actual values from the move
    setDice1(latestMove.dice1);
    setDice2(latestMove.dice2);

    animateMove(latestMove.player, latestMove.dice1, latestMove.dice2);
  }, [gameHistory]);

  const animateMove = async (playerAddr: string, d1: number, d2: number) => {
    if (!currentRoom || !path || !board) return;

    const player = currentRoom.players.find(p => p.address === playerAddr);
    if (!player) return;

    const move = d1 + d2;

    // Animate movement
    for (let i = 1; i <= move; i++) {
      await new Promise(res => setTimeout(res, 400));
      // Position updates are handled by store
    }

    // Check landing cell
    const finalPos = player.position;
    if (finalPos < path.length) {
      const {x, y} = path[finalPos];
      const cell = board[y][x];

      if (cell.type === 'snake') {
        if (playerAddr === address) {
          setMessage('You landed on a snake! Game Over.');
          eliminatePlayer();
        }
      } else if (cell.type === 'mult') {
        setMessage(`${player.nickname} collected ${cell.value} multiplier!`);
      }
    }

    // Check if player finished (5 rolls or end of path)
    if (step >= 4 || finalPos >= path.length - 1) {
      if (playerAddr === address) {
        const currentPlayer = currentRoom.players.find(p => p.address === address);
        if (currentPlayer) {
          finishGame(currentPlayer.score);
        }
      }
    }
  };

  const handleRoll = async () => {
    if (!currentRoom || rolling || currentTurnPlayer !== address || !isPlaying) return;

    setRolling(true);
    triggerHaptic('medium');

    // Animate dice rolling
    for (let i = 0; i < 10; i++) {
      setDice1(getRandomInt(1, 6));
      setDice2(getRandomInt(1, 6));
      await new Promise(res => setTimeout(res, 60));
    }

    // Execute commit-reveal dice roll (this now handles everything)
    try {
      await rollDice();
      setStep(s => s + 1);
    } catch (error) {
      console.error('Failed to roll dice:', error);
    }

    setRolling(false);
  };

  const getCurrentPlayer = () => {
    if (!currentRoom || !currentTurnPlayer) return null;
    return currentRoom.players.find(p => p.address === currentTurnPlayer);
  };

  const isMyTurn = currentTurnPlayer === address;
  const currentPlayer = getCurrentPlayer();

  if (!currentRoom || !isPlaying) {
    return (
      <div className="min-h-screen bg-[#1a232b] flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a232b] flex flex-col items-center p-8">
      {/* Game Header */}
      <div className="w-full max-w-6xl mb-8">
        <div className="bg-[#232e38] rounded-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Multiplayer Game</h2>
              <div className="text-gray-300">
                {currentPlayer ? `${currentPlayer.nickname}'s Turn` : 'Waiting...'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-300 text-sm">Room: {currentRoom.id.slice(0, 8)}...</div>
              <div className="text-gray-300 text-sm">Roll {step + 1} / 5</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex gap-8 w-full max-w-6xl">
        {/* Players Panel */}
        <div className="w-64 space-y-4">
          <div className="bg-[#232e38] rounded-xl p-4">
            <h3 className="text-white font-bold mb-4">Players</h3>
            {currentRoom.players.map((player) => (
              <div
                key={player.address}
                className={`mb-3 p-3 rounded-lg ${
                  player.address === currentTurnPlayer 
                    ? 'bg-blue-500' 
                    : player.eliminated 
                      ? 'bg-red-900' 
                      : player.finishedAt
                        ? 'bg-green-900'
                        : 'bg-[#1a232b]'
                }`}
              >
                <div className="text-white font-bold">{player.nickname}</div>
                <div className="text-gray-300 text-xs">
                  Pos: {player.position}
                </div>
                {player.eliminated && (
                  <div className="text-red-300 text-xs mt-1">Eliminated</div>
                )}
                {player.finishedAt && !player.eliminated && (
                  <div className="text-green-300 text-xs mt-1">Finished!</div>
                )}
                {player.address === currentTurnPlayer && !player.eliminated && !player.finishedAt && (
                  <div className="text-yellow-300 text-xs mt-1">Playing...</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Game Board */}
        <div className="flex-1 flex flex-col items-center">
          {board && path && (
            <GameBoard
              step={step}
              board={board}
              path={path}
              position={currentRoom.players.find(p => p.address === address)?.position || 0}
              lost={currentRoom.players.find(p => p.address === address)?.eliminated || false}
              dice1={dice1}
              dice2={dice2}
            />
          )}

          {message && (
            <div className="mt-4 text-lg font-bold text-yellow-300">
              {message}
            </div>
          )}

          {isMyTurn && !currentRoom.players.find(p => p.address === address)?.eliminated && (
            <div className="mt-6">
              <button
                onClick={handleRoll}
                disabled={rolling || step >= 5}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg text-xl"
              >
                {rolling ? 'Rolling...' : 'Roll Dice 🎲'}
              </button>
            </div>
          )}

          {!isMyTurn && (
            <div className="mt-6 text-gray-400">
              Waiting for {currentPlayer?.nickname || 'other player'}...
            </div>
          )}
        </div>
      </div>

      {/* Game History */}
      <div className="w-full max-w-6xl mt-8">
        <div className="bg-[#232e38] rounded-xl p-6">
          <h3 className="text-white font-bold mb-4">Move History</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {gameHistory.slice().reverse().map((move, idx) => {
              const player = currentRoom.players.find(p => p.address === move.player);
              return (
                <div key={idx} className="text-gray-300 text-sm">
                  {player?.nickname || 'Player'} rolled {move.dice1} + {move.dice2} = {move.dice1 + move.dice2}
                </div>
              );
            })}
            {gameHistory.length === 0 && (
              <div className="text-gray-500 text-center py-4">
                No moves yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Button */}
      <button
        onClick={leaveRoom}
        className="mt-8 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg"
      >
        Leave Game
      </button>
    </div>
  );
};

export default MultiplayerGame;
