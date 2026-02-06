import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { User, Users, UserCircle } from 'lucide-react';
import type { Gender } from '@/types';

export default function GenderSelectionPage() {
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const { selectGender, refreshUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const genders = [
    { value: 'M' as const, label: 'Male', icon: User, color: 'bg-blue-500' },
    { value: 'F' as const, label: 'Female', icon: Users, color: 'bg-pink-500' },
    { value: 'O' as const, label: 'Other', icon: UserCircle, color: 'bg-purple-500' },
  ];

  const handleSelect = async () => {
    if (!selectedGender) {
      toast.error('Please select your gender');
      return;
    }

    try {
      await selectGender(selectedGender);
      await refreshUser(); // safety sync

      toast.success('Profile created successfully!');
      navigate('/email', { replace: true }); // next: email capture
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { gender?: string[]; error?: string } } };
      toast.error(
        axiosError?.response?.data?.gender?.[0] ||
          axiosError?.response?.data?.error ||
          'Failed to save gender'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Select Your Gender
          </h2>
          <p className="text-gray-600">
            This helps us match you with the right people
          </p>
        </div>

        <div className="card space-y-4">
          {genders.map((gender) => {
            const Icon = gender.icon;
            const isSelected = selectedGender === gender.value;

            return (
              <button
                key={gender.value}
                onClick={() => setSelectedGender(gender.value)}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div
                  className={`${gender.color} w-12 h-12 rounded-full flex items-center justify-center text-white`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-lg font-semibold">{gender.label}</span>

                {isSelected && (
                  <div className="ml-auto w-5 h-5 bg-primary-500 rounded-full" />
                )}
              </button>
            );
          })}

          <button
            onClick={handleSelect}
            disabled={!selectedGender || isLoading}
            className={`w-full mt-6 py-3 rounded-xl text-white font-semibold transition ${
              !selectedGender || isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600'
            }`}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
