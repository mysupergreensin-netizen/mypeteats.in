import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

const formatPrice = (cents, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;
  const [searchQuery, setSearchQuery] = useState(q || '');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (q) {
      setSearchQuery(q);
      performSearch(q);
    }
  }, [q]);

  const performSearch = async (query) => {
    if (!query || query.trim().length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/products?limit=50&search=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError('Failed to search products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      performSearch(searchQuery.trim());
    }
  };

  return (
    <>
      <Head>
        <title>Search · MyPetEats</title>
        <meta name="description" content="Search for pet products" />
      </Head>
      <div className="space-y-10 py-10">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">
            find products
          </p>
          <h1 className="text-3xl font-display tracking-tight text-white md:text-4xl">
            Search
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Search'}
            </Button>
          </div>
        </form>

        {error && (
          <Card className="border-red-500/30 bg-red-500/20">
            <p className="text-red-100">{error}</p>
          </Card>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {!loading && searchQuery && products.length === 0 && !error && (
          <Card className="text-center py-12">
            <p className="text-brand-600 text-lg">
              No products found for &quot;{searchQuery}&quot;
            </p>
            <p className="text-brand-500 text-sm mt-2">
              Try different keywords or browse all products
            </p>
            <Button as={Link} href="/products" className="mt-4">
              Browse All Products
            </Button>
          </Card>
        )}

        {!loading && products.length > 0 && (
          <>
            <p className="text-brand-600">
              Found {products.length} product{products.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <Card key={product._id} className="overflow-hidden">
                  <div className="aspect-square w-full overflow-hidden bg-gray-100">
                    <img
                      src={
                        product.images?.[0] ||
                        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-brand-800 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-purple">
                        {formatPrice(product.price_cents, product.currency)}
                      </p>
                      <Button
                        as="a"
                        href={product.slug ? `/products/${product.slug}` : '#'}
                        size="sm"
                        disabled={!product.slug}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {!searchQuery && (
          <Card className="text-center py-12">
            <p className="text-slate-600 text-lg">
              Enter a search term to find products
            </p>
          </Card>
        )}
      </div>
    </>
  );
}

