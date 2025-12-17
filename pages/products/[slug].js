import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { mockProducts } from '../../data/mockData';
import connectDB from '../../lib/db';
import { getProductsCollection } from '../../lib/collections';
import { useCart } from '../../contexts/CartContext';

const formatPrice = (cents, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);

export default function ProductDetail({ product }) {
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const { refreshCart } = useCart();
  const canAddToCart = /^[a-f\d]{24}$/i.test(String(product?._id || ''));

  const handleAddToCart = async () => {
    if (!product?._id) {
      setAddError('Product information is missing');
      return;
    }
    if (!canAddToCart) {
      setAddError('This item is a demo listing and cannot be added to cart yet.');
      return;
    }

    setAdding(true);
    setAddError('');
    setAddSuccess('');

    try {
      // Ensure productId is a string
      const productId = String(product._id);
      
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error('Failed to parse cart response:', jsonError);
        setAddError('Invalid response from server');
        return;
      }

      if (!res.ok) {
        const errorMsg = data.error || data.details || 'Failed to add to cart';
        console.error('Cart API error:', errorMsg, data);
        setAddError(errorMsg);
        return;
      }

      setAddSuccess('Added to cart');
      setTimeout(() => setAddSuccess(''), 3000);
      refreshCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
      setAddError('Failed to add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  if (!product) {
    return (
      <div className="space-y-6 text-center text-white">
        <h1 className="text-4xl font-display">Product unavailable</h1>
        <p className="text-white/70">
          The ritual you’re looking for has either sold out or moved to a secret
          drop.
        </p>
        <Button as={Link} href="/products">
          Back to Shop
        </Button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.title} · MyPetEats</title>
        <meta name="description" content={product.description} />
      </Head>
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          {product.images?.map((image, index) => (
            <div key={image} className="relative h-80 w-full rounded-4xl overflow-hidden bg-gray-200/20">
              <Image
                src={image}
                alt={`${product.title} - Image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <Badge>{product.categories?.[0]}</Badge>
          <h1 className="text-4xl font-display tracking-tight text-white">
            {product.title}
          </h1>
          <p className="text-xl text-white/70">{product.description}</p>
          <div className="space-y-3">
            <div className="flex items-center gap-6">
              <span className="text-3xl font-semibold text-white">
                {formatPrice(product.price_cents, product.currency)}
              </span>
              <Button onClick={handleAddToCart} disabled={adding || !canAddToCart}>
                {adding ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Adding...
                  </span>
                ) : (
                  'Add to ritual'
                )}
              </Button>
            </div>
            {addError && (
              <p className="text-sm text-red-200">{addError}</p>
            )}
            {!canAddToCart && (
              <p className="text-sm text-white/60">
                Demo product (not yet synced to your database).
              </p>
            )}
            {addSuccess && (
              <p className="text-sm text-emerald-200">{addSuccess}</p>
            )}
          </div>
          <Card className="space-y-4">
            <h2 className="text-xl font-display text-brand-800">What's inside</h2>
            <ul className="space-y-2 text-brand-600">
              {Object.entries(product.attributes || {}).map(([key, value]) => (
                <li key={key} className="flex justify-between">
                  <span className="text-brand-500 capitalize">{key}</span>
                  <span className="text-brand-800">{value}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="space-y-4">
            <h2 className="text-xl font-display text-brand-800">Shipping & Care</h2>
            <p className="text-brand-600">
              Small-batch dried, sealed with nitrogen, and delivered cold across
              India. Store in a dry pantry and refrigerate after opening for
              maximum vibrancy.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  // Start with no pre-rendered paths - generate on-demand
  return {
    paths: [],
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  try {
    await connectDB();
    const productsCollection = await getProductsCollection();

    // Normalize slug - ensure it's lowercase and trimmed
    const normalizedSlug = params.slug.toLowerCase().trim();
    
    const projection = {
      title: 1,
      description: 1,
      price_cents: 1,
      currency: 1,
      images: 1,
      categories: 1,
      attributes: 1,
      slug: 1,
      sku: 1,
      published: 1,
    };

    // Try published product first
    let product = await productsCollection.findOne(
      {
        slug: normalizedSlug,
        published: true,
      },
      {
        projection,
      }
    );

    // If not found, try any product with that slug (helps when published=false)
    if (!product) {
      product = await productsCollection.findOne(
        { slug: normalizedSlug },
        { projection }
      );
    }
    
    if (product) {
      // Convert MongoDB _id to string for client-side
      return { 
        props: { 
          product: {
            ...product,
            _id: product._id.toString()
          }
        },
        // Revalidate every 60 seconds (ISR)
        revalidate: 60
      };
    }
    
    // DB didn't have it - fall back to mock products (avoids 404 for demo slugs)
    const fallback = mockProducts.find(
      (item) => item.slug?.toLowerCase() === normalizedSlug
    ) || null;

    if (fallback) {
      return { props: { product: fallback }, revalidate: 60 };
    }

    return { notFound: true };
  } catch (error) {
    console.error('[Product Page] Error fetching product from database:', error);
    
    // Fallback to mock products if database query fails
    const fallback = mockProducts.find((item) => 
      item.slug?.toLowerCase() === params.slug.toLowerCase()
    ) || null;
    
    if (fallback) {
      return { 
        props: { product: fallback },
        revalidate: 60
      };
    }
    
    // No product found in database or mock data
    return {
      notFound: true
    };
  }
}


