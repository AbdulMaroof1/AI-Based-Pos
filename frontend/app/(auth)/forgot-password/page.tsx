'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { Cloud } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.forgotPassword(email);
      if (response.success) {
        setSent(true);
      } else {
        setError(response.message || 'Failed to send reset email');
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(errObj.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md mx-auto px-6">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center mb-6">
            <Cloud className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Check your email
          </h1>
          <p className="text-gray-600 text-center mb-8">
            If an account exists for {email}, we&apos;ve sent a password reset link.
          </p>
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Back to login
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
          Forgot password?
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Enter your email and we&apos;ll send you a reset link
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
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
          <Link href="/login" className="block text-center text-sm text-primary-600 hover:text-primary-700">
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}
