'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { Cloud } from 'lucide-react';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuthStore();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('pendingEmail') : null;
    setEmail(emailParam || storedEmail || '');
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.verifyOtp(email, code);
      if (response.success && response.data) {
        const data = response.data;
        if (data.needsSetup && data.setupToken) {
          sessionStorage.setItem('setupToken', data.setupToken);
          sessionStorage.setItem('pendingEmail', email);
          router.push(`/setup-account?email=${encodeURIComponent(email)}`);
        } else if (data.accessToken && data.user) {
          setUser(data.user);
          setToken(data.accessToken);
          sessionStorage.removeItem('setupToken');
          sessionStorage.removeItem('pendingEmail');
          router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string }; message?: string } };
      setError(errObj.response?.data?.message || (err as Error).message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      const response = await apiClient.requestOtp(email);
      if (response.success) {
        setCode('');
        setError('');
        alert('Verification code resent to your email');
      } else {
        setError(response.message || 'Failed to resend code');
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(errObj.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

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
          Enter your email to access your site
        </p>

        <form onSubmit={handleVerify} className="w-full space-y-4">
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
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              placeholder="540598"
              maxLength={6}
              className="zoho-input font-mono text-lg tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              autoComplete="one-time-code"
            />
          </div>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-2.5 px-4 rounded-md font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full py-2.5 px-4 rounded-md font-medium border border-gray-300 text-gray-800 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {resendLoading ? 'Sending...' : 'Resend verification code'}
          </button>
        </form>

        <p className="mt-8 text-sm text-gray-500">
          Manage your sites?{' '}
          <a href="/dashboard" className="text-primary-600 hover:text-primary-700 underline">
            Go to ABMNEXT ERP dashboard
          </a>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
