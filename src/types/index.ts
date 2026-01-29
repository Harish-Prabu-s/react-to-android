// User Types
export type Gender = 'M' | 'F' | 'O';

export interface User {
  id: number;
  phone_number: string;
  gender: Gender | null;
  is_verified: boolean;
  is_online: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface Profile {
  id: number;
  user: number;
  display_name: string;
  bio: string;
  photo: string | null;
  interests: string[];
  age: number | null;
  location: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Auth Types
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  is_new_user: boolean;
}

export interface OTPRequest {
  phone_number: string;
}

export interface OTPVerify {
  phone_number: string;
  otp_code: string;
}

export interface GenderSelection {
  gender: Gender;
}

// Call Types
export type CallType = 'audio' | 'video';

export interface Room {
  id: number;
  caller: number;
  receiver: number;
  call_type: CallType;
  status: 'pending' | 'active' | 'ended';
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  coins_spent: number;
  created_at: string;
}

export interface Call {
  id: number;
  room: number;
  caller: User;
  receiver: User;
  call_type: CallType;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  coins_spent: number;
  rating: number | null;
  review: string | null;
  created_at: string;
}

export interface Message {
  id: number;
  room: number;
  sender: number;
  content: string;
  created_at: string;
}

// Wallet Types
export interface Wallet {
  id: number;
  user: number;
  coin_balance: number;
  total_earned: number;
  total_spent: number;
  updated_at: string;
}

export interface CoinTransaction {
  id: number;
  wallet: number;
  transaction_type: 'purchase' | 'spent' | 'earned' | 'withdrawal';
  amount: number;
  description: string;
  created_at: string;
}

export interface Payment {
  id: number;
  user: number;
  amount: number;
  currency: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  status: 'pending' | 'completed' | 'failed';
  coins_added: number;
  created_at: string;
}

export interface Withdrawal {
  id: number;
  user: number;
  amount: number;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// Gamification Types
export interface UserLevel {
  id: number;
  user: number;
  xp: number;
  level: number;
  badges: Badge[];
  updated_at: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned_at: string | null;
}

export interface DailyReward {
  id: number;
  user: number;
  day: number;
  xp_reward: number;
  coin_reward: number;
  claimed_at: string | null;
  streak: number;
}

export interface LeaderboardEntry {
  user: User;
  profile: Profile;
  xp: number;
  level: number;
  rank: number;
}

export interface Referral {
  id: number;
  referrer: number;
  referred: number;
  reward_claimed: boolean;
  created_at: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  error?: string;
  message?: string;
  detail?: string;
  [key: string]: unknown;
}
