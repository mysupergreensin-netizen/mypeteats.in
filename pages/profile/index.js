import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Heading from '../../components/ui/Heading';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../../components/ui/Spinner';

const formatPrice = (cents, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  processing: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
  shipped: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
  delivered: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-200 border-red-500/30',
};

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/orders?limit=50');
      if (!response.ok) {
        throw new Error('Failed to load orders');
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <Heading as="h2" className="text-2xl text-brand-800 mb-4">
          Order History
        </Heading>
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Heading as="h2" className="text-2xl text-brand-800 mb-4">
          Order History
        </Heading>
        <p className="text-red-200">{error}</p>
        <Button onClick={fetchOrders} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <Heading as="h2" className="text-2xl text-brand-800 mb-4">
          Order History
        </Heading>
        <p className="text-brand-600 mb-4">You haven't placed any orders yet.</p>
        <Button as={Link} href="/products">
          Start Shopping
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <Heading as="h2" className="text-2xl text-slate-900 mb-6">
        Order History
      </Heading>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            href={`/orders/${order._id}`}
            className="block rounded-2xl border border-brand-200 p-4 hover:border-brand-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-brand-800">
                  Order {order.orderNumber}
                </h3>
                <p className="text-sm text-brand-600">
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <Badge className={statusColors[order.status] || statusColors.pending}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-600">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </span>
              <span className="text-brand-800 font-semibold">
                {formatPrice(order.total_cents, order.currency)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading, refetch } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Handle tab from query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['profile', 'orders', 'addresses', 'pets', 'club'].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
        return;
      }
      setSuccess('Profile updated successfully');
      setEditMode(false);
      refetch();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to change password');
        return;
      }
      setSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <>
        <Head>
          <title>My Profile · MyPetEats</title>
        </Head>
      <div className="space-y-8 py-10">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">
              my account
            </p>
            <Heading as="h1" className="text-4xl text-white">
              Profile Settings
            </Heading>
          </div>

          <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
            {/* Sidebar Navigation */}
            <Card className="h-fit">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: '👤' },
                  { id: 'orders', label: 'Orders', icon: '📦' },
                  { id: 'addresses', label: 'Addresses', icon: '📍' },
                  { id: 'pets', label: 'My Pets', icon: '🐾' },
                  { id: 'club', label: 'Club Membership', icon: '⭐' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                      activeTab === tab.id
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                        : 'text-brand-600 hover:text-brand-700 hover:bg-surface-100'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Card>

            {/* Main Content */}
            <div className="space-y-6">
              {activeTab === 'profile' && (
                <Card className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Heading as="h2" className="text-2xl text-brand-700">
                      Personal Information
                    </Heading>
                    {!editMode && (
                      <Button onClick={() => setEditMode(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-100">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-100">
                      {success}
                    </div>
                  )}

                  {editMode ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-5">
                      <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={saving}
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={saving}
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 90000 12345"
                        disabled={saving}
                      />
                      <div className="flex gap-3">
                        <Button type="submit" disabled={saving}>
                          {saving ? (
                            <span className="flex items-center gap-2">
                              <Spinner size="sm" />
                              Saving...
                            </span>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setEditMode(false);
                            setError('');
                            setSuccess('');
                            if (user) {
                              setFormData({
                                name: user.name || '',
                                email: user.email || '',
                                phone: user.phone || '',
                              });
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-brand-500 mb-1">Name</p>
                        <p className="text-brand-800">{user?.name || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-brand-500 mb-1">Email</p>
                        <p className="text-brand-800">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-brand-500 mb-1">Phone</p>
                        <p className="text-brand-800">{user?.phone || 'Not set'}</p>
                      </div>
                    </div>
                  )}

                  {/* Change Password Section */}
                  <div className="pt-6 border-t border-brand-200">
                    <Heading as="h3" className="text-xl text-brand-700 mb-4">
                      Change Password
                    </Heading>
                    <form onSubmit={handlePasswordChange} className="space-y-5">
                      <Input
                        label="Current Password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        disabled={saving}
                      />
                      <Input
                        label="New Password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        disabled={saving}
                        helper="Must be at least 6 characters"
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        disabled={saving}
                      />
                      <Button type="submit" disabled={saving}>
                        {saving ? (
                          <span className="flex items-center gap-2">
                            <Spinner size="sm" />
                            Changing...
                          </span>
                        ) : (
                          'Change Password'
                        )}
                      </Button>
                    </form>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-6 border-t border-brand-200">
                    <Button variant="ghost" onClick={handleLogout} className="text-red-300 hover:text-red-200">
                      Logout
                    </Button>
                  </div>
                </Card>
              )}

              {activeTab === 'orders' && <OrdersTab />}

              {activeTab === 'addresses' && (
                <Card>
                  <Heading as="h2" className="text-2xl text-brand-700 mb-4">
                    Saved Addresses
                  </Heading>
                  <p className="text-brand-600">Your saved addresses will appear here.</p>
                </Card>
              )}

              {activeTab === 'pets' && (
                <Card>
                  <Heading as="h2" className="text-2xl text-brand-700 mb-4">
                    My Pets
                  </Heading>
                  <p className="text-brand-600">Your pet profiles will appear here.</p>
                </Card>
              )}

              {activeTab === 'club' && (
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <Heading as="h2" className="text-2xl text-brand-700">
                      Club Membership
                    </Heading>
                    <Badge variant={user?.clubMember ? 'success' : 'neutral'}>
                      {user?.clubMember ? 'Member' : 'Not a Member'}
                    </Badge>
                  </div>
                  {user?.clubMember ? (
                    <div className="space-y-4">
                      <p className="text-brand-600">
                        You're a member of MyPetEats Club! Enjoy exclusive benefits and early access to new products.
                      </p>
                      <Link href="/club">
                        <Button>View Membership Details</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-brand-600">
                        Join MyPetEats Club to unlock exclusive benefits, discounts, and early access to new products.
                      </p>
                      <Link href="/club">
                        <Button>Join Club Membership</Button>
                      </Link>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </>
    </ProtectedRoute>
  );
}

