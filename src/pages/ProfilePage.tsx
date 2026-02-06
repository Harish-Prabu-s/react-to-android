import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import { User, LogOut, Lock, ShieldCheck, Coins, History, Trophy, Globe2, Pencil, UserPlus, UserMinus, Gamepad2 } from 'lucide-react';
import { notify } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { CoinTransaction } from '@/types';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const params = useParams();
  const viewingUserId = params.userId;
  const isOwnProfile = !viewingUserId || String(user?.id) === viewingUserId;
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [bio, setBio] = useState(localStorage.getItem('bio') || '');
  const [interests, setInterests] = useState<string[]>(JSON.parse(localStorage.getItem('interests') || '[]'));
  const [followers, setFollowers] = useState<string[]>(JSON.parse(localStorage.getItem('followers_ids') || '[]'));
  const [following, setFollowing] = useState<string[]>(JSON.parse(localStorage.getItem('following_ids') || '[]'));
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const femalePref = localStorage.getItem('female_call_pref') || 'both';
  const [transactions] = useState<CoinTransaction[]>([
    { id: 't1', wallet: 1, type: 'credit', transaction_type: 'earned', amount: 100, description: 'Welcome Bonus', created_at: new Date().toISOString() },
    { id: 't2', wallet: 1, type: 'debit', transaction_type: 'spent', amount: 30, description: 'Video Call', created_at: new Date(Date.now() - 86400000).toISOString() },
  ] as unknown as CoinTransaction[]);

  useEffect(() => {
    const enabled = localStorage.getItem('app_lock_enabled') === 'true';
    setIsLockEnabled(enabled);
  }, []);

  const handleLockToggle = (checked: boolean) => {
    setIsLockEnabled(checked);
    localStorage.setItem('app_lock_enabled', checked.toString());
    toast.success(checked ? 'App Lock Enabled' : 'App Lock Disabled');
  };

  const handleSaveProfile = () => {
    localStorage.setItem('bio', bio);
    localStorage.setItem('interests', JSON.stringify(interests));
    toast.success('Profile updated');
  };
  const toggleFollow = () => {
    const id = viewingUserId || '';
    if (!id) return;
    const isFollowing = following.includes(id);
    const next = isFollowing ? following.filter(x => x !== id) : [...following, id];
    setFollowing(next);
    localStorage.setItem('following_ids', JSON.stringify(next));
    toast.success(isFollowing ? 'Unfollowed' : 'Followed');
  };
  const updateFemalePref = (pref: 'audio' | 'video' | 'both') => {
    localStorage.setItem('female_call_pref', pref);
    notify('success', 'PREF_UPDATED');
  };

  const handleLogout = async () => {
    await logout();
    notify('success', 'LOGOUT_SUCCESS');
    navigate('/login', { replace: true });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6 bg-gray-50 min-h-screen">
        <div className="py-8 bg-white rounded-2xl shadow-sm mb-6">
          <div className="flex items-center gap-4 px-6">
            <Avatar className="w-16 h-16 border-2 border-primary">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.phone_number}`} />
              <AvatarFallback>{(user?.phone_number || 'U')[0]}</AvatarFallback>
            </Avatar>
            {user?.gender === 'F' && (() => {
              const lvl = parseInt(localStorage.getItem('user_level') || '1', 10) || 1;
              const hour = new Date().getHours();
              const star = lvl >= 7 && (hour >= 21 || hour < 3);
              return star;
            })() && (
              <span className="ml-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-lg">
                STAR
              </span>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{isOwnProfile ? 'My Profile' : `User #${viewingUserId}`}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe2 className="w-4 h-4" />
                <span>Language: {localStorage.getItem('preferred_language') || 'English'}</span>
              </div>
            </div>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/wallet')}
                className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-bold flex items-center gap-2"
              >
                <Coins className="w-4 h-4" />
                Wallet
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Security & Privacy
              </h3>
              <button
                onClick={() => navigate('/account/delete')}
                className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold"
              >
                Delete Account
              </button>
            </div>
            
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">App Lock</p>
                  <p className="text-xs text-gray-500">Use biometric to unlock</p>
                </div>
              </div>
              <Switch 
                checked={isLockEnabled} 
                onCheckedChange={handleLockToggle} 
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button onClick={() => setShowFollowers(true)} className="text-left">
                  <p className="text-2xl font-bold">{followers.length}</p>
                  <p className="text-xs text-gray-500">Followers</p>
                </button>
                <button onClick={() => setShowFollowing(true)} className="text-left">
                  <p className="text-2xl font-bold">{following.length}</p>
                  <p className="text-xs text-gray-500">Following</p>
                </button>
              </div>
              {!isOwnProfile && (
                <button
                  onClick={toggleFollow}
                  className="px-4 py-2 rounded-xl font-bold bg-primary text-white flex items-center gap-2 active:scale-95 transition"
                >
                  {following.includes(viewingUserId || '') ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {following.includes(viewingUserId || '') ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          {isOwnProfile && user?.gender === 'F' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Call Preference</h3>
              </div>
              <div className="p-4 flex gap-2">
                <button
                  onClick={() => updateFemalePref('video')}
                  className={`px-3 py-2 rounded-lg font-bold ${femalePref === 'video' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Video Only
                </button>
                <button
                  onClick={() => updateFemalePref('audio')}
                  className={`px-3 py-2 rounded-lg font-bold ${femalePref === 'audio' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Audio Only
                </button>
                <button
                  onClick={() => updateFemalePref('both')}
                  className={`px-3 py-2 rounded-lg font-bold ${femalePref === 'both' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Both
                </button>
              </div>
            </div>
          )}

          {/* League & Links */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/leaderboard')}
                className="w-full p-4 rounded-xl border border-gray-200 flex items-center gap-3 hover:border-primary transition"
              >
                <Trophy className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">League</span>
              </button>
              <button
                onClick={() => navigate('/wallet')}
                className="w-full p-4 rounded-xl border border-gray-200 flex items-center gap-3 hover:border-primary transition"
              >
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">Wallet</span>
              </button>
            </div>
          </div>

          {/* Bio & Interests */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <Pencil className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">About</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-semibold">{user?.phone_number || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  {isOwnProfile ? (
                    <input
                      type="email"
                      defaultValue={localStorage.getItem('user_email') || ''}
                      onBlur={(e) => localStorage.setItem('user_email', e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border rounded-xl p-2 text-sm"
                    />
                  ) : (
                    <p className="text-sm font-semibold">{localStorage.getItem('user_email') || '—'}</p>
                  )}
                </div>
              </div>
              {isOwnProfile ? (
                <>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write your bio..."
                    className="w-full border rounded-xl p-3 text-sm"
                  />
                  <input
                    type="text"
                    value={interests.join(', ')}
                    onChange={(e) => setInterests(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="Interests (comma separated)"
                    className="w-full border rounded-xl p-3 text-sm"
                  />
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-primary text-white rounded-xl font-bold active:scale-95 transition"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-700">{bio || 'No bio available'}</p>
                  <div className="flex flex-wrap gap-2">
                    {interests.length ? interests.map((i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-xs">{i}</span>
                    )) : <span className="text-xs text-gray-400">No interests</span>}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Transactions</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {transactions.map(tx => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4">
            {isOwnProfile ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            ) : (
              <p className="text-center text-xs text-gray-400">Public Profile</p>
            )}
          </div>

          {showFollowers && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-4">
                <h3 className="font-bold mb-3">Followers</h3>
                <div className="space-y-2">
                  {followers.map(id => (
                    <button
                      key={id}
                      onClick={() => { navigate(`/profile/${id}`); setShowFollowers(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-gray-50"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} />
                        <AvatarFallback>{id}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">User #{id}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowFollowers(false)} className="mt-4 w-full bg-gray-900 text-white rounded-xl py-2 font-bold">Close</button>
              </div>
            </div>
          )}
          {showFollowing && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md p-4">
                <h3 className="font-bold mb-3">Following</h3>
                <div className="space-y-2">
                  {following.map(id => (
                    <button
                      key={id}
                      onClick={() => { navigate(`/profile/${id}`); setShowFollowing(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-gray-50"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`} />
                        <AvatarFallback>{id}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">User #{id}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowFollowing(false)} className="mt-4 w-full bg-gray-900 text-white rounded-xl py-2 font-bold">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
