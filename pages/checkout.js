import { useState, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const formatPrice = (cents, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  useEffect(() => {
    if (!authLoading && user) {
      // Pre-fill form with user data
      setFormData((prev) => ({
        ...prev,
        email: user.email || '',
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        phone: user.phone || '',
      }));
      fetchCart();
    }
  }, [user, authLoading]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error('Failed to load cart');
      const data = await response.json();
      setCart(data);
      
      if (!data.items || data.items.length === 0) {
        router.push('/cart');
      }
    } catch (err) {
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Verify payment on backend
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          orderId: paymentData.orderId,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      // Redirect to order confirmation
      router.push(`/orders/${verifyData.order.id}?success=true&payment=success`);
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err.message || 'Payment verification failed. Please contact support.');
      setSubmitting(false);
    }
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    setError(error.description || 'Payment failed. Please try again.');
    setSubmitting(false);
  };

  const initiatePayment = async () => {
    if (!razorpayLoaded || !window.Razorpay) {
      setError('Payment gateway not loaded. Please refresh the page.');
      setSubmitting(false);
      return;
    }

    try {
      // Create order and get Razorpay order ID
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            postalCode: formData.postalCode.trim(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      // Configure Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'MyPetEats',
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        handler: function (response) {
          handlePaymentSuccess({
            ...response,
            orderId: data.orderId,
          });
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          orderId: data.orderId,
          orderNumber: data.orderNumber,
        },
        theme: {
          color: '#7c3aed',
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        handlePaymentFailure({
          code: response.error.code,
          description: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason,
        });
      });

      razorpay.open();
    } catch (err) {
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validate required fields
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    for (const field of required) {
      if (!formData[field] || formData[field].trim().length === 0) {
        setError(`Please fill in all required fields`);
        setSubmitting(false);
        return;
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setSubmitting(false);
      return;
    }

    // Validate phone (Indian format)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number');
      setSubmitting(false);
      return;
    }

    // Initiate Razorpay payment
    await initiatePayment();
  };

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Checkout · MyPetEats</title>
        </Head>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return null; // Will redirect
  }

  return (
    <>
      <Head>
        <title>Checkout · MyPetEats</title>
      </Head>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          setError('Failed to load payment gateway. Please refresh the page.');
        }}
      />
      <div className="space-y-10">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">
            secure checkout
          </p>
          <h1 className="text-3xl font-display tracking-tight text-white">
            Complete Ritual
          </h1>
        </div>

        {error && (
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <Card className="space-y-6">
              <h2 className="text-xl font-display text-brand-800">Pet Parent</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Sia"
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Kapoor"
                  required
                />
              </div>
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@mypeteats.in"
                required
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 90000 12345"
                required
              />
            </Card>
            <Card className="space-y-6">
              <h2 className="text-xl font-display text-brand-800">Delivery</h2>
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="112, Microgreen Street"
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Bengaluru"
                  required
                />
                <Input
                  label="Postal Code"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="560001"
                  required
                />
              </div>
            </Card>
          </div>
          <Card className="space-y-6">
            <h2 className="text-xl font-display text-brand-800">Payment</h2>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-blue-100 text-sm">
              <p className="font-semibold mb-1">Secure Payment via Razorpay</p>
              <p>Your payment is processed securely through Razorpay. We do not store your card details.</p>
            </div>
            <div className="border-t border-brand-200 pt-4">
              <div className="flex justify-between text-brand-600 mb-2">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal_cents, cart.currency)}</span>
              </div>
              <div className="flex justify-between text-brand-600 mb-4">
                <span>Shipping</span>
                <span>Complimentary</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-brand-800 mb-4">
                <span>Total</span>
                <span>{formatPrice(cart.total_cents, cart.currency)}</span>
              </div>
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting || !razorpayLoaded}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    Processing...
                  </span>
                ) : !razorpayLoaded ? (
                  'Loading Payment Gateway...'
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
              <p className="text-xs text-white/50 mt-2 text-center">
                By proceeding, you agree to our terms and conditions
              </p>
            </div>
          </Card>
        </form>
      </div>
    </>
  );
}
