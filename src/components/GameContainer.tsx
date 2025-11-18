import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import BetPanel from './BetPanel';
import GameBoard from './GameBoard';
import Leaderboard from './Leaderboard';
import { generateBoard, generatePath, BoardCell } from '../utils/gameLogic';
import { contractConfig, parseEther, formatEther, CELO_NETWORK_INFO } from '../utils/contract';
import { 
  isMiniPay, 
  parseDeeplinkParams, 
  triggerHaptic, 
  shareGame,
  requestPersistentStorage,
  formatAddressForMobile
} from '../utils/minipay';

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getStoredNickname = (address: string) => {
  if (!address) return '';
  return localStorage.getItem(`nickname_${address}`) || '';
};

const setStoredNickname = (address: string, nickname: string) => {
  if (!address) return;
  localStorage.setItem(`nickname_${address}`, nickname);
};

const clearActiveGame = () => {
  localStorage.removeItem('activeGame');
};

function HistoryPanel({ history, currentPage, setCurrentPage, totalPages }: {
  history: any[];
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}) {
  if (!history.length) return null;
  return (
    <div className="mt-8 w-full max-w-xl bg-[#232e38] rounded-xl p-4">
      <div className="text-white font-bold mb-2 text-lg">Game History</div>
      <div className="space-y-2">
        {history.slice().reverse().map((h, i) => (
          <div key={i} className="flex justify-between text-sm text-gray-200">
            <span>{h.date}</span>
            <span>{h.difficulty.charAt(0).toUpperCase() + h.difficulty.slice(1)}</span>
            <span>Bet: {h.bet}</span>
            <span>Mult: {h.mult}</span>
            <span>Profit: {h.profit}</span>
            <span className={h.result === 'win' ? 'text-green-400' : 'text-red-400'}>{h.result === 'win' ? 'Win' : 'Lose'}</span>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-4">
          <button
            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40"
            onClick={() => setCurrentPage((p: number) => Math.max(1, p-1))}
            disabled={currentPage === 1}
          >Prev</button>
          <span className="text-white">Page {currentPage} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-40"
            onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p+1))}
            disabled={currentPage === totalPages}
          >Next</button>
        </div>
      )}
    </div>
  );
}

const GameContainer = () => {
  const { address, isConnected, chain } = useAccount();
  const { data: balanceData } = useBalance({ address });
  
  // Check if running in MiniPay
  const miniPayActive = isMiniPay();
  
  const [nickname, setNickname] = useState('');
  const [bet, setBet] = useState('');
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'|'expert'|'master'>('easy');
  const [step, setStep] = useState(0);
  const [board, setBoard] = useState<BoardCell[][] | null>(null);
  const [path, setPath] = useState<{x:number, y:number}[] | null>(null);
  const [position, setPosition] = useState(0);
  const [profit, setProfit] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [lost, setLost] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [dice1, setDice1] = useState<number | null>(null);
  const [dice2, setDice2] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [cashoutPending, setCashoutPending] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [inputNickname, setInputNickname] = useState('');
  const [accumulatedMult, setAccumulatedMult] = useState(1);
  const [multHistory, setMultHistory] = useState<string[]>([]);
  const [gameHistory, setGameHistory] = useState(() => {
    const saved = localStorage.getItem('gameHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentPage, setCurrentPage] = useState(1);

  const GAMES_PER_PAGE = 10;
  const totalPages = Math.ceil(gameHistory.length / GAMES_PER_PAGE) || 1;
  const paginatedHistory = gameHistory.slice((currentPage-1)*GAMES_PER_PAGE, currentPage*GAMES_PER_PAGE);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const { data: contractBalance, refetch: refetchContractBalance } = useReadContract({
    ...contractConfig,
    functionName: 'getContractBalance',
  });

  const isWrongNetwork = isConnected && chain?.id !== CELO_NETWORK_INFO.chainId;

  // Handle deeplink parameters (MiniPay)
  useEffect(() => {
    const params = parseDeeplinkParams();
    
    if (params.bet) {
      setBet(params.bet);
    }
    
    if (params.difficulty) {
      setDifficulty(params.difficulty);
    }
    
    if (params.nickname) {
      setInputNickname(params.nickname);
      setNickname(params.nickname);
    }
  }, []);

  // Request persistent storage for MiniPay
  useEffect(() => {
    if (miniPayActive) {
      requestPersistentStorage();
    }
  }, [miniPayActive]);

  useEffect(() => {
    if (address) {
      const stored = getStoredNickname(address);
      setNickname(stored);
      setInputNickname(stored);
      setEditingNickname(!stored);
    }
  }, [address]);

  useEffect(() => {
    localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
  }, [gameHistory]);

  useEffect(() => {
    const saved = localStorage.getItem('activeGame');
    if (saved) {
      const state = JSON.parse(saved);
      setBoard(state.board);
      setPath(state.path);
      setPosition(state.position);
      setStep(state.step);
      setLost(state.lost);
      setDice1(state.dice1);
      setDice2(state.dice2);
      setDifficulty(state.difficulty);
      setBet(state.bet);
      setAccumulatedMult(state.accumulatedMult);
      setMultHistory(state.multHistory);
      setGameActive(state.gameActive);
    }
  }, []);

  useEffect(() => {
    if (gameActive) {
      localStorage.setItem('activeGame', JSON.stringify({
        board, path, position, step, lost, dice1, dice2, difficulty, bet, accumulatedMult, multHistory, gameActive
      }));
    } else {
      localStorage.removeItem('activeGame');
    }
  }, [board, path, position, step, lost, dice1, dice2, difficulty, bet, accumulatedMult, multHistory, gameActive]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetchContractBalance();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchContractBalance]);

  useEffect(() => {
    if (isConfirmed) {
      setTxStatus('Transaction confirmed!');
      setTimeout(() => setTxStatus(null), 3000);
    }
  }, [isConfirmed]);

  const handleSaveNickname = async () => {
    setNickname(inputNickname);
    if (address) {
      setStoredNickname(address, inputNickname);
    }
    setEditingNickname(false);
    
    if (inputNickname && isConnected) {
      try {
        writeContract({
          ...contractConfig,
          functionName: 'changeNickname',
          args: [inputNickname],
        });
        setTxStatus('Updating nickname on blockchain...');
      } catch (e: any) {
        setTxStatus('Error: ' + (e.message || 'Unknown'));
      }
    }
  };

  const handleBet = async ({ amount, difficulty: diff }: { amount: string; difficulty: 'easy'|'medium'|'hard'|'expert'|'master' }) => {
    if (!isConnected || !address) {
      setTxStatus('Please connect wallet');
      return;
    }

    if (isWrongNetwork) {
      setTxStatus(`Please switch to ${CELO_NETWORK_INFO.name}`);
      return;
    }

    setBet(amount);
    setDifficulty(diff);
    setTxStatus('Placing bet...');

    try {
      writeContract({
        ...contractConfig,
        functionName: 'placeBet',
        args: [nickname || 'Anonymous'],
        value: parseEther(amount),
      });

      const b = generateBoard(diff);
      const p = generatePath();
      setBoard(b);
      setPath(p);
      setPosition(0);
      setStep(0);
      setProfit(0);
      setAccumulatedMult(1);
      setMultHistory([]);
      setGameActive(true);
      setLost(false);
      setDice1(null);
      setDice2(null);
      setMessage(null);
    } catch (e: any) {
      setTxStatus('Error: ' + (e.message || 'Unknown'));
    }
  };

  const animateMove = async (from: number, move: number, pathArr: {x:number, y:number}[], boardArr: BoardCell[][]) => {
    let lose = false;
    let msg = '';
    let finalPos = from;
    
    for (let i = 1; i <= move; i++) {
      const pos = (from + i) % pathArr.length;
      setPosition(pos);
      finalPos = pos;
      await new Promise(res => setTimeout(res, 400));
    }
    
    const { x, y } = pathArr[finalPos];
    const cell = boardArr[y][x];
    let newMultHistory = [...multHistory];
    
    if (cell.type === 'mult') {
      newMultHistory.push(cell.value);
    }
    
    let newAccumulatedMult = 1;
    const multCounts: Record<string, number> = {};
    newMultHistory.forEach(val => {
      multCounts[val] = (multCounts[val] || 0) + 1;
    });
    
    let sumPrir = 0;
    let count2x = 0;
    Object.entries(multCounts).forEach(([val, count]) => {
      const mult = parseFloat(val.replace('x', ''));
      if (mult === 2) {
        count2x += count;
      } else {
        sumPrir += (mult - 1) * count;
      }
    });
    
    if (count2x > 0) {
      newAccumulatedMult = (1 + sumPrir) + Math.pow(2, count2x) - 1;
    } else {
      newAccumulatedMult = 1 + sumPrir;
    }
    
    let newProfit = 0;
    if (cell.type === 'snake') {
      try { new Audio('/sounds/Snake.mp3').play(); } catch {}
      lose = true;
      msg = 'You landed on a snake! Bet lost.';
      setLost(true);
      setGameActive(false);
      setProfit(0);
      setAccumulatedMult(1);
      setMultHistory([]);
      setMessage(msg);
      clearActiveGame();
      setGameHistory((h: any) => [...h, {
        date: new Date().toLocaleString(),
        bet,
        difficulty,
        mult: accumulatedMult.toFixed(2),
        profit: 0,
        result: 'lose',
      }]);
    } else {
      setAccumulatedMult(newAccumulatedMult);
      setMultHistory(newMultHistory);
      newProfit = Number(bet) * newAccumulatedMult;
      setProfit(newProfit);
      setMessage('');
    }
    
    return { lose, newProfit, msg };
  };

  const handleRoll = async () => {
    if (!gameActive || !path || !board || rolling) return;
    setRolling(true);
    
    // Haptic feedback for mobile/MiniPay
    if (miniPayActive) {
      triggerHaptic('medium');
    }
    
    try { new Audio('/sounds/Roll.mp3').play(); } catch {}
    
    let final1 = getRandomInt(1, 6);
    let final2 = getRandomInt(1, 6);
    
    for (let i = 0; i < 10; i++) {
      setDice1(getRandomInt(1, 6));
      setDice2(getRandomInt(1, 6));
      await new Promise(res => setTimeout(res, 60));
    }
    
    setDice1(final1);
    setDice2(final2);
    let move = final1 + final2;
    
    const { lose, newProfit, msg } = await animateMove(position, move, path, board);
    setStep(s => s + 1);
    setLost(lose);
    setGameActive(!lose && step + 1 < 5);
    const profitStr = newProfit.toFixed(4);
    setMessage(lose ? msg : (step + 1 >= 5 ? `Round finished! Profit: ${profitStr} ${CELO_NETWORK_INFO.nativeCurrency.symbol}` : `Rolled: ${final1} + ${final2} = ${move}`));
    setRolling(false);
  };

  const handleCashout = async () => {
    if (!isConnected || !address) return;
    
    setGameActive(false);
    setTxStatus('Cashing out...');
    setCashoutPending(true);
    
    // Haptic feedback for mobile/MiniPay
    if (miniPayActive) {
      triggerHaptic('heavy');
    }
    
    try {
      const roundedProfit = Number(profit).toFixed(3);
      
      writeContract({
        ...contractConfig,
        functionName: 'cashout',
        args: [parseEther(roundedProfit)],
      });
      
      try { new Audio('/sounds/Cashout.mp3').play(); } catch {}
      setMessage(`Cashed out: ${roundedProfit} ${CELO_NETWORK_INFO.nativeCurrency.symbol}`);
      clearActiveGame();
      
      setGameHistory((h: any) => [...h, {
        date: new Date().toLocaleString(),
        bet,
        difficulty,
        mult: accumulatedMult.toFixed(2),
        profit: roundedProfit,
        result: 'win',
      }]);
      
      refetchContractBalance();
    } catch (e: any) {
      if (e?.code === 4001) {
        setTxStatus(null);
        setGameActive(true);
        return;
      }
      setTxStatus('Error: ' + (e?.message || 'Unknown'));
    } finally {
      setCashoutPending(false);
    }
  };

  const handleShare = async () => {
    const appUrl = window.location.origin;
    const success = await shareGame(step, profit.toFixed(3), appUrl);
    
    if (success) {
      setTxStatus('Shared successfully!');
      setTimeout(() => setTxStatus(null), 2000);
    }
  };

  const difficultyLabels: Record<string, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Expert',
    master: 'Master',
  };

  return (
    <div className="min-h-screen bg-[#1a232b] flex flex-col items-center justify-center">
      {isWrongNetwork && isConnected && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>Switch to {CELO_NETWORK_INFO.name} (Chain ID: {CELO_NETWORK_INFO.chainId})</span>
          </div>
        </div>
      )}

      {miniPayActive && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg text-sm font-bold flex items-center gap-2">
            <span>📱</span>
            <span>MiniPay Mode</span>
          </div>
        </div>
      )}
      
      <div className={`w-full max-w-5xl ${miniPayActive ? 'p-4' : 'p-8'} flex flex-row items-start gap-12`}>
        <div className="flex flex-col items-center w-full max-w-xs">
          {!miniPayActive && (
            <div className="mb-4">
              <ConnectButton />
            </div>
          )}
          
          {editingNickname ? (
            <div className="mb-2 flex gap-2 items-center">
              <input
                className="px-3 py-2 rounded bg-[#1a232b] text-white"
                placeholder="Nickname"
                value={inputNickname}
                onChange={e => setInputNickname(e.target.value)}
                maxLength={20}
              />
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleSaveNickname}
                disabled={!inputNickname}
              >
                Save
              </button>
            </div>
          ) : (
            <div className="mb-2 flex gap-2 items-center">
              <span className="text-white font-bold">{nickname || 'No nickname'}</span>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-3 rounded"
                onClick={() => setEditingNickname(true)}
              >
                Change
              </button>
            </div>
          )}
          
          <BetPanel
            onBet={handleBet}
            isConnected={isConnected}
            balance={balanceData ? formatEther(balanceData.value) : '0'}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
          />
        </div>
        
        <div className="flex flex-col items-center flex-1">
          <div className="mb-2 text-sm text-blue-300 font-bold">
            Contract: {contractBalance ? Number(formatEther(contractBalance as bigint)).toFixed(3) : '—'} {CELO_NETWORK_INFO.nativeCurrency.symbol}
          </div>
          {address && (
            <div className="mb-2 text-xs text-gray-400">
              {miniPayActive ? formatAddressForMobile(address) : `${address.slice(0, 5)}...${address.slice(-5)}`}
            </div>
          )}
          <div className="mb-4 text-2xl font-bold text-yellow-300">
            Multiplier: {accumulatedMult.toFixed(2)}x
          </div>
          {message && (
            <div className={`mb-4 text-lg font-bold ${lost ? 'text-red-400' : 'text-green-300'}`}>
              {message.replace(/(\d+\.\d{3})\d*/g, '$1')}
            </div>
          )}
          
          {!gameActive ? (
            <div className="mb-12">
              <div className="mb-6 text-center text-white font-bold text-lg">
                Preview: {difficultyLabels[difficulty]}
              </div>
              <div className="flex flex-col items-center">
                <GameBoard
                  board={generateBoard(difficulty)}
                  step={0}
                  position={-1}
                  path={generatePath()}
                />
              </div>
            </div>
          ) : (
            <>
              <GameBoard
                step={step}
                board={board ?? undefined}
                path={path ?? undefined}
                position={position}
                lost={lost}
                dice1={dice1}
                dice2={dice2}
              />
              {gameActive && (
                <div className="flex gap-4 mt-6">
                  <button
                    className={`bg-blue-500 hover:bg-blue-600 active:scale-95 transition-transform text-white font-bold ${miniPayActive ? 'py-3 px-8 text-xl' : 'py-2 px-6 text-lg'} rounded disabled:opacity-50`}
                    onClick={handleRoll}
                    disabled={step >= 5 || lost || rolling || isPending}
                  >
                    {rolling ? 'Rolling...' : 'Roll 🎲'}
                  </button>
                  <button
                    className={`bg-green-500 hover:bg-green-600 active:scale-95 transition-transform text-white font-bold ${miniPayActive ? 'py-3 px-8 text-xl' : 'py-2 px-6 text-lg'} rounded disabled:opacity-50`}
                    onClick={handleCashout}
                    disabled={step === 0 || lost || rolling || cashoutPending || isPending}
                  >
                    {cashoutPending || isPending ? 'Processing...' : 'Cashout 💰'}
                  </button>
                </div>
              )}
              
              {!gameActive && profit > 0 && (
                <div className="mt-4">
                  <button
                    className={`bg-purple-500 hover:bg-purple-600 active:scale-95 transition-transform text-white font-bold ${miniPayActive ? 'py-3 px-8 text-lg' : 'py-2 px-6 text-base'} rounded`}
                    onClick={handleShare}
                  >
                    Share Win 🎉
                  </button>
                </div>
              )}
            </>
          )}
          
          {txStatus && <div className="mb-2 text-sm text-yellow-300">{txStatus}</div>}
          {isConfirming && <div className="mb-2 text-sm text-blue-300">Confirming...</div>}
        </div>
      </div>
      
      <div className="w-full flex flex-col items-center">
        <HistoryPanel 
          history={paginatedHistory} 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          totalPages={totalPages} 
        />
        <div className="mt-16 flex justify-center w-full">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
