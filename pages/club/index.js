import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Heading from '../../components/ui/Heading';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';

const benefits = [
  {
    icon: '🎁',
    title: 'Exclusive Discounts',
    description: 'Save up to 30% on premium products and special bundles',
  },
  {
    icon: '⚡',
    title: 'Early Access',
    description: 'Be the first to try new products before they launch',
  },
  {
    icon: '🎯',
    title: 'Personalized Recommendations',
    description: 'Get tailored product suggestions based on your pet\'s needs',
  },
  {
    icon: '🚚',
    title: 'Free Shipping',
    description: 'Enjoy complimentary shipping on all orders',
  },
  {
    icon: '🎉',
    title: 'Surprise Drops',
    description: 'Access to limited edition products and special offers',
  },
  {
    icon: '💬',
    title: 'Priority Support',
    description: 'Get faster response times from our customer care team',
  },
];

export default function ClubPage() {
  const { user, loading, refetch } = useAuth();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleJoin = async () => {
    setError('');
    setSuccess('');
    setJoining(true);

    try {
      const res = await fetch('/api/club/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to join club');
        return;
      }
      setSuccess('Welcome to MyPetEats Club!');
      refetch();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isMember = user?.clubMember || false;

  return (
    <ProtectedRoute>
      <>
        <Head>
          <title>Club Membership · MyPetEats</title>
        </Head>
        <div className="space-y-10 py-10">
          <div className="text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">
              exclusive access
            </p>
            <Heading as="h1" className="text-4xl md:text-5xl text-white">
              MyPetEats Club
            </Heading>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Join the club that treats pets like royalty. Unlock members-only perks, surprise drops, and curated offers for your furry family.
            </p>
          </div>

          {error && (
            <Card className="border-red-500/30 bg-red-500/20">
              <p className="text-red-100">{error}</p>
            </Card>
          )}

          {success && (
            <Card className="border-emerald-500/30 bg-emerald-500/20">
              <p className="text-emerald-100">{success}</p>
            </Card>
          )}

          {isMember ? (
            <Card className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Heading as="h2" className="text-3xl text-brand-700">
                      You're a Member!
                    </Heading>
                    <Badge variant="success" className="text-sm bg-emerald-500/20 text-emerald-700 border-emerald-500/40">
                      Active Member
                    </Badge>
                  </div>
                  <p className="text-brand-600">
                    Thank you for being part of the MyPetEats Club. Enjoy all the exclusive benefits below.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6 border-t border-brand-200">
                {benefits.map((benefit, index) => (
                  <div key={index} className="space-y-3">
                    <div className="text-4xl">{benefit.icon}</div>
                    <h3 className="text-xl font-semibold text-brand-700">{benefit.title}</h3>
                    <p className="text-brand-600 text-sm">{benefit.description}</p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-brand-200">
                <Link href="/profile">
                  <Button variant="primary">Manage Membership</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <>
              <Card className="space-y-8">
                <div className="text-center space-y-4">
                  <Heading as="h2" className="text-3xl text-brand-700">
                    Join MyPetEats Club
                  </Heading>
                  <p className="text-xl text-brand-700">
                    Free to join. Easy to save.
                  </p>
                  <p className="text-brand-600">
                    Unlock members-only perks, surprise drops, and curated offers for your furry family.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6 border-t border-brand-200">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="space-y-3">
                      <div className="text-4xl">{benefit.icon}</div>
                      <h3 className="text-xl font-semibold text-brand-700">{benefit.title}</h3>
                      <p className="text-brand-600 text-sm">{benefit.description}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/10 text-center space-y-4">
                  <Button
                    size="lg"
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full md:w-auto px-8"
                  >
                    {joining ? (
                      <span className="flex items-center justify-center gap-2">
                        <Spinner size="sm" />
                        Joining...
                      </span>
                    ) : (
                      'Join Club Membership'
                    )}
                  </Button>
                  <p className="text-sm text-brand-500">
                    No credit card required. Cancel anytime.
                  </p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-brand-600/20 to-brand-800/20 border-brand-500/30">
                <div className="space-y-4">
                  <Heading as="h3" className="text-2xl text-white">
                    What Members Say
                  </Heading>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-white/90 italic">
                        "The early access to new products is amazing! My dog loves everything we've tried."
                      </p>
                      <p className="text-sm text-white/60">— Priya M., Mumbai</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-white/90 italic">
                        "The discounts alone make it worth it. Plus, the personalized recommendations are spot on!"
                      </p>
                      <p className="text-sm text-white/60">— Raj K., Bangalore</p>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </>
    </ProtectedRoute>
  );
}

