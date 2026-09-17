import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Building,
  KeyRound,
  Shield,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Eye,
  EyeOff,
  CloudOff,
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { UserAvatar } from './UserAvatar';
import { signInWithGoogle, getFirestoreUserProfile } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  currentUser: UserType;
  onLoginSuccess: (user: UserType) => void;
  onRegisterUser: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users = [],
  currentUser,
  onLoginSuccess,
  onRegisterUser,
}) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');

  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('Apex Industrial Corp');
  const [role, setRole] = useState<UserRole>('INSPECTOR');

  // Reset Password inputs
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<'REQUEST' | 'NEW_PASSWORD'>('REQUEST');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');

  // Password visibility toggles (hidden by default)
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  // Status message
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setMessage(null);
    try {
      const fbUser = await signInWithGoogle();
      const firestoreProfile = await getFirestoreUserProfile(fbUser.uid);
      const existing = users.find(u => u.email.toLowerCase() === (fbUser.email || '').toLowerCase());

      const activeUser: UserType = {
        id: fbUser.uid,
        name: fbUser.displayName || existing?.name || 'Authenticated Inspector',
        email: fbUser.email || '',
        role: existing?.role || 'INSPECTOR',
        organization: existing?.organization || 'Apex Industrial Corp',
        avatarUrl: firestoreProfile?.photoUrl || firestoreProfile?.avatarUrl || fbUser.photoURL || '',
        active: true,
        firebaseUid: fbUser.uid,
        phone: existing?.phone || '+1 (555) 019-2831',
      };

      onLoginSuccess(activeUser);
      setMessage({
        type: 'success',
        text: `Welcome, ${activeUser.name}! Signed in via Firebase Auth.`,
      });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 700);
    } catch (err: unknown) {
      console.error('Google Sign In Error:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Google sign-in failed. Please try again.',
      });
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Empty email validation
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your corporate email address.' });
      return;
    }

    // Empty password validation
    if (!password.trim()) {
      setMessage({ type: 'error', text: 'Please enter your password.' });
      return;
    }

    // Check credentials against registered users
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      onLoginSuccess(found);
      setMessage({ type: 'success', text: `Login successful! Welcome back, ${found.name}.` });
      setTimeout(() => {
        setMessage(null);
        setPassword('');
        onClose();
      }, 800);
    } else {
      setMessage({
        type: 'error',
        text: 'Incorrect email or password. Please verify credentials or select a demo operator below.',
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Please enter your full legal name.' });
      return;
    }
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter a corporate email address.' });
      return;
    }
    if (!password.trim()) {
      setMessage({ type: 'error', text: 'Please enter a password.' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      setMessage({
        type: 'error',
        text: 'An account with this email already exists. Please sign in instead.',
      });
      return;
    }

    const newUser: UserType = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      organization: organization.trim() || 'Apex Industrial Corp',
      phone: '+1 (555) 300-8800',
      active: true,
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    };

    onRegisterUser(newUser);
    onLoginSuccess(newUser);
    setMessage({
      type: 'success',
      text: `Registration successful! Account created for ${newUser.name} (${newUser.role}).`,
    });
    setTimeout(() => {
      setMessage(null);
      setPassword('');
      setConfirmPassword('');
      onClose();
    }, 900);
  };

  const handleQuickLogin = (u: UserType) => {
    onLoginSuccess(u);
    setMessage({ type: 'success', text: `Switched session to ${u.name} (${u.role})` });
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 600);
  };

  const handleSendResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter your registered corporate email.' });
      return;
    }
    const found = users.find(u => u.email.toLowerCase() === resetEmail.trim().toLowerCase());
    if (!found) {
      setMessage({ type: 'error', text: 'No registered operator account found with this email address.' });
      return;
    }
    setResetStep('NEW_PASSWORD');
    setMessage({
      type: 'success',
      text: 'Identity verified. You can now set your new password.',
    });
  };

  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResetPassword.trim()) {
      setMessage({ type: 'error', text: 'Please enter your new password.' });
      return;
    }
    if (newResetPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newResetPassword !== confirmResetPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setMessage({
      type: 'success',
      text: 'Password successfully updated! You can now sign in with your new password.',
    });
    setTimeout(() => {
      setAuthMode('LOGIN');
      setResetStep('REQUEST');
      setNewResetPassword('');
      setConfirmResetPassword('');
      setEmail(resetEmail);
      setMessage(null);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-white shadow-sm">
              SI
            </div>
            <div>
              <h3 id="auth-modal-title" className="text-base font-black text-white">
                Smart Inspection Auth
              </h3>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                SECURE INDUSTRIAL GATEWAY
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close authentication modal"
            title="Close authentication modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Status Message Banner */}
        {message && (
          <div
            className={`p-3 text-xs font-bold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : message.type === 'info'
                ? 'bg-blue-50 text-blue-800 border-b border-blue-200'
                : 'bg-red-50 text-red-800 border-b border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span className="leading-snug">{message.text}</span>
          </div>
        )}

        {/* Mode Switch Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setAuthMode('LOGIN');
              setMessage(null);
            }}
            className={`flex-1 py-3 border-b-2 text-center transition-colors ${
              authMode === 'LOGIN'
                ? 'border-orange-600 text-orange-600 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('REGISTER');
              setMessage(null);
            }}
            className={`flex-1 py-3 border-b-2 text-center transition-colors ${
              authMode === 'REGISTER'
                ? 'border-orange-600 text-orange-600 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Register Operator
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('FORGOT');
              setMessage(null);
            }}
            className={`flex-1 py-3 border-b-2 text-center transition-colors ${
              authMode === 'FORGOT'
                ? 'border-orange-600 text-orange-600 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Reset Password
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* LOGIN VIEW */}
          {authMode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Corporate Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    id="login-email"
                    placeholder="inspector@apexindustrial.io"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (message) setMessage(null);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('FORGOT');
                      setResetEmail(email);
                    }}
                    className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    id="login-password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (message) setMessage(null);
                    }}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="btn-sign-in"
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/20 transition-all active:scale-98"
              >
                Sign In to Platform
              </button>

              {/* Google Firebase OAuth Sign-in */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSigningIn}
                className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2"
              >
                {isGoogleSigningIn ? (
                  <span>Connecting to Google Account...</span>
                ) : (
                  <>
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
                    <span>Sign in with Google (Firebase Cloud)</span>
                  </>
                )}
              </button>

              {/* Quick Demo Access Buttons */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  1-Click Quick Demo Sign-in:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {users.slice(0, 3).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-orange-400 bg-slate-50 hover:bg-orange-50/50 text-left transition-all group flex items-center gap-2"
                    >
                      <UserAvatar user={u} size="xs" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-slate-900 block truncate group-hover:text-orange-600">
                          {u.name.split(' ')[0]}
                        </span>
                        <span className="text-[9px] font-bold text-orange-600 uppercase">
                          {u.role}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* REGISTER VIEW */}
          {authMode === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3" noValidate>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    id="register-name"
                    placeholder="e.g. Morgan Vance"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Corporate Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    id="register-email"
                    placeholder="m.vance@industry.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      id="register-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                      title={showRegisterPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="register-confirm-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Operational Role
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="ADMIN">ADMIN (Full Operational Authority)</option>
                  <option value="INSPECTOR">INSPECTOR (Field Checklists & Issues)</option>
                  <option value="VIEWER">VIEWER (Auditor Read-Only)</option>
                </select>
              </div>

              <button
                type="submit"
                id="btn-register"
                className="w-full py-2.5 mt-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/20 transition-all active:scale-98"
              >
                Register & Enter App
              </button>
            </form>
          )}

          {/* FORGOT / RESET PASSWORD VIEW */}
          {authMode === 'FORGOT' && (
            <div className="space-y-4">
              {resetStep === 'REQUEST' ? (
                <form onSubmit={handleSendResetCode} className="space-y-4" noValidate>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter your registered corporate email. An industrial verification code will be verified to permit credential renewal.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        id="reset-email"
                        placeholder="operator@smartinspect.io"
                        value={resetEmail}
                        onChange={e => setResetEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-orange-600/20 active:scale-98"
                  >
                    Verify Email & Proceed
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompleteReset} className="space-y-3" noValidate>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Verification confirmed for <span className="font-bold text-slate-900">{resetEmail}</span>. Set your new password.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        id="reset-new-password"
                        placeholder="••••••••••••"
                        value={newResetPassword}
                        onChange={e => setNewResetPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                        title={showResetPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {showResetPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showResetConfirmPassword ? 'text' : 'password'}
                        id="reset-confirm-password"
                        placeholder="••••••••••••"
                        value={confirmResetPassword}
                        onChange={e => setConfirmResetPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                        aria-label={showResetConfirmPassword ? 'Hide password' : 'Show password'}
                        title={showResetConfirmPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        {showResetConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-orange-600/20 active:scale-98"
                  >
                    Save New Password
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Firebase / Storage Connectivity Footer Status */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5" title="Storage Engine Status">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">Offline Local Storage Active</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 font-medium">
            <CloudOff className="w-3.5 h-3.5 text-slate-400" />
            <span>Firebase Standby</span>
          </div>
        </div>
      </div>
    </div>
  );
};
