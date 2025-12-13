export const mockProducts = [
  {
    _id: '1',
    slug: 'dehydrated-microgreens-dog',
    sku: 'PET-GREEN-001',
    title: 'Dehydrated Microgreens - Canine Vitality',
    price_cents: 24900,
    currency: 'INR',
    inventory: 120,
    description:
      'Powered by spirulina, moringa, and flaxseed to support digestion, coat shine, and immunity.',
    categories: ['food', 'greens'],
    images: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518378188025-22bd89516ee2?auto=format&fit=crop&w=900&q=80',
    ],
    attributes: {
      servings: '30 scoops',
      protein: '12g',
      kcal: '180/serving',
    },
  },
  {
    _id: '2',
    slug: 'glow-supplement-cats',
    sku: 'PET-GLOW-014',
    title: 'Glow Boost Supplement - Feline Radiance',
    price_cents: 19900,
    currency: 'INR',
    inventory: 80,
    description:
      'Omega-rich blend with chamomile and barley grass to calm anxiety and reduce hair fall.',
    categories: ['supplements', 'cats'],
    images: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
    ],
    attributes: {
      servings: '20 sachets',
      omega3: '600mg',
    },
  },
  {
    _id: '3',
    slug: 'mobility-chews',
    sku: 'PET-MOVE-301',
    title: 'Mobility Gummy Chews - Joint Care',
    price_cents: 28900,
    currency: 'INR',
    inventory: 56,
    description:
      'Collagen peptides, turmeric and adaptogens to keep senior pets agile and playful.',
    categories: ['treats', 'mobility'],
    images: [
      'https://images.unsplash.com/photo-1548199973-0f35fb07c0d7?auto=format&fit=crop&w=900&q=80',
    ],
    attributes: {
      servings: '45 chews',
      collagen: '5g',
    },
  },
  {
    _id: '4',
    slug: 'organic-dog-biscuits',
    sku: 'PET-BISC-401',
    title: 'Organic Dog Biscuits',
    price_cents: 29900,
    currency: 'INR',
    inventory: 90,
    description:
      'Natural, grain-free biscuits made with organic ingredients for healthy snacking.',
    categories: ['food', 'treats'],
    images: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=80',
    ],
    attributes: {
      servings: '50 biscuits',
      grainFree: 'Yes',
    },
  },
];

export const categories = [
  { id: 'food', title: 'Food', icon: '🍽️' },
  { id: 'toys', title: 'Toys', icon: '🦴' },
  { id: 'grooming', title: 'Grooming', icon: '🧴' },
  { id: 'accessories', title: 'Accessories', icon: '🦮' },
];

export const testimonials = [
  {
    quote:
      'Our labrador’s shedding reduced by 60% in two weeks. The glow and energy are unreal.',
    author: 'Ananya · Bengaluru',
  },
  {
    quote:
      'Finally a supplement that mixes with wet food without drama. She licks the bowl clean.',
    author: 'Rahul · Mumbai',
  },
  {
    quote: 'Subscription keeps us on track. Deliveries are cold-packed and precise.',
    author: 'Sonia · New Delhi',
  },
];


