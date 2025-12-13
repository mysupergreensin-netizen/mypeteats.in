import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get redirect URL from query params
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      return redirect || '/';
    }
    return '/';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      // Redirect to intended page or home
      window.location.href = getRedirectUrl();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login · MyPetEats</title>
      </Head>
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md space-y-6 bg-white/95 border-brand-200/30">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-brand-600">
              welcome back
            </p>
            <h1 className="text-3xl font-display tracking-tight text-brand-700">
              Sign in to continue
            </h1>
            <p className="text-sm text-brand-600/80">
              Access your account to manage orders, track deliveries, and more.
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              variant="light"
            />
            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                error={error}
                disabled={loading}
                variant="light"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm text-brand-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-brand-300/50 bg-transparent text-brand-500 focus:ring-brand-300"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-brand-500 hover:text-brand-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            {error && (
              <div className="rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
          <div className="pt-4 border-t border-brand-200/30">
            <p className="text-center text-sm text-brand-600">
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}


