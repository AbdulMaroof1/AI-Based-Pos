'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { Cloud } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [usePassword, setUsePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.requestOtp(email);
      if (response.success) {
        sessionStorage.setItem('pendingEmail', email);
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setError(response.message || 'Failed to send verification code');
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string }; message?: string } };
      setError(errObj.response?.data?.message || (err as Error).message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.login(email, password);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        setToken(response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        router.push('/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string }; message?: string } };
      setError(errObj.response?.data?.message || (err as Error).message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = usePassword ? handlePasswordSubmit : handleOtpSubmit;

  return (
    <div className="w-full max-w-md mx-auto px-6">
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center mb-6">
          <Cloud className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Log in to your site on ABMNEXT ERP
        </h1>
        <p className="text-gray-600 text-center mb-8">
          {usePassword ? 'Enter your email and password' : 'Enter your email to access your site'}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="johndoe@mail.com"
              className="zoho-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          {usePassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="zoho-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            {loading
              ? usePassword
                ? 'Signing in...'
                : 'Sending...'
              : usePassword
                ? 'Sign in'
                : 'Continue with OTP'}
          </button>
          <button
            type="button"
            onClick={() => {
              setUsePassword(!usePassword);
              setError('');
            }}
            className="w-full text-sm text-primary-600 hover:text-primary-700"
          >
            {usePassword ? 'Use email verification (OTP) instead' : 'Sign in with password instead'}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700">
            Forgot password?
          </Link>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Manage your sites?{' '}
          <a href="/dashboard" className="text-primary-600 hover:text-primary-700 underline">
            Go to ABMNEXT ERP dashboard
          </a>
        </p>
      </div>
    </div>
  );
}
