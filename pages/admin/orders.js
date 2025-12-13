import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/layout/AdminLayout';
import SiteLayout from '../../components/layout/SiteLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Heading from '../../components/ui/Heading';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Input from '../../components/ui/Input';

const LOGIN_BACKGROUND =
  'bg-[radial-gradient(circle_at_10%_20%,rgba(161,76,255,.35),transparent_55%),radial-gradient(circle_at_80%_0,rgba(66,10,143,.65),transparent_60%),#0d0216]';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'];

export default function AdminOrders() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthed) {
      fetchOrders();
    }
  }, [page, statusFilter, isAuthed]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      const allowedRoles = ['admin', 'super_admin', 'manager', 'staff'];
      if (data.user && allowedRoles.includes(data.user.role)) {
        setUser(data.user);
        setIsAuthed(true);
      } else {
        const stored = sessionStorage.getItem('admin_token');
        if (stored) {
          setToken(stored);
          setIsAuthed(true);
        }
      }
    } catch {
      const stored = sessionStorage.getItem('admin_token');
      if (stored) {
        setToken(stored);
        setIsAuthed(true);
      }
    }
  };

  const fetchOrders = async () => {
    if (!token && !user) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      if (searchQuery) {
        params.append('orderNumber', searchQuery);
      }
      const response = await fetch(`/api/admin/orders?${params}`, {
        headers: user ? {} : { 'x-admin-token': token },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setPagination(data.pagination);
      } else if (response.status === 401) {
        sessionStorage.removeItem('admin_token');
        setIsAuthed(false);
        router.push('/admin');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to load orders');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus, paymentStatus) => {
    setUpdatingStatus(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? {} : { 'x-admin-token': token }),
        },
        body: JSON.stringify({
          status: newStatus,
          paymentStatus: paymentStatus,
        }),
      });
      if (response.ok) {
        await fetchOrders();
        setSelectedOrder(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update order');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'neutral',
      processing: 'neutral',
      shipped: 'success',
      delivered: 'success',
      cancelled: 'danger',
    };
    return variants[status] || 'neutral';
  };

  const filteredOrders = searchQuery
    ? orders.filter((order) =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.user?.email && order.user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : orders;

  const totalVisibleOrders = filteredOrders.length;
  const totalVisibleRevenue = filteredOrders.reduce(
    (sum, order) => sum + (Number(order.total_cents) || 0),
    0
  );

  const handleExportCsv = () => {
    if (!filteredOrders.length) return;

    const headers = [
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Status',
      'Payment Status',
      'Total (cents)',
      'Currency',
      'Created At',
      'City',
      'Postal Code',
    ];

    const rows = filteredOrders.map((order) => [
      order.orderNumber,
      order.user?.name || order.shippingAddress?.firstName || '',
      order.user?.email || order.shippingAddress?.email || '',
      order.status,
      order.payment?.status || '',
      order.total_cents,
      order.currency || 'INR',
      order.created_at ? new Date(order.created_at).toISOString() : '',
      order.shippingAddress?.city || '',
      order.shippingAddress?.postalCode || '',
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              <p className="text-sm text-purple-100/80">Please log in to access orders.</p>
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
        <title>Orders · Admin · MyPetEats</title>
      </Head>

      <section className="space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-deep-purple to-mid-violet p-8 text-white shadow-elevated md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">orders</p>
            <Heading as="h1" className="text-4xl text-white">
              Order Management
            </Heading>
            <p className="text-white/70">
              {pagination?.total || orders.length} total · {totalVisibleOrders} shown ·{' '}
              {(totalVisibleRevenue / 100).toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
              })}{' '}
              on screen
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportCsv}
              disabled={!filteredOrders.length}
            >
              Download Orders CSV
            </Button>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-50">
            {error}
          </div>
        )}

        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by order number or email..."
            />
          </div>
          <div className="w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto rounded-2xl border border-border-subtle bg-surface-100 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400/50"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">Order #</th>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Items</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Payment</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-purple-50/40">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {order.user?.name || order.shippingAddress?.firstName || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">{order.user?.email || order.shippingAddress?.email}</p>
                    </td>
                    <td className="px-6 py-4">{order.items?.length || 0} items</td>
                    <td className="px-6 py-4 font-semibold text-mid-violet">
                      {(order.total_cents / 100).toLocaleString('en-IN', {
                        style: 'currency',
                        currency: order.currency || 'INR',
                        minimumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          order.payment?.status === 'completed'
                            ? 'success'
                            : order.payment?.status === 'failed'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {order.payment?.status || 'pending'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View/Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && !loading && (
            <p className="px-6 py-12 text-center text-gray-500">
              {searchQuery || statusFilter ? 'No orders found matching your filters.' : 'No orders yet.'}
            </p>
          )}
          {loading && (
            <div className="px-6 py-12 text-center text-gray-500 flex items-center justify-center gap-3">
              <Spinner size="sm" />
              <span>Loading orders…</span>
            </div>
          )}
        </Card>

        {pagination && pagination.pages > 1 && (
          <Pagination
            page={page}
            totalPages={pagination.pages}
            onPageChange={setPage}
            limit={pagination.limit}
            total={pagination.total}
          />
        )}

        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusUpdate={handleStatusUpdate}
            updating={updatingStatus}
          />
        )}
      </section>
    </AdminLayout>
  );
}

AdminOrders.getLayout = (page) => page;

function OrderDetailModal({ order, onClose, onStatusUpdate, updating }) {
  const [status, setStatus] = useState(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment?.status || 'pending');

  const handleUpdate = () => {
    onStatusUpdate(order._id, status, paymentStatus);
  };

  const handlePrintLabel = () => {
    if (typeof window === 'undefined') return;
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:static print:bg-white print:p-0">
      <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-8 shadow-elevated print:shadow-none print:max-w-full print:rounded-none">
        {/* On-screen layout */}
        <div className="space-y-6 print:hidden">
          <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Order Details</p>
              <Heading as="h2" className="text-3xl text-deep-purple">
                {order.orderNumber}
              </Heading>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handlePrintLabel}>
                Print Shipping Label
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-2xl border border-border-subtle bg-surface-100 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400/50"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full rounded-2xl border border-border-subtle bg-surface-100 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400/50"
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Items</h3>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-surface-100 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-white/60 text-sm">
                      SKU: {item.sku} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-white font-semibold">
                    {((item.price_cents * item.quantity) / 100).toLocaleString('en-IN', {
                      style: 'currency',
                      currency: order.currency || 'INR',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Shipping Address</h3>
            <div className="p-3 bg-surface-100 rounded-lg text-white/80">
              <p>
                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
              </p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
              </p>
              <p>{order.shippingAddress?.phone}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>

        {/* Print-only shipping label for stickers */}
        <div className="hidden print:block text-black">
          <div className="border border-gray-300 p-6 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-bold tracking-wide">MyPetEats</p>
                <p className="text-xs text-gray-600">Premium pet nutrition</p>
              </div>
              <div className="text-right text-xs text-gray-700">
                <p>Order #{order.orderNumber}</p>
                <p>{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t border-b border-gray-300 py-3 mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">SHIP TO</p>
              <p className="text-sm font-semibold">
                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
              </p>
              <p className="text-sm">{order.shippingAddress?.address}</p>
              <p className="text-sm">
                {order.shippingAddress?.city} {order.shippingAddress?.postalCode}
              </p>
              <p className="text-sm mt-1">Phone: {order.shippingAddress?.phone}</p>
            </div>

            <div className="text-xs text-gray-700 space-y-1">
              <p>
                <span className="font-semibold">Items:</span> {order.items?.length || 0}
              </p>
              <p>
                <span className="font-semibold">Payment:</span> {order.payment?.status || 'pending'}
              </p>
              <p>
                <span className="font-semibold">Total:</span>{' '}
                {(order.total_cents / 100).toLocaleString('en-IN', {
                  style: 'currency',
                  currency: order.currency || 'INR',
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

