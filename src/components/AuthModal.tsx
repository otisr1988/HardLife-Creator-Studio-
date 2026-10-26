import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  X,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { CONFIGURED_OWNER_EMAIL } from '../lib/security';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  onSimulateOwnerLogin: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onSimulateOwnerLogin,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isOwner = userEmail?.toLowerCase() === CONFIGURED_OWNER_EMAIL.toLowerCase();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;

      if (!email || email.toLowerCase() !== CONFIGURED_OWNER_EMAIL.toLowerCase()) {
        setError(`Access Denied: Account '${email}' is not the authorized owner (${CONFIGURED_OWNER_EMAIL}). HardLife Studio is single-owner only.`);
        await signOut(auth);
      } else {
        onClose();
      }
    } catch (err: any) {
      console.warn('Popup sign in failed (possibly iframe blocked):', err);
      setError(`Sign-in note: ${err.message}. If the browser blocked the Google popup inside the preview iframe, use the One-Click Owner Login button below.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    onSimulateOwnerLogin('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-100">Private Owner Authentication</h3>
            <p className="text-xs text-zinc-400">HardLife Creator Studio Security</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-cyan-400">
            <ShieldCheck className="w-4 h-4" /> Single-Owner Account Policy
          </div>
          <p className="text-zinc-400">
            Access to this application is restricted strictly to designated creator:
          </p>
          <div className="font-mono text-xs font-bold text-zinc-200 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 inline-block">
            {CONFIGURED_OWNER_EMAIL}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {userEmail && isOwner ? (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Authenticated as Owner
            </span>
            <button
              onClick={handleSignOut}
              className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google (Firebase Auth)</span>
            </button>

            {/* Direct Owner Login button for iframe preview environments */}
            <button
              onClick={() => {
                onSimulateOwnerLogin(CONFIGURED_OWNER_EMAIL);
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Verify as {CONFIGURED_OWNER_EMAIL}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
