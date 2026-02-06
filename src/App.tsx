import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BiometricLock from "@/components/BiometricLock";
import { CallProvider } from "@/context/CallContext";
import CallOverlay from "@/components/CallOverlay";
import ProtectedRoute from "@/routes/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import OTPScreen from "@/pages/OTPScreen";
import GenderSelectionPage from "@/pages/GenderSelectionPage";
import LanguageSelectionPage from "@/pages/LanguageSelectionPage";
import EmailCapturePage from "@/pages/EmailCapturePage";
import DeleteAccountRequestPage from "@/pages/DeleteAccountRequestPage";
import DeleteAccountConfirmPage from "@/pages/DeleteAccountConfirmPage";
import HomePage from "@/pages/HomePage";
import DiscoverPage from "@/pages/DiscoverPage";
import WalletPage from "@/pages/WalletPage";
import PurchaseCoinsPage from "@/pages/PurchaseCoinsPage";
import GamesPage from "@/pages/GamesPage";
import ChatPage from "@/pages/ChatPage";
import ProfilePage from "@/pages/ProfilePage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CallProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <BiometricLock>
            <CallOverlay />
            <Routes>
            {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/otp" element={<OTPScreen />} />
          <Route path="/language" element={<LanguageSelectionPage />} />
          <Route path="/email" element={<EmailCapturePage />} />
          <Route path="/gender" element={<GenderSelectionPage />} />
          <Route path="/account/delete" element={<DeleteAccountRequestPage />} />
          <Route path="/account/delete/confirm/:token" element={<DeleteAccountConfirmPage />} />
          
          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <DiscoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet/purchase"
            element={
              <ProtectedRoute>
                <PurchaseCoinsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <GamesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:userId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BiometricLock>
        </BrowserRouter>
      </TooltipProvider>
    </CallProvider>
  </QueryClientProvider>
);

export default App;
