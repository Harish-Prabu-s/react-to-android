import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { notify } from '@/lib/utils';
import { walletApi } from '@/api/wallet';
import { useAuthStore } from '@/store/authStore';

type CallType = 'voice' | 'video' | 'live';

interface CallState {
  isActive: boolean;
  isMinimized: boolean;
  type: CallType | null;
  duration: number; // in seconds
  costPerMinute: number;
}

interface CallContextType {
  callState: CallState;
  startCall: (type: CallType, targetMeta?: { gender?: 'M' | 'F' | 'O'; level?: number }) => void;
  endCall: () => void;
  toggleMinimize: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    isMinimized: false,
    type: null,
    duration: 0,
    costPerMinute: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isHighRateTime = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 21 || hour < 3;
  };
  const isStarWindow = isHighRateTime(); // 9 PM - 3 AM

  const getCost = (type: CallType) => {
    const highRate = isHighRateTime();
    if (highRate) {
      switch (type) {
        case 'voice': return 30;
        case 'video': return 60;
        case 'live': return 100;
        default: return 0;
      }
    } else {
      switch (type) {
        case 'voice': return 10;
        case 'video': return 30;
        case 'live': return 60;
        default: return 0;
      }
    }
  };

  const startCall = (type: CallType, targetMeta?: { gender?: 'M' | 'F' | 'O'; level?: number }) => {
    if (callState.isActive) return;

    const isFemale = user?.gender === 'F';
    let cost = isFemale ? 0 : getCost(type);
    if (targetMeta?.gender === 'F' && (targetMeta.level || 0) >= 7 && isStarWindow) {
      // Star user window (applies when connecting to star female)
      switch (type) {
        case 'voice': cost = isFemale ? 0 : 60; break;
        case 'video': cost = isFemale ? 0 : 90; break;
        case 'live': cost = isFemale ? 0 : 120; break;
      }
    }
    
    setCallState({
      isActive: true,
      isMinimized: false,
      type,
      duration: 0,
      costPerMinute: cost,
    });

    if (isFemale) {
      notify('success', 'CALL_STARTED_FREE', { type });
    } else {
      const rateMsg = isHighRateTime() ? 'Night Rates (9 PM - 3 AM)' : 'Day Rates';
      notify('success', 'CALL_STARTED_RATE', { type, cost, rate: rateMsg });
    }
  };

  const endCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCallState({
      isActive: false,
      isMinimized: false,
      type: null,
      duration: 0,
      costPerMinute: 0,
    });
    notify('info', 'CALL_ENDED');
  };

  const toggleMinimize = () => {
    setCallState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  useEffect(() => {
    if (callState.isActive) {
      timerRef.current = setInterval(() => {
        setCallState(prev => {
          const newDuration = prev.duration + 1;
          
          // Deduct coins every minute (60 seconds)
          if (newDuration > 0 && newDuration % 60 === 0) {
            if (prev.costPerMinute > 0) {
              console.log(`Deducting ${prev.costPerMinute} coins`);
              notify('message', 'COINS_DEDUCTED', { amount: prev.costPerMinute });
            }
            // XP gain and level update
            try {
              const currentXp = parseInt(localStorage.getItem('user_xp') || '0', 10) || 0;
              const nextXp = currentXp + 10; // 10 XP per minute of conversation
              localStorage.setItem('user_xp', String(nextXp));
              const thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
              let lvl = 1;
              for (let i = thresholds.length - 1; i >= 0; i--) {
                if (nextXp >= thresholds[i]) {
                  lvl = i + 1;
                  break;
                }
              }
              lvl = Math.min(10, lvl);
              localStorage.setItem('user_level', String(lvl));
            } catch (e) {
              void 0;
            }
          }
          
          return { ...prev, duration: newDuration };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callState.isActive]);

  return (
    <CallContext.Provider value={{ callState, startCall, endCall, toggleMinimize }}>
      {children}
    </CallContext.Provider>
  );
};
