import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';

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

function OrderDetailsContent() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/orders/${id}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load order');
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Order Details · MyPetEats</title>
        </Head>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Head>
          <title>Order Not Found · MyPetEats</title>
        </Head>
        <div className="space-y-10">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">
              order details
            </p>
            <h1 className="text-3xl font-display tracking-tight text-white">
              Order Not Found
            </h1>
          </div>
          <Card>
            <Alert variant="error">{error || 'Order not found'}</Alert>
            <div className="mt-4">
              <Button as={Link} href="/profile?tab=orders">
                View All Orders
              </Button>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Order {order.orderNumber} · MyPetEats</title>
      </Head>
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">
              order details
            </p>
            <h1 className="text-3xl font-display tracking-tight text-white">
              Order {order.orderNumber}
            </h1>
          </div>
          <Badge className={statusColors[order.status] || statusColors.pending}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>

        {router.query.success === 'true' && (
          <Alert variant="success">
            Order placed successfully! Your order number is {order.orderNumber}.
          </Alert>
        )}

        <div className="grid gap-10 lg:grid-cols-2">
          <Card className="space-y-6">
            <h2 className="text-xl font-display text-white">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 rounded-2xl border border-white/5 p-4"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80'}
                    alt={item.title}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/60 mb-2">SKU: {item.sku}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-white font-semibold">
                        {formatPrice(item.price_cents * item.quantity, order.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="space-y-4">
              <h2 className="text-xl font-display text-white">Order Summary</h2>
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal_cents, order.currency)}</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Shipping</span>
                <span>
                  {order.shipping_cents === 0
                    ? 'Complimentary'
                    : formatPrice(order.shipping_cents, order.currency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-semibold text-white">
                <span>Total</span>
                <span>{formatPrice(order.total_cents, order.currency)}</span>
              </div>
            </Card>

            <Card className="space-y-4">
              <h2 className="text-xl font-display text-white">Shipping Address</h2>
              <div className="text-white/70 space-y-1">
                <p className="text-white">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p>Phone: {order.shippingAddress.phone}</p>
                <p>Email: {order.shippingAddress.email}</p>
                {order.shippingAddress.instructions && (
                  <p className="mt-2 text-sm italic">
                    Instructions: {order.shippingAddress.instructions}
                  </p>
                )}
              </div>
            </Card>

            <Card className="space-y-4">
              <h2 className="text-xl font-display text-white">Payment</h2>
              <div className="text-white/70 space-y-1">
                <p>
                  Method: <span className="text-white capitalize">{order.payment.method}</span>
                </p>
                <p>
                  Status: <span className="text-white capitalize">{order.payment.status}</span>
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex gap-4">
          <Button as={Link} href="/profile?tab=orders">
            View All Orders
          </Button>
          <Button as={Link} href="/products" variant="ghost">
            Continue Shopping
          </Button>
        </div>
      </div>
    </>
  );
}

export default function OrderDetailsPage() {
  return (
    <ProtectedRoute>
      <OrderDetailsContent />
    </ProtectedRoute>
  );
}

