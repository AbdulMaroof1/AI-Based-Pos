'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Cloud } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setToken(searchParams.get('token') || '');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.resetPassword(token, password);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(errObj.response?.data?.message || 'Invalid or expired reset link');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto px-6">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-6">
            <Cloud className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Password reset
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Your password has been updated. Redirecting to login...
          </p>
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto px-6">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Invalid reset link
          </h1>
          <p className="text-gray-600 text-center mb-6">
            This link is invalid or has expired. Please request a new password reset.
          </p>
          <Link href="/forgot-password" className="text-primary-600 hover:text-primary-700 font-medium">
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-6">
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center mb-6">
          <Cloud className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Set new password
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Enter your new password below
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="zoho-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="Repeat your password"
              className="zoho-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
          <Link href="/login" className="block text-center text-sm text-primary-600 hover:text-primary-700">
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center min-h-[400px] items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
