import React, { useState, useEffect } from 'react';
import { Lock, Fingerprint, Unlock } from 'lucide-react';
import { toast } from 'sonner';

interface BiometricLockProps {
  children: React.ReactNode;
}

export default function BiometricLock({ children }: BiometricLockProps) {
  const [isLocked, setIsLocked] = useState(false); // Default to false for development, can be true if enabled
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    // Check if app lock is enabled in local storage
    const lockEnabled = localStorage.getItem('app_lock_enabled') === 'true';
    if (lockEnabled) {
      setIsLocked(true);
    }
    
    // Simulate biometric availability check
    // In a real Capacitor app, we would use NativeBiometric.isAvailable()
    setHasBiometrics(true);
  }, []);

  const handleUnlock = async () => {
    // Simulate biometric authentication
    // In a real app: await NativeBiometric.verifyIdentity()
    
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Verifying identity...',
        success: () => {
          setIsLocked(false);
          return 'Identity verified';
        },
        error: 'Authentication failed',
      }
    );
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <Lock className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold">App Locked</h2>
        <p className="text-muted-foreground">
          Please verify your identity to access the application
        </p>

        <button
          onClick={handleUnlock}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4"
        >
          <Fingerprint className="w-6 h-6" />
          <span>Unlock with Biometrics</span>
        </button>
      </div>
    </div>
  );
}
