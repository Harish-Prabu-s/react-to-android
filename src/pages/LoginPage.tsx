import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';
import { notify } from '@/lib/utils';
import { Phone, Sparkles, ScanLine } from 'lucide-react';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.sendOTP({ phone_number: phoneNumber });
      notify('success', 'OTP_SENT');
      // In development, show OTP in console
      if (response.otp) {
        console.log('OTP (dev only):', response.otp);
        notify('message', 'OTP_DEV_CODE', { code: response.otp });
      }
      navigate('/otp', { state: { phoneNumber } });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      notify('error', 'PAYMENT_ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-primary-500 via-secondary-500 to-primary-500 rounded-full mb-4 animate-in fade-in-0 zoom-in-95">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-2 tracking-tight animate-in slide-in-from-top-2 duration-300">
            Loveable App
          </h1>
          <p className="text-gray-600 animate-in fade-in-0 delay-150">Connect through voice and video</p>
          <p className="text-xs text-gray-400 mt-1">New users get free access</p>
        </div>

        <div className="card">
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="input-field pl-10"
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  try {
                    // Try Android interface (if available)
                    // @ts-expect-error AndroidInterface injected at runtime
                    const deviceNumber = window.AndroidInterface?.getPhoneNumber?.() || localStorage.getItem('device_phone_number');
                    if (deviceNumber) {
                      setPhoneNumber(deviceNumber);
                      notify('success', 'AUTO_FILL_SUCCESS');
                    } else {
                      // Fallback demo number for testing environment
                      setPhoneNumber('9999999999');
                      notify('message', 'AUTO_FILL_FALLBACK');
                    }
                  } catch {
                    setPhoneNumber('9999999999');
                    notify('message', 'AUTO_FILL_FALLBACK');
                  }
                }}
                className="mt-2 inline-flex items-center gap-2 text-sm text-primary-600 font-semibold hover:underline"
              >
                <ScanLine className="w-4 h-4" />
                Auto-Fetch My Number
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            By continuing, you agree to our Terms & Conditions
          </p>
        </div>
      </div>
    </div>
  );
}
