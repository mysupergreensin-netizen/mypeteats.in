import Head from 'next/head';
import Link from 'next/link';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const articles = [
  {
    tag: 'Seasonal',
    title: 'Keeping your cat warm in cooler months',
    description: 'Simple at-home rituals to keep felines cozy without overheating.',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80',
    slug: 'keeping-cat-warm',
  },
  {
    tag: 'Training & behaviour',
    title: 'Introducing a new dog to the family',
    description: 'A gentle, week-by-week playbook for smooth transitions.',
    image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=600&q=80',
    slug: 'introducing-new-dog',
  },
  {
    tag: 'Health',
    title: 'Moving home with a dog or puppy',
    description: 'Prep checklists to keep tails wagging during big moves.',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
    slug: 'moving-with-dog',
  },
  {
    tag: 'Health',
    title: 'Plants that are toxic to dogs',
    description: 'A vetted list of greens to avoid in your living room jungle.',
    image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=600&q=80',
    slug: 'toxic-plants-dogs',
  },
  {
    tag: 'Nutrition',
    title: 'Understanding pet food labels',
    description: 'Learn how to read and understand what\'s really in your pet\'s food.',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80',
    slug: 'pet-food-labels',
  },
  {
    tag: 'Training & behaviour',
    title: 'House training your puppy',
    description: 'Effective strategies for successful potty training.',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
    slug: 'house-training-puppy',
  },
];

export default function LearnPage() {
  return (
    <>
      <Head>
        <title>Learn · MyPetEats</title>
        <meta
          name="description"
          content="Expert advice and tips for pet care, nutrition, training, and health."
        />
      </Head>
      <div className="space-y-10 py-10">
        <div className="text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-white/50">
            Knowledge hub
          </p>
          <h1 className="text-4xl font-display tracking-tight text-white md:text-5xl">
            Lots to love. Lots to learn.
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Expert advice, tips, and guides to help you care for your furry friends.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Card key={article.slug} className="flex flex-col h-full">
              <img
                src={article.image}
                alt={article.title}
                className="h-48 w-full rounded-t-3xl object-cover"
              />
              <div className="flex flex-1 flex-col p-5">
                <span className="inline-flex w-fit rounded-full bg-green-200 px-3 py-1 text-xs font-semibold uppercase text-green-900 mb-3">
                  {article.tag}
                </span>
                <h3 className="text-lg font-bold leading-tight text-brand-700 mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-brand-600 mb-4 flex-1">
                  {article.description}
                </p>
                <Button
                  as="a"
                  href={`/learn/${article.slug}`}
                  variant="ghost"
                  className="w-full !text-brand-600 hover:!text-brand-700"
                >
                  Read more
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

