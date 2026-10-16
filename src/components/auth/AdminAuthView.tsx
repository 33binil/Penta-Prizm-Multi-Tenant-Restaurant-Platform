import React, { useState } from 'react';
import { Restaurant } from '../../types';
import { auth, AuthUser } from '../../lib/auth';
import { db } from '../../lib/database';
import { Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminAuthViewProps {
  restaurant: Restaurant;
  onSuccess: (user: AuthUser, restaurant?: Restaurant) => void;
  onNavigateHome: () => void;
  onSwitchRestaurant: (restaurant: Restaurant) => void;
}

export const AdminAuthView: React.FC<AdminAuthViewProps> = ({
  restaurant,
  onSuccess,
  onNavigateHome,
  onSwitchRestaurant
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  // Register Fields
  const [regName, setRegName] = useState<string>('');
  const [regRestaurantName, setRegRestaurantName] = useState<string>('');
  const [regSubdomain, setRegSubdomain] = useState<string>('');
  const [regPlanId, setRegPlanId] = useState<string>('plan_growth');

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
        requiredPortal: 'admin'
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await auth.registerRestaurantAdmin({
        name: regName,
        email,
        password,
        restaurantName: regRestaurantName,
        subdomain: regSubdomain,
        planId: regPlanId
      });

      setIsLoading(false);

      if (!res.success || !res.user || !res.restaurant) {
        setErrorMessage(res.error || 'Registration failed.');
        return;
      }

      setSuccessMessage(`Restaurant "${res.restaurant.name}" created successfully. Redirecting...`);
      setTimeout(() => {
        onSuccess(res.user!, res.restaurant);
      }, 800);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Registration error occurred.');
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

        {/* Tenant Switcher dropdown for testing */}
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

      {/* Main Authentication Card */}
      <div className="w-full max-w-sm bg-white rounded-xl border border-zinc-200/90 shadow-sm p-7 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 mx-auto rounded-lg bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-xl mb-3">
            {restaurant.logo_url}
          </div>
          <h1 className="text-base font-semibold tracking-tight text-zinc-900">
            {mode === 'login' ? `${restaurant.name} Admin` : 'Register New Restaurant'}
          </h1>
          <p className="text-xs text-zinc-500">
            {mode === 'login'
              ? 'Sign in to access your restaurant management dashboard'
              : 'Create a new restaurant tenant and administrator account'}
          </p>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-lg text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 stroke-[1.5]" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[1.5]" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* --- LOGIN FORM --- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-700 font-medium mb-1.5">
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@restaurant.com"
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
                  Forgot password?
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
              Sign In to Admin
            </Button>

            {/* Quick Demo Credentials */}
            <div className="pt-4 border-t border-zinc-100 text-[11px] text-zinc-500 space-y-2">
              <span className="block text-zinc-400 font-medium uppercase text-[10px]">
                Demo Credentials:
              </span>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleFillDemoCreds('elena@velvetroastcafe.com', 'password123')}
                  className="text-left text-zinc-600 hover:text-zinc-900 hover:underline"
                >
                  Elena Rostova (Admin) · <span className="font-mono text-zinc-400">elena@...</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemoCreds('aria@velvetroastcafe.com', 'password123')}
                  className="text-left text-zinc-600 hover:text-zinc-900 hover:underline"
                >
                  Aria Chen (Manager) · <span className="font-mono text-zinc-400">aria@...</span>
                </button>
              </div>
            </div>

            {/* Switch to Register */}
            <div className="pt-3 text-center text-xs text-zinc-500">
              Need to register a restaurant?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className="text-zinc-900 font-medium hover:underline ml-1"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* --- REGISTER FORM --- */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-zinc-700 font-medium mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Marcus Bradley"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marcus@restaurant.com"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1">Restaurant Name</label>
              <input
                type="text"
                required
                value={regRestaurantName}
                onChange={(e) => {
                  const val = e.target.value;
                  setRegRestaurantName(val);
                  setRegSubdomain(val.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                }}
                placeholder="e.g. Blue Oak Roasters"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:border-zinc-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1">Subdomain Slug</label>
              <div className="flex items-center">
                <input
                  type="text"
                  required
                  value={regSubdomain}
                  onChange={(e) => setRegSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  placeholder="blue-oak"
                  className="flex-1 px-3 py-2 text-xs border border-zinc-200 rounded-l-lg focus:outline-hidden focus:border-zinc-900 bg-white font-mono"
                />
                <span className="px-2.5 py-2 bg-zinc-100 text-zinc-500 border border-l-0 border-zinc-200 rounded-r-lg font-mono text-[11px]">
                  .pentaprizm.app
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full justify-center mt-2"
            >
              Register & Setup Restaurant
            </Button>

            <div className="pt-3 text-center text-xs text-zinc-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className="text-zinc-900 font-medium hover:underline ml-1"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs text-xs">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 w-full max-w-sm shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900">Password Assistance</h3>
            <p className="text-zinc-600 leading-relaxed">
              Default demo accounts are configured with <strong className="font-mono text-zinc-900">password123</strong>.
              For custom accounts, please contact your restaurant administrator or platform support.
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
