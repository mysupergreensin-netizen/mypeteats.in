import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { mockProducts } from '../../data/mockData';
import Spinner from '../../components/ui/Spinner';

const formatPrice = (cents, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch('/api/products?limit=30');
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (active && data.products?.length) {
          setProducts(data.products);
        }
      } catch (error) {
        console.warn('Using mock products list');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);


  return (
    <>
      <Head>
        <title>Shop Rituals · MyPetEats</title>
      </Head>
      <div>
        <section>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">
                catalogue
              </p>
              <h1 className="mt-2 text-3xl font-display text-white">
                Microgreen Rituals
              </h1>
            </div>
            <Button variant="secondary" as="a" href="/cart">
              View Cart
            </Button>
          </div>
          {loading ? (
            <div className="mt-10 flex items-center gap-3 text-white/70">
              <Spinner size="sm" />
              <span>Loading latest harvest…</span>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function ProductCard({ product }) {
  return (
    <Card className="flex flex-col">
      <div className="space-y-2">
        <Badge variant="neutral">{product.categories?.[0]}</Badge>
        <h3 className="text-2xl font-display text-brand-800">
          {product.title}
        </h3>
        <p className="text-sm text-brand-500">{product.sku}</p>
      </div>
      {product.images?.[0] && (
        <div className="mt-4 aspect-[4/3] w-full overflow-hidden rounded-2xl">
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <p className="mt-4 flex-1 text-brand-600">{product.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-brand-500">Starting at</p>
          <p className="text-2xl font-semibold text-brand-800">
            {formatPrice(product.price_cents, product.currency)}
          </p>
        </div>
        <Button 
          as={Link} 
          href={product.slug ? `/products/${product.slug}` : '#'}
          disabled={!product.slug}
        >
          Details
        </Button>
      </div>
    </Card>
  );
}


