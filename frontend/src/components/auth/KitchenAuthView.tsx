import React, { useState } from 'react';
import { Restaurant } from '../../types';
import { auth, AuthUser } from '../../lib/auth';
import { db } from '../../lib/database';
import { Eye, EyeOff, AlertCircle, ArrowLeft, ChefHat, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';

interface KitchenAuthViewProps {
  restaurant: Restaurant;
  onSuccess: (user: AuthUser) => void;
  onNavigateHome: () => void;
  onSwitchRestaurant: (restaurant: Restaurant) => void;
}

export const KitchenAuthView: React.FC<KitchenAuthViewProps> = ({
  restaurant,
  onSuccess,
  onNavigateHome,
  onSwitchRestaurant
}) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  const allRestaurants = db.getAllRestaurants();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await auth.login({
        email,
        password,
        targetRestaurantId: restaurant.id,
        requiredPortal: 'kitchen'
      });

      setIsLoading(false);

      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Authentication failed.');
        return;
      }

      onSuccess(res.user);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Login error occurred.');
    }
  };

  const handleFillDemoCreds = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center p-6 text-zinc-900 antialiased">
      {/* Top Breadcrumb & Home Link */}
      <div className="w-full max-w-sm mb-6 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Back to {restaurant.name}</span>
        </button>

        {/* Tenant Switcher dropdown */}
        <div className="relative inline-flex items-center text-xs">
          <select
            value={restaurant.id}
            onChange={(e) => {
              const target = allRestaurants.find((r) => r.id === e.target.value);
              if (target) onSwitchRestaurant(target);
            }}
            className="text-xs text-zinc-600 bg-transparent pr-4 focus:outline-hidden cursor-pointer"
          >
            {allRestaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-0 pointer-events-none stroke-[1.5]" />
        </div>
      </div>

      {/* Main Kitchen Login Card */}
      <div className="w-full max-w-sm bg-white rounded-xl border border-zinc-200/90 shadow-sm p-7 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 mx-auto rounded-lg bg-zinc-900 text-white flex items-center justify-center mb-3">
            <ChefHat className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h1 className="text-base font-semibold tracking-tight text-zinc-900">
            {restaurant.name} Kitchen
          </h1>
          <p className="text-xs text-zinc-500">
            Sign in with your authorized kitchen staff account
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-lg text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 stroke-[1.5]" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Kitchen Login Form (Strictly No Registration / Sign Up Option) */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-700 font-medium mb-1.5">
              Kitchen Staff Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="chef@restaurant.com"
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 transition-colors bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-zinc-700 font-medium">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-zinc-500 hover:text-zinc-900 text-[11px]"
              >
                Need help?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 pr-9 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 transition-colors bg-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5 stroke-[1.5]" />
                ) : (
                  <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full justify-center mt-2"
          >
            Access Kitchen Station
          </Button>

          {/* Explicit Notice: Kitchen Staff Cannot Self-Register */}
          <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-lg text-[11px] text-zinc-500 leading-relaxed text-center">
            Kitchen staff accounts are provisioned by your restaurant administrator. Self-registration is disabled.
          </div>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-zinc-100 text-[11px] text-zinc-500 space-y-1.5">
            <span className="block text-zinc-400 font-medium uppercase text-[10px]">
              Demo Kitchen Credentials:
            </span>
            <button
              type="button"
              onClick={() => handleFillDemoCreds('marco@velvetroastcafe.com', 'password123')}
              className="text-left text-zinc-600 hover:text-zinc-900 hover:underline block"
            >
              Marco Vance (Kitchen Staff) · <span className="font-mono text-zinc-400">marco@...</span>
            </button>
          </div>
        </form>
      </div>

      {/* Help Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs text-xs">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 w-full max-w-sm shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900">Kitchen Staff Credentials</h3>
            <p className="text-zinc-600 leading-relaxed">
              Default kitchen staff account is <strong className="font-mono text-zinc-900">marco@velvetroastcafe.com</strong> with password <strong className="font-mono text-zinc-900">password123</strong>.
              If your password was changed, ask your restaurant manager to reset it in the Staff Management section.
            </p>
            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowForgotModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
