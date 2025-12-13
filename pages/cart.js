import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { useCart } from '../contexts/CartContext';

const formatPrice = (cents, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { refreshCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to load cart');
      }
      const data = await response.json();
      setCart(data);
    } catch (err) {
      setError('Failed to load cart. Please try again.');
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    setUpdating({ ...updating, [productId]: true });
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update cart');
      }

      await fetchCart();
      refreshCart();
      setSuccess('Cart updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update quantity');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUpdating({ ...updating, [productId]: false });
    }
  };

  const removeItem = async (productId) => {
    setUpdating({ ...updating, [productId]: true });
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      await fetchCart();
      refreshCart();
      setSuccess('Item removed from cart');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove item');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUpdating({ ...updating, [productId]: false });
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Your Cart · MyPetEats</title>
        </Head>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <>
        <Head>
          <title>Your Cart · MyPetEats</title>
        </Head>
        <div className="space-y-10">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">
              ritual bag
            </p>
            <h1 className="text-3xl font-display tracking-tight text-white">
              Cart
            </h1>
          </div>
          <Card className="text-center py-12">
            <p className="text-brand-600 text-lg mb-4">Your cart is empty</p>
            <Button as={Link} href="/products">
              Continue Shopping
            </Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Your Cart · MyPetEats</title>
      </Head>
      <div className="space-y-10">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">
            ritual bag
          </p>
          <h1 className="text-3xl font-display tracking-tight text-white">
            Cart
          </h1>
        </div>

        {error && (
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <Card className="space-y-6">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col gap-4 rounded-3xl p-4 md:flex-row md:items-center"
              >
                <img
                  src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80'}
                  alt={item.product?.title || 'Product'}
                  className="h-28 w-28 rounded-2xl object-cover"
                />
                <div className="flex-1 space-y-1">
                  <h2 className="text-xl font-display text-brand-800">
                    {item.product?.title || 'Product'}
                  </h2>
                  <p className="text-sm text-brand-600">
                    {formatPrice(item.product?.price_cents || 0, item.product?.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={updating[item.productId]}
                      className="w-8 h-8 rounded-full border border-brand-300 bg-white text-brand-600 hover:bg-brand-50 disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="text-xl font-semibold text-brand-800 w-8 text-center">
                      {updating[item.productId] ? (
                        <Spinner size="sm" />
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={updating[item.productId] || (item.product?.inventory || 0) < item.quantity + 1}
                      className="w-8 h-8 rounded-full border border-brand-300 bg-white text-brand-600 hover:bg-brand-50 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    disabled={updating[item.productId]}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50 px-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </Card>
          <Card className="space-y-4">
            <h2 className="text-xl font-display text-brand-800">
              Order Summary
            </h2>
            <div className="flex justify-between text-brand-600">
              <span>Subtotal</span>
              <span>{formatPrice(cart.subtotal_cents, cart.currency)}</span>
            </div>
            <div className="flex justify-between text-brand-600">
              <span>Shipping</span>
              <span>Complimentary</span>
            </div>
            <div className="flex justify-between border-t border-brand-200 pt-4 text-lg font-semibold text-brand-800">
              <span>Total</span>
              <span>{formatPrice(cart.total_cents, cart.currency)}</span>
            </div>
            <Button
              as={Link}
              href="/checkout"
              className="w-full"
              disabled={cart.items.length === 0}
            >
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      </div>
    </>
  );
}
