import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { mockProducts, categories } from '../data/mockData';

const formatPrice = (cents, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);

function useFeaturedProducts() {
  const [products, setProducts] = useState(mockProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products?limit=6');
        if (!response.ok) throw new Error('Failed to load products');
        const data = await response.json();
        if (active && data?.products?.length) {
          setProducts(data.products);
        }
      } catch (error) {
        // Silently fall back to mock data - no need to log in production
        if (process.env.NODE_ENV === 'development') {
          console.warn('Falling back to mock data', error);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchProducts();
    return () => {
      active = false;
    };
  }, []);

  return { products, loading };
}

export default function HomePage() {
  const { products, loading } = useFeaturedProducts();

  return (
    <>
      <Head>
        <title>MyPetEats · Premium Pet Food Delivered</title>
        <meta
          name="description"
          content="Curated products for your furry friends. straight to your door."
        />
      </Head>

      <div className="space-y-12 md:space-y-16">
        <Hero />
        <CategoryShowcase />
        <FeaturedProducts products={products} loading={loading} />
        <ClubMembership />
        <LearnMore />
        <WhyChooseUs />
      </div>
    </>
  );
}

function Hero() {
  return (
    <section className="py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="space-y-4 text-white">
            <h1 className="text-4xl font-display tracking-tight leading-tight md:text-5xl lg:text-6xl">
              Premium Pet Foods Delivered
            </h1>
            <p className="text-lg text-white/90 md:text-xl">
              Curated products for your furry friends. straight to your door.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                as="a"
                href="/products"
              >
                Shop Bestsellers
              </Button>
              <Button
                size="lg"
                variant="ghost"
                as="a"
                href="/products"
              >
                How It Works
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80"
              alt="Happy dog with food bowl"
              className="h-64 md:h-[500px] w-full rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryShowcase() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group flex h-36 flex-col items-center justify-center rounded-2xl border border-white/30 bg-white/5 px-4 text-center transition-all hover:border-highlight-purple hover:bg-mid-violet/10"
            >
              <span className="text-4xl mb-2">{category.icon}</span>
              <span className="text-base font-semibold text-white">
                {category.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts({ products, loading }) {
  const displayProducts = products.slice(0, 4);

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Featured Products
          </h2>
          <Link
            href="/products"
            className="text-white hover:text-highlight-purple transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center gap-3 text-white/70">
            <Spinner size="sm" />
            <span>Loading products…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl border-2 border-mid-violet overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-purple">
                      {formatPrice(product.price_cents, product.currency)}
                    </p>
                    <Button
                      as="a"
                      href={product.slug ? `/products/${product.slug}` : '#'}
                      className="bg-mid-violet hover:bg-highlight-purple text-white px-4 py-2 rounded-lg text-sm font-semibold"
                      disabled={!product.slug}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ClubMembership() {
  const offers = [
    {
      title: 'Save 30% on gourmet pet beds',
      detail: 'Valid until 2 December 2025',
      image:
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80',
    },
    {
      title: 'Free treats on every 2nd order',
      detail: 'Valid until 15 January 2026',
      image:
        'https://images.unsplash.com/photo-1548199973-0f35fb07c0d7?auto=format&fit=crop&w=300&q=80',
    },
  ];

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white/5 px-6 py-10 shadow-glow md:px-10">
        <div className="grid gap-8 lg:grid-cols-2 xl:gap-12">
          <div className="rounded-3xl bg-[#02292B] p-8 text-white">
            <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-green-300">
              MyPetEats Club
            </div>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl">
              Free to join. Easy to save.
            </h2>
            <p className="mt-4 text-white/80">
              Unlock members-only perks, surprise drops, and curated offers for
              your furry family. Join the club that treats pets like royalty.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                as="a"
                href="/club"
                className="rounded-xl bg-green-500 px-6 py-3 text-base font-semibold text-[#02292B] hover:bg-green-400"
              >
                Sign up for tailored offers
              </Button>
              <Button
                as="a"
                href="/offers"
                className="rounded-xl border border-white/40 px-6 py-3 text-base font-semibold text-white hover:border-white"
              >
                View top offers
              </Button>
            </div>
            <Link
              href="/club"
              className="mt-6 inline-flex items-center text-sm font-semibold text-white/80 underline"
            >
              Learn more
            </Link>
          </div>

          <div className="space-y-4">
            {offers.map((offer, index) => (
              <div
                key={offer.title}
                className="flex items-center justify-between rounded-2xl border border-brand-200 bg-white/80 p-4 text-brand-800"
              >
                <div>
                  <p className="text-sm font-semibold text-green-600">
                    Save {index === 0 ? '30%' : '₹600'}
                  </p>
                  <p className="text-lg font-bold text-brand-800">
                    {offer.title}
                  </p>
                  <p className="text-xs text-brand-500">{offer.detail}</p>
                  <button className="mt-2 text-sm font-semibold text-green-700 underline">
                    Shop now
                  </button>
                </div>
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="ml-4 h-20 w-28 rounded-xl object-cover"
                />
              </div>
            ))}

            <div className="flex items-center justify-between text-white/70">
              <button className="rounded-full border border-white/30 p-2">
                ←
              </button>
              <div className="h-1 flex-1 mx-4 rounded-full bg-white/20">
                <div className="h-full w-1/3 rounded-full bg-green-400" />
              </div>
              <button className="rounded-full border border-white/30 p-2">
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LearnMore() {
  const stories = [
    {
      tag: 'Seasonal',
      title: 'Keeping your cat warm in cooler months',
      description: 'Simple at-home rituals to keep felines cozy without overheating.',
      image:
        'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80',
    },
    {
      tag: 'Training & behaviour',
      title: 'Introducing a new dog to the family',
      description: 'A gentle, week-by-week playbook for smooth transitions.',
      image:
        'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=600&q=80',
    },
    {
      tag: 'Health',
      title: 'Moving home with a dog or puppy',
      description: 'Prep checklists to keep tails wagging during big moves.',
      image:
        'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
    },
    {
      tag: 'Health',
      title: 'Plants that are toxic to dogs',
      description: 'A vetted list of greens to avoid in your living room jungle.',
      image:
        'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">
              Knowledge hub
            </p>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Lots to love. Lots to learn.
            </h2>
          </div>
          <Link
            href="/learn"
            className="text-sm font-semibold text-white underline decoration-white/50 underline-offset-4"
          >
            View more
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stories.map((story) => (
            <div
              key={story.title}
              className="flex h-full flex-col rounded-3xl bg-white text-brand-800 shadow-card"
            >
              <img
                src={story.image}
                alt={story.title}
                className="h-44 w-full rounded-t-3xl object-cover"
              />
              <div className="flex flex-1 flex-col p-5">
                <span className="inline-flex w-fit rounded-full bg-green-200 px-3 py-1 text-xs font-semibold uppercase text-green-900">
                  {story.tag}
                </span>
                <h3 className="mt-3 text-lg font-bold leading-tight text-brand-800">
                  {story.title}
                </h3>
                <p className="mt-2 text-sm text-brand-600">
                  {story.description}
                </p>
                <button className="mt-auto text-sm font-semibold text-green-700 underline">
                  Read more
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-white/70">
          <button className="rounded-full border border-white/30 p-2">←</button>
          <div className="mx-4 h-1 flex-1 rounded-full bg-white/20">
            <div className="h-full w-2/5 rounded-full bg-green-400" />
          </div>
          <button className="rounded-full border border-white/30 p-2">→</button>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const benefits = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      title: 'Quality Products',
      description: 'Only the best for your pets',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: 'Fast Delivery',
      description: 'Quick delivery to your doorstep',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
      ),
      title: 'Vet Approved',
      description: 'Recommended by veterinarians',
    },
  ];

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <h2 className="text-3xl font-bold text-white mb-8 md:text-4xl">
          Why Choose Us
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border-2 border-mid-violet p-6 text-center"
            >
              <div className="flex justify-center mb-4 text-mid-violet">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
