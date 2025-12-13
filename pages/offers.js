import Head from 'next/head';
import Link from 'next/link';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const offers = [
  {
    id: 'offer-1',
    title: 'Save 30% on gourmet pet beds',
    description: 'Premium comfort for your furry friends. Limited time offer.',
    discount: '30% OFF',
    validUntil: '2 December 2025',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80',
    category: 'Beds & Accessories',
  },
  {
    id: 'offer-2',
    title: 'Free treats on every 2nd order',
    description: 'Get complimentary treats with your second order. No code needed.',
    discount: 'FREE',
    validUntil: '15 January 2026',
    image: 'https://images.unsplash.com/photo-1548199973-0f35fb07c0d7?auto=format&fit=crop&w=300&q=80',
    category: 'Treats',
  },
  {
    id: 'offer-3',
    title: 'Buy 2 Get 1 Free on Premium Food',
    description: 'Stock up on premium pet food with our special bundle offer.',
    discount: '33% OFF',
    validUntil: '31 December 2025',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=300&q=80',
    category: 'Premium Food',
  },
];

export default function OffersPage() {
  return (
    <>
      <Head>
        <title>Special Offers · MyPetEats</title>
        <meta
          name="description"
          content="Exclusive offers and discounts on premium pet products."
        />
      </Head>
      <div className="space-y-10 py-10">
        <div className="text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">
            exclusive deals
          </p>
          <h1 className="text-4xl font-display tracking-tight text-white md:text-5xl">
            Special Offers
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Limited time offers and exclusive discounts for our customers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <Card key={offer.id} className="flex flex-col h-full">
              <div className="relative">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="h-48 w-full rounded-t-3xl object-cover"
                />
                <Badge
                  variant="success"
                  className="absolute top-4 right-4 text-lg font-bold"
                >
                  {offer.discount}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">
                  {offer.category}
                </span>
                <h3 className="text-xl font-bold leading-tight text-brand-800 mb-2">
                  {offer.title}
                </h3>
                <p className="text-sm text-brand-600 mb-4 flex-1">
                  {offer.description}
                </p>
                <div className="space-y-3">
                  <p className="text-xs text-brand-500">
                    Valid until: {offer.validUntil}
                  </p>
                  <Button
                    as="a"
                    href="/products"
                    className="w-full"
                  >
                    Shop Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-brand-600/20 to-brand-800/20 border-brand-500/30 text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Join MyPetEats Club
          </h2>
          <p className="text-white/70 mb-6">
            Get access to exclusive member-only offers and early access to new products.
          </p>
          <Button as={Link} href="/club" size="lg">
            Join Now - Free
          </Button>
        </Card>
      </div>
    </>
  );
}

