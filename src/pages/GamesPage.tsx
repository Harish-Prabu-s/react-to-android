import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Play, Star, Users, Gamepad2, ArrowLeft, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

interface Game {
  id: string;
  title: string;
  description: string;
  players: string;
  rating: number;
  imageColor: string;
  isPopular?: boolean;
}

const GAMES: Game[] = [
  { 
    id: 'ludo', 
    title: 'Ludo Classic', 
    description: 'Play the classic board game with friends', 
    players: '10k+ Playing', 
    rating: 4.8, 
    imageColor: 'bg-red-500',
    isPopular: true 
  },
  { 
    id: 'carrom', 
    title: 'Carrom Pro', 
    description: 'Strike and pocket the coins', 
    players: '5k+ Playing', 
    rating: 4.6, 
    imageColor: 'bg-yellow-500' 
  },
  { 
    id: 'fruit', 
    title: 'Fruit Slash', 
    description: 'Slice fruits, avoid bombs!', 
    players: '8k+ Playing', 
    rating: 4.7, 
    imageColor: 'bg-green-500',
    isPopular: true 
  },
  { 
    id: 'candy', 
    title: 'Sweet Match', 
    description: 'Match 3 candies to win', 
    players: '12k+ Playing', 
    rating: 4.9, 
    imageColor: 'bg-pink-500' 
  },
];

export default function GamesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isBetMode, setIsBetMode] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const secondsRef = useRef(0);

  useEffect(() => {
    if (activeGame) {
      // Game Loop
      secondsRef.current = 0;
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        // Award 1 coin every minute (60 seconds)
        if (secondsRef.current % 60 === 0 && !isBetMode) {
           // Normal Mode: 1 coin/min
           toast.success("You earned 1 coin for playing!", { icon: '🪙' });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeGame, isBetMode]);

  const handlePlayGame = (game: Game) => {
    if (isBetMode) {
      // Bet Mode Logic
      const isFemale = user?.gender === 'F';
      
      if (!isFemale) {
         // Male: Check balance (mock) and deduct 10 coins
         // In real app: if (balance < 10) return toast.error("Insufficient coins");
         if (!window.confirm("Start Bet Match? Entry fee: 10 coins.")) return;
         toast.info("Searching for opponent...", { duration: 2000 });
      } else {
         // Female: Free
         toast.info("Searching for opponent (Free entry)...", { duration: 2000 });
      }

      setIsSearching(true);
      
      // Simulate Matchmaking (2 seconds)
      setTimeout(() => {
        setIsSearching(false);
        setActiveGame(game);
        toast.success("Opponent Found! Game Starting...");
      }, 2000);

    } else {
      // Normal Mode
      setActiveGame(game);
      toast.success(`Starting ${game.title}...`);
    }
  };

  const handleGameOver = (winner: 'me' | 'opponent') => {
    if (isBetMode) {
       if (winner === 'me') {
         toast.success("You Won! +30 Coins added to wallet.", { icon: '🏆', duration: 4000 });
         // In real app: walletApi.addCoins(30);
       } else {
         toast.error("You Lost. Better luck next time!", { icon: '💔' });
       }
    }
    setActiveGame(null);
  };

  if (activeGame) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="p-4 flex items-center justify-between bg-gray-900 text-white">
          <button 
            onClick={() => setActiveGame(null)}
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-bold">{activeGame.title}</span>
          <div className="w-10" /> {/* Spacer */}
        </div>
        {/* Timer Display */}
        <div className="text-white text-sm mb-4">
          Time Elapsed: {Math.floor(secondsRef.current / 60)}:{secondsRef.current % 60 < 10 ? '0' : ''}{secondsRef.current % 60}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 text-white p-8 text-center">
          <div className={`w-32 h-32 ${activeGame.imageColor} rounded-3xl mb-6 shadow-2xl animate-bounce flex items-center justify-center`}>
            <Gamepad2 className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Loading {activeGame.title}...</h2>
          <p className="text-gray-400 mb-8">Get ready to play!</p>
          
          <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[loading_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
          </div>
          
          <style>{`
            @keyframes loading {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>

          {isBetMode && (
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => handleGameOver('me')}
                className="px-6 py-3 bg-green-600 rounded-xl font-bold hover:bg-green-500"
              >
                Simulate Win (+30)
              </button>
              <button
                onClick={() => handleGameOver('opponent')}
                className="px-6 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-500"
              >
                Simulate Loss
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Finding Opponent...</h2>
        <p className="text-gray-400">Looking for {user?.gender === 'F' ? 'Male' : 'Female'} player...</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gray-900 text-white p-6 pb-12 rounded-b-3xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Game Zone</h1>
            <p className="text-gray-400 mb-6">Play, Compete, and Earn Coins!</p>

            {/* Mode Toggle */}
            <div className="flex bg-gray-800 p-1 rounded-xl mb-6">
              <button
                onClick={() => setIsBetMode(false)}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${!isBetMode ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Fun Play
              </button>
              <button
                onClick={() => setIsBetMode(true)}
                className={`flex-1 py-2 rounded-lg font-bold transition-all ${isBetMode ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Bet Match 💰
              </button>
            </div>

            {isBetMode && (
              <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl mb-6 text-sm">
                <p className="font-bold text-red-200 mb-1">🔥 Bet Match Rules:</p>
                <ul className="list-disc pl-4 text-red-100/80 space-y-1">
                  <li>Entry Fee: 10 Coins (Free for Women)</li>
                  <li>Opponent: Opposite Gender Only</li>
                  <li>Winner Reward: 30 Coins! 🏆</li>
                </ul>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 shadow-lg mb-8 flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">Daily Tournament</p>
                <p className="text-sm opacity-80">Win up to 5000 coins!</p>
              </div>
              <Trophy className="w-10 h-10 text-yellow-300" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        </div>

        <div className="p-4 space-y-6">

          {/* Games Grid */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Popular Games
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {GAMES.map((game) => (
                <div 
                  key={game.id}
                  onClick={() => handlePlayGame(game)}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform"
                >
                  <div className={`h-24 ${game.imageColor} flex items-center justify-center`}>
                    <Gamepad2 className="w-10 h-10 text-white/80" />
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-gray-900">{game.title}</h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Users className="w-3 h-3" />
                      {game.players}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1 font-medium">
                      <Star className="w-3 h-3 fill-yellow-500" />
                      {game.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
