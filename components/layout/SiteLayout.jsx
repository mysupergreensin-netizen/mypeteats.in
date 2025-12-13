import Navbar from './Navbar';
import Footer from './Footer';

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-hero-gradient opacity-40 blur-3xl" />
      <div className="absolute right-0 top-1/2 h-96 w-96 rounded-full bg-card-gradient opacity-30 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-72 w-full bg-gradient-to-t from-slate via-transparent to-transparent" />
    </div>
  );
}

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-screen text-white border border-black shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl">
        {children}
      </main>
      <Footer />
    </div>
  );
}


