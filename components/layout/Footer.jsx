import Link from 'next/link';

const sections = {
  Shop: [
    { label: 'All Products', href: '/products' },
    { label: 'Supplements', href: '/products?category=supplements' },
    { label: 'Treats', href: '/products?category=treats' },
  ],
  Company: [
    { label: 'About', href: '/#about' },
    { label: 'Stories', href: '/learn' },
    { label: 'Wholesale', href: '/contact' },
  ],
  Support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
    { label: 'Shipping & Returns', href: '/shipping' },
  ],
};

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-purple/80 backdrop-blur-2xl">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4 md:px-10">
        <div>
          <p className="text-2xl font-display text-white">mypeteats</p>
          <p className="mt-4 text-sm text-white/60">
            Dehydrated microgreens engineered for peak pet health and joyful
            wagging tails.
          </p>
          <p className="mt-6 text-xs text-white/40">
            © {new Date().getFullYear()} MyPetEats. All rights reserved.
          </p>
        </div>
        {Object.entries(sections).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white/60">
              {title}
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              {links.map((link) => (
                <li 
                  key={link.label}
                  className="text-[#02292b] bg-white border-2 border-[#969696] w-[100px] ml-2 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] align-middle mb-0.5"
                >
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}


