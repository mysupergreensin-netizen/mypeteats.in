import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/layout/AdminLayout';
import SiteLayout from '../../components/layout/SiteLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Heading from '../../components/ui/Heading';
import Badge from '../../components/ui/Badge';

const LOGIN_BACKGROUND =
  'bg-[radial-gradient(circle_at_10%_20%,rgba(161,76,255,.35),transparent_55%),radial-gradient(circle_at_80%_0,rgba(66,10,143,.65),transparent_60%),#0d0216]';

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      const allowedRoles = ['admin', 'super_admin', 'manager', 'staff'];
      if (data.user && allowedRoles.includes(data.user.role)) {
        setUser(data.user);
        setIsAuthed(true);
        fetchStats();
      } else {
        const stored = sessionStorage.getItem('admin_token');
        if (stored) {
          setToken(stored);
          setIsAuthed(true);
          fetchStats(stored);
        }
      }
    } catch {
      const stored = sessionStorage.getItem('admin_token');
      if (stored) {
        setToken(stored);
        setIsAuthed(true);
        fetchStats(stored);
      }
    }
  };

  const fetchStats = async (authToken = token) => {
    if (!authToken && !user) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/stats', {
        headers: user ? {} : { 'x-admin-token': authToken },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (response.status === 401) {
        sessionStorage.removeItem('admin_token');
        setIsAuthed(false);
        router.push('/admin');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to load statistics');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (user) {
        await fetch('/api/auth/logout', { method: 'POST' });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      sessionStorage.removeItem('admin_token');
      setIsAuthed(false);
      setUser(null);
      router.push('/admin');
    }
  };

  if (!isAuthed) {
    return (
      <SiteLayout>
        <Head>
          <title>Admin Login · MyPetEats</title>
        </Head>
        <div className={`min-h-screen flex items-center justify-center px-4 py-20 text-white ${LOGIN_BACKGROUND}`}>
          <Card className="w-full max-w-md space-y-6 rounded-3xl border border-brand-200 bg-white/95 p-8 shadow-elevated backdrop-blur-xl">
            <header className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-brand-600">secure portal</p>
              <Heading as="h2" className="text-brand-700">
                Admin Console
              </Heading>
              <p className="text-sm text-purple-100/80">Please log in to access the dashboard.</p>
            </header>
            <Button onClick={() => router.push('/admin')} className="w-full">
              Go to Login
            </Button>
          </Card>
        </div>
      </SiteLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Dashboard · Admin · MyPetEats</title>
      </Head>

      <section className="space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-deep-purple to-mid-violet p-8 text-white shadow-elevated md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">overview</p>
            <Heading as="h1" className="text-4xl text-white">
              Dashboard
            </Heading>
            <p className="text-white/70">Real-time statistics and insights</p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-50">
            {error}
          </div>
        )}

        {loading && !stats ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : stats ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <p className="text-sm text-white/60 mb-2">Total Products</p>
              <Heading as="h3" className="text-3xl text-white mb-1">
                {stats.products.total}
              </Heading>
              <div className="flex gap-2 mt-2">
                <Badge variant="success" className="text-xs">
                  {stats.products.published} Published
                </Badge>
                <Badge variant="warning" className="text-xs">
                  {stats.products.draft} Draft
                </Badge>
              </div>
              {stats.products.lowInventory > 0 && (
                <p className="text-xs text-amber-200 mt-2">
                  {stats.products.lowInventory} low inventory
                </p>
              )}
            </Card>

            <Card className="p-6">
              <p className="text-sm text-white/60 mb-2">Total Orders</p>
              <Heading as="h3" className="text-3xl text-white mb-1">
                {stats.orders.total}
              </Heading>
              <p className="text-xs text-white/60 mt-2">
                {stats.orders.recent} in last 30 days
              </p>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-white/60 mb-2">Total Users</p>
              <Heading as="h3" className="text-3xl text-white mb-1">
                {stats.users.total}
              </Heading>
              <div className="flex gap-2 mt-2">
                <Badge variant="neutral" className="text-xs">
                  {stats.users.customers} Customers
                </Badge>
                {stats.users.clubMembers > 0 && (
                  <Badge variant="success" className="text-xs">
                    {stats.users.clubMembers} Club
                  </Badge>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <p className="text-sm text-white/60 mb-2">Total Revenue</p>
              <Heading as="h3" className="text-3xl text-white mb-1">
                {stats.revenue.total_formatted}
              </Heading>
              <p className="text-xs text-white/60 mt-2">
                {stats.revenue.recent_formatted} in last 30 days
              </p>
            </Card>
          </div>
        ) : null}

        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <Heading as="h3" className="text-xl text-white mb-4">
                Orders by Status
              </Heading>
              <div className="space-y-2">
                {Object.entries(stats.orders.byStatus || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-white/70 capitalize">{status}</span>
                    <Badge variant="neutral">{count}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <Heading as="h3" className="text-xl text-white mb-4">
                User Breakdown
              </Heading>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Admins</span>
                  <Badge variant="danger">{stats.users.admins}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Customers</span>
                  <Badge variant="neutral">{stats.users.customers}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Club Members</span>
                  <Badge variant="success">{stats.users.clubMembers}</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <Heading as="h3" className="text-xl text-white mb-4">
                Quick Analytics
              </Heading>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-center justify-between">
                  <span>Avg. Order Value</span>
                  <span className="font-semibold text-white">
                    {stats.orders.total > 0
                      ? (stats.revenue.total_cents / stats.orders.total / 100).toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          minimumFractionDigits: 0,
                        })
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>30d Revenue Share</span>
                  <span className="font-semibold text-white">
                    {stats.revenue.total_cents > 0
                      ? `${Math.round(
                          (stats.revenue.recent_cents / stats.revenue.total_cents) * 100
                        )}%`
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Admin : Customer Ratio</span>
                  <span className="font-semibold text-white">
                    {stats.users.customers > 0
                      ? `1 : ${Math.round(stats.users.customers / (stats.users.admins || 1))}`
                      : '—'}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:col-span-2 lg:col-span-3">
              <Heading as="h3" className="text-xl text-white mb-4">
                Last 7 Days – Orders & Revenue
              </Heading>
              <div className="space-y-4">
                {/* Simple bar chart without external libs */}
                <div className="flex items-end gap-3 h-40 border-b border-white/10 pb-4">
                  {stats.orders.timeSeries?.map((point) => {
                    const maxOrders = Math.max(
                      ...stats.orders.timeSeries.map((p) => p.orders || 0),
                      1
                    );
                    const maxRevenue = Math.max(
                      ...stats.orders.timeSeries.map((p) => p.revenue_cents || 0),
                      1
                    );
                    const ordersHeight = (point.orders / maxOrders) * 100;
                    const revenueHeight = (point.revenue_cents / maxRevenue) * 100;
                    const label = point.date.slice(5); // MM-DD
                    return (
                      <div key={point.date} className="flex-1 flex flex-col items-center gap-2">
                        <div className="flex items-end gap-1 w-full justify-center">
                          <div
                            className="w-3 rounded-t-full bg-brand-400/80"
                            style={{ height: `${ordersHeight || 4}%` }}
                            title={`Orders: ${point.orders}`}
                          />
                          <div
                            className="w-3 rounded-t-full bg-emerald-400/70"
                            style={{ height: `${revenueHeight || 4}%` }}
                            title={`Revenue: ₹${(point.revenue_cents / 100).toFixed(0)}`}
                          />
                        </div>
                        <span className="text-[10px] text-white/60">{label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-brand-400/80" />{' '}
                    <span>Orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400/70" />{' '}
                    <span>Revenue</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}

AdminDashboard.getLayout = (page) => page;

