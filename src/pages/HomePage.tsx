import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { profilesApi } from '@/api/profiles';
import { walletApi } from '@/api/wallet';
import { gamificationApi } from '@/api/gamification';
import type { Profile, Wallet, UserLevel } from '@/types';
import { Coins, TrendingUp, Search, Wallet as WalletIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [level, setLevel] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);

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
            toast.error('Failed to load profile');
            return null;
          }),
          walletApi.getWallet().catch((err) => {
            console.error('Wallet load error:', err);
            toast.error('Failed to load wallet');
            return null;
          }),
          gamificationApi.getLevel().catch((err) => {
            console.error('Level load error:', err);
            toast.error('Failed to load level');
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.display_name || user?.phone_number || 'User'}!
          </h1>
          <p className="text-gray-600">Ready to connect with someone new?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card bg-gradient-primary text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Coins</p>
                <p className="text-2xl font-bold">{wallet?.coin_balance ?? 0}</p>
              </div>
              <Coins className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="card bg-gradient-secondary text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Level</p>
                <p className="text-2xl font-bold">{level?.level ?? 1}</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/discover')}
              className="p-4 rounded-xl bg-gradient-primary text-white text-center hover:shadow-lg transition-shadow"
            >
              <Search className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">Discover</p>
            </button>

            <button
              onClick={() => navigate('/wallet')}
              className="p-4 rounded-xl bg-gradient-secondary text-white text-center hover:shadow-lg transition-shadow"
            >
              <WalletIcon className="w-6 h-6 mx-auto mb-2" />
              <p className="font-semibold">Wallet</p>
            </button>
          </div>
        </div>

        {/* Profile Preview */}
        {profile && (
          <div className="card">
            <div className="flex items-center gap-4">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.display_name ?? 'Profile'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                  {profile.display_name?.charAt(0).toUpperCase() ?? ''}
                </div>
              )}

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {profile.display_name ?? user?.phone_number ?? 'User'}
                </h3>
                <p className="text-sm text-gray-600">
                  {profile.bio || 'No bio yet'}
                </p>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="text-primary-600 font-semibold"
              >
                Edit
              </button>
            </div>
          </div>
        )}

        {/* Level Progress */}
        {level && (
          <div className="card mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">XP Progress</h3>
              <span className="text-sm text-gray-600">{level.xp ?? 0} XP</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-primary h-3 rounded-full transition-all"
                style={{ width: `${((level.xp ?? 0) % 1000) / 10}%` }}
              />
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
