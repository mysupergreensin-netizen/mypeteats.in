import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [joinClub, setJoinClub] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = (pwd) => {
    if (pwd.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Validation
    if (!acceptTerms) {
      setError('Please accept the terms and conditions to continue');
      return;
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, joinClub }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      // User is logged in via cookie; redirect home
      window.location.href = '/';
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register · MyPetEats</title>
      </Head>
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md space-y-6 bg-white/95 border-brand-200/30">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-brand-600">
              join ritual
            </p>
            <h1 className="text-3xl font-display tracking-tight text-brand-700">
              Create your account
            </h1>
            <p className="text-sm text-brand-600/80">
              Start your journey to premium pet nutrition today.
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
              variant="light"
            />
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
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              disabled={loading}
              helper="Must be at least 6 characters long"
              variant="light"
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              disabled={loading}
              error={
                password && confirmPassword && password !== confirmPassword
                  ? 'Passwords do not match'
                  : ''
              }
              variant="light"
            />
            <div className="space-y-3">
              <label className="flex items-start space-x-3 text-sm text-brand-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-brand-300/50 bg-transparent text-brand-500 focus:ring-brand-300"
                  required
                  disabled={loading}
                />
                <span>
                  I agree to the{' '}
                  <Link href="/terms" className="text-brand-500 hover:text-brand-600 underline">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-brand-500 hover:text-brand-600 underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              <label className="flex items-start space-x-3 text-sm text-brand-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={joinClub}
                  onChange={(e) => setJoinClub(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-brand-300/50 bg-transparent text-brand-500 focus:ring-brand-300"
                  disabled={loading}
                />
                <span>
                  Join MyPetEats Club for exclusive offers and early access to new products
                </span>
              </label>
            </div>
            {error && (
              <div className="rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading || !acceptTerms} size="lg">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Creating account…
                </span>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
          <div className="pt-4 border-t border-brand-200/30">
            <p className="text-center text-sm text-brand-600">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}


