import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { profilesApi } from '@/api/profiles';
import { walletApi } from '@/api/wallet';
import { gamificationApi } from '@/api/gamification';
import type { Profile, Wallet, UserLevel } from '@/types';
import { Coins, Video, Mic, Radio, Phone, Sparkles, MessageCircle, Trophy, ChevronRight } from 'lucide-react';
import { notify, notifyTimeSlotOncePerDay } from '@/lib/utils';
import StoriesSection from '@/components/StoriesSection';
import { useCall } from '@/context/CallContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { startCall } = useCall();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUsers] = useState<string[]>(['101','102','103','104','105']);
  const [previousUsers] = useState<string[]>(JSON.parse(localStorage.getItem('previous_connections_ids') || '[]'));
  const [following] = useState<string[]>(JSON.parse(localStorage.getItem('following_ids') || '[]'));
  const femalePref = localStorage.getItem('female_call_pref') || 'both';

  // Redirect to gender page if gender not selected
  useEffect(() => {
    if (user && user.gender === null) {
      navigate('/gender', { replace: true });
    }
  }, [user, navigate]);

  // Load all data safely
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profileData, walletData, levelData] = await Promise.all([
          profilesApi.getProfile().catch((err) => {
            console.error('Profile load error:', err);
            notify('error', 'PROFILE_LOAD_ERROR');
            return null;
          }),
          walletApi.getWallet().catch((err) => {
            console.error('Wallet load error:', err);
            notify('error', 'WALLET_LOAD_ERROR');
            return null;
          }),
          gamificationApi.getLevel().catch((err) => {
            console.error('Level load error:', err);
            notify('error', 'LEVEL_LOAD_ERROR');
            return null;
          }),
        ]);

        setProfile(profileData);
        setWallet(walletData);
        setLevel(levelData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Time-based Tanglish notifications
  useEffect(() => {
    notifyTimeSlotOncePerDay();
  }, []);

  // League Calculation
  const getLeagueInfo = (xp: number) => {
    if (xp >= 50000) return { tier: 'Master', color: 'text-purple-500', bg: 'bg-purple-500', min: 50000, next: 100000 };
    if (xp >= 25000) return { tier: 'Diamond', color: 'text-blue-400', bg: 'bg-blue-400', min: 25000, next: 50000 };
    if (xp >= 10000) return { tier: 'Platinum', color: 'text-cyan-400', bg: 'bg-cyan-400', min: 10000, next: 25000 };
    if (xp >= 5000) return { tier: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-400', min: 5000, next: 10000 };
    if (xp >= 1000) return { tier: 'Silver', color: 'text-gray-400', bg: 'bg-gray-400', min: 1000, next: 5000 };
    return { tier: 'Bronze', color: 'text-orange-600', bg: 'bg-orange-600', min: 0, next: 1000 };
  };

  const currentXP = level?.xp || 1500; // Mock 1500 if null for demo
  const league = getLeagueInfo(currentXP);
  const leagueProgress = Math.min(((currentXP - league.min) / (league.next - league.min)) * 100, 100);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pb-20 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="bg-white p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hi, {profile?.display_name || 'User'}
              </h1>
              <p className="text-sm text-gray-500">Let's connect!</p>
            </div>
            <div className="bg-yellow-100 px-3 py-1 rounded-full flex items-center border border-yellow-200">
              <Coins className="w-4 h-4 text-yellow-600 mr-1" />
              <span className="font-bold text-yellow-700">{wallet?.coin_balance ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">New Users</h3>
              <button className="text-primary text-xs" onClick={() => navigate('/discover')}>See All</button>
            </div>
            <div className="flex overflow-x-auto gap-3 pb-2">
              {newUsers.map(id => (
                <div key={id} className="min-w-[120px] bg-white rounded-xl p-3 shadow-sm">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} />
                    <AvatarFallback>{id}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-semibold mt-2">User #{id}</p>
                  <div className="flex gap-2 mt-2">
                    {(user?.gender === 'F' && femalePref !== 'audio') || user?.gender !== 'F' ? (
                      <button onClick={() => startCall('video')} className="px-2 py-1 text-xs bg-pink-500 text-white rounded-lg">Video</button>
                    ) : null}
                    {(user?.gender === 'F' && femalePref !== 'video') || user?.gender !== 'F' ? (
                      <button onClick={() => startCall('voice')} className="px-2 py-1 text-xs bg-blue-500 text-white rounded-lg">Audio</button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">Previous Connections</h3>
            </div>
            <div className="flex overflow-x-auto gap-3 pb-2">
              {previousUsers.length ? previousUsers.map(id => (
                <button key={id} onClick={() => navigate(`/chat/${id}`)} className="min-w-[120px] bg-white rounded-xl p-3 shadow-sm">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} />
                    <AvatarFallback>{id}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-semibold mt-2">User #{id}</p>
                </button>
              )) : <p className="text-xs text-gray-500">No previous connections</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">Following Active</h3>
            </div>
            <div className="flex overflow-x-auto gap-3 pb-2">
              {following.length ? following.map(id => (
                <div key={id} className="min-w-[140px] bg-white rounded-xl p-3 shadow-sm">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} />
                    <AvatarFallback>{id}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-semibold mt-2">User #{id}</p>
                  <div className="flex gap-2 mt-2">
                    {(user?.gender === 'F' && femalePref !== 'audio') || user?.gender !== 'F' ? (
                      <button onClick={() => startCall('video')} className="px-2 py-1 text-xs bg-pink-500 text-white rounded-lg">Video</button>
                    ) : null}
                    {(user?.gender === 'F' && femalePref !== 'video') || user?.gender !== 'F' ? (
                      <button onClick={() => startCall('voice')} className="px-2 py-1 text-xs bg-blue-500 text-white rounded-lg">Audio</button>
                    ) : null}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => navigate('/games')} className="px-2 py-1 text-xs bg-gray-100 rounded-lg">Ludo</button>
                    <button onClick={() => navigate('/games')} className="px-2 py-1 text-xs bg-gray-100 rounded-lg">Carrom</button>
                  </div>
                </div>
              )) : <p className="text-xs text-gray-500">No following users</p>}
            </div>
          </div>
        </div>

        {/* Stories Section */}
        <div className="bg-white mb-4 shadow-sm">
          <StoriesSection />
        </div>

        {/* League Widget */}
        <div 
          onClick={() => navigate('/leaderboard')}
          className="mx-4 mb-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
               <div className="flex items-center gap-2 mb-2">
                 <Trophy className={`w-5 h-5 ${league.color}`} />
                 <span className={`font-bold text-lg ${league.color}`}>{league.tier} League</span>
               </div>
               <div className="w-full bg-gray-700 h-2 rounded-full mb-1 overflow-hidden">
                 <div className={`h-full ${league.bg}`} style={{ width: `${leagueProgress}%` }}></div>
               </div>
               <p className="text-xs text-gray-400">{currentXP} / {league.next} XP to Next Rank</p>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-500 ml-2" />
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="px-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Start Connecting</h3>
          <div className="grid grid-cols-2 gap-4">
            
            {/* Voice Call Card */}
            <button 
              onClick={() => startCall('voice')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4 shadow-lg active:scale-95 transition-transform flex flex-col items-center justify-center h-32"
            >
              <div className="bg-white/20 p-3 rounded-full mb-2">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <span className="font-bold text-lg">Voice Call</span>
              <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full mt-1">
                10 coins/min
              </span>
            </button>

            {/* Video Call Card */}
            <button 
              onClick={() => startCall('video')}
              className="bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-2xl p-4 shadow-lg active:scale-95 transition-transform flex flex-col items-center justify-center h-32"
            >
              <div className="bg-white/20 p-3 rounded-full mb-2">
                <Video className="w-8 h-8 text-white" />
              </div>
              <span className="font-bold text-lg">Video Call</span>
              <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full mt-1">
                30 coins/min
              </span>
            </button>

            {/* Live Stream Card (Full Width) */}
            <button 
              onClick={() => startCall('live')}
              className="col-span-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-4 shadow-lg active:scale-95 transition-transform flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <Radio className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-xl">Watch Live</span>
                  <span className="text-sm opacity-90">Join popular streams now</span>
                </div>
              </div>
              <span className="text-xs bg-black/20 px-3 py-1 rounded-full whitespace-nowrap">
                60 coins/min
              </span>
            </button>
          </div>
        </div>

        {/* Trending / Discover Teaser */}
        <div className="px-4">
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-lg font-bold text-gray-800">Trending Now</h3>
             <button onClick={() => navigate('/discover')} className="text-primary text-sm font-semibold">See All</button>
          </div>
          
          <div className="space-y-3">
             {[1, 2, 3].map((i) => (
               <div key={i} onClick={() => navigate(`/chat/${i}`)} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between active:scale-98 transition-transform cursor-pointer">
                 <div className="flex items-center gap-3">
                   <div className="relative">
                     <Avatar className="w-12 h-12">
                       <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                       <AvatarFallback>U{i}</AvatarFallback>
                     </Avatar>
                     <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-900">Ananya Sharma</h4>
                     <p className="text-xs text-gray-500 flex items-center gap-1">
                       <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Online
                     </p>
                   </div>
                 </div>
                 <button className="p-2 bg-primary/10 text-primary rounded-full">
                   <MessageCircle className="w-5 h-5" />
                 </button>
               </div>
             ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
