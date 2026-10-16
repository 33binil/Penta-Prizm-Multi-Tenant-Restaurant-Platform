import React, { useState } from 'react';
import { auth, AuthUser } from '../../lib/auth';
import { Shield, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface SuperAdminAuthViewProps {
  onSuccess: (user: AuthUser) => void;
  onNavigateHome: () => void;
}

export const SuperAdminAuthView: React.FC<SuperAdminAuthViewProps> = ({
  onSuccess,
  onNavigateHome
}) => {
  const [email, setEmail] = useState<string>('admin@pentaprizm.app');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await auth.login({
        email,
        password,
        requiredPortal: 'superadmin'
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

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 text-zinc-100 antialiased font-sans">
      <div className="w-full max-w-sm mb-6 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>Exit to Public Website</span>
        </button>

        <span className="text-[11px] font-mono text-zinc-500">
          manage.pentaprizm.app
        </span>
      </div>

      <div className="w-full max-w-sm bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl p-7 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 mx-auto rounded-lg bg-zinc-800 text-white flex items-center justify-center mb-3 border border-zinc-700">
            <Shield className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h1 className="text-base font-semibold tracking-tight text-white">
            Penta Prizm Governance
          </h1>
          <p className="text-xs text-zinc-400">
            Platform-level SaaS administration console
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-950/60 border border-rose-800/70 rounded-lg text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 stroke-[1.5]" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">
              Super Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pentaprizm.app"
              className="w-full px-3 py-2 text-xs border border-zinc-700 rounded-lg focus:outline-hidden focus:border-white transition-colors bg-zinc-800 text-white"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1.5">
              Security Key / Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 pr-9 text-xs border border-zinc-700 rounded-lg focus:outline-hidden focus:border-white transition-colors bg-zinc-800 text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-200 transition-colors"
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
            className="w-full justify-center mt-2 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold"
          >
            Authenticate Super Admin
          </Button>

          <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 text-center">
            Default platform credentials: <span className="font-mono text-zinc-300">admin@pentaprizm.app</span> / <span className="font-mono text-zinc-300">password123</span>
          </div>
        </form>
      </div>
    </div>
  );
};
