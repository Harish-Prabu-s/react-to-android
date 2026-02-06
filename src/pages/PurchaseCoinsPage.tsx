import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Coins, Check, CreditCard, ArrowLeft, ShieldCheck } from 'lucide-react';
import { notify } from '@/lib/utils';
import { walletApi } from '@/api/wallet';

interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

const PACKAGES: CoinPackage[] = [
  { id: '1', coins: 100, price: 99, bonus: 0 },
  { id: '2', coins: 500, price: 399, bonus: 50, popular: true },
  { id: '3', coins: 1000, price: 699, bonus: 200 },
  { id: '4', coins: 5000, price: 2999, bonus: 1500 },
];

export default function PurchaseCoinsPage() {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [processing, setProcessing] = useState(false);

  const isOfferTime = () => {
    const now = new Date();
    const h = now.getHours();
    return h >= 9 && h < 21;
  };

  const getOfferCountKey = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `offer_claim_count_${y}${m}${day}`;
  };

  const getOfferClaimsToday = (): number => {
    const key = getOfferCountKey();
    const val = localStorage.getItem(key);
    return val ? parseInt(val, 10) || 0 : 0;
  };

  const incrementOfferClaims = () => {
    const key = getOfferCountKey();
    const current = getOfferClaimsToday();
    localStorage.setItem(key, String(current + 1));
  };

  const remainingClaims = Math.max(0, 2 - getOfferClaimsToday());
  const offerPackage: CoinPackage = { id: 'offer-700', coins: 700, price: 199, bonus: 0, popular: true };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setProcessing(true);
    try {
      const res = await walletApi.purchase(selectedPackage.price, selectedPackage.coins + (selectedPackage.bonus || 0));
      setProcessing(false);
      if (res?.success) {
        notify('success', 'PURCHASE_SUCCESS', { coins: selectedPackage.coins });
        navigate('/wallet');
      } else {
        notify('error', 'PAYMENT_FAILED');
      }
    } catch (e) {
      setProcessing(false);
      notify('error', 'PAYMENT_ERROR');
      console.error(e);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Buy Coins</h1>
        </div>

        <div className="p-4 max-w-md mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white mb-6 shadow-lg text-center">
            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
               <Coins className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Recharge Wallet</h2>
            <p className="opacity-90">Get coins to make voice & video calls</p>
          </div>

          {/* Daily Offer */}
          <div className="mb-6">
            <div className={`rounded-2xl p-4 shadow-lg border ${isOfferTime() ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700">Common Offer (9 AM - 9 PM)</p>
                  <p className="text-xs text-gray-500">700 Coins for ₹199 • 2 times/day</p>
                  <p className="text-xs mt-1">
                    {isOfferTime() 
                      ? `Available today: ${remainingClaims} claim(s) left`
                      : 'No offer right now (Night: 9 PM - 3 AM)'}
                  </p>
                </div>
                <button
                  disabled={!isOfferTime() || remainingClaims <= 0}
                  onClick={() => {
                    if (!isOfferTime()) {
                      toast.error('Offer available only between 9 AM and 9 PM');
                      return;
                    }
                    if (remainingClaims <= 0) {
                      toast.error('Offer limit reached for today');
                      return;
                    }
                    setSelectedPackage(offerPackage);
                    incrementOfferClaims();
                    toast.success('Offer applied: 700 Coins for ₹199');
                  }}
                  className={`px-4 py-2 rounded-lg font-bold ${isOfferTime() && remainingClaims > 0 ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                >
                  Apply Offer
                </button>
              </div>
            </div>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {PACKAGES.map((pkg) => (
              <div 
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative bg-white rounded-xl p-4 border-2 cursor-pointer transition-all shadow-sm
                  ${selectedPackage?.id === pkg.id 
                    ? 'border-primary bg-primary/5 transform scale-[1.02]' 
                    : 'border-transparent hover:border-gray-200'
                  }
                `}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {pkg.coins}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Coins</div>
                  
                  {pkg.bonus && pkg.bonus > 0 && (
                    <div className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-md font-medium mb-3">
                      +{pkg.bonus} Bonus
                    </div>
                  )}

                  <div className="bg-gray-100 rounded-lg py-2 px-4 font-bold text-gray-800">
                    ₹{pkg.price}
                  </div>
                </div>

                {selectedPackage?.id === pkg.id && (
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Payment Section (Shows when package selected) */}
          {selectedPackage && (
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-20 animate-in slide-in-from-bottom-10">
              <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-gray-500 text-sm">Total to pay</p>
                    <p className="text-3xl font-bold text-gray-900">₹{selectedPackage.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">You get</p>
                    <p className="text-xl font-bold text-yellow-600 flex items-center justify-end">
                      <Coins className="w-4 h-4 mr-1" />
                      {selectedPackage.coins + (selectedPackage.bonus || 0)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={processing}
                  className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay Securely
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                  <ShieldCheck className="w-3 h-3" />
                  <span>100% Secure Payment with UPI / Cards</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
