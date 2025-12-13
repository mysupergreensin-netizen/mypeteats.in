import Link from 'next/link';
import { useRouter } from 'next/router';
import Heading from '../ui/Heading';
import Button from '../ui/Button';
import { cn } from '../../lib/cn';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/products', label: 'Products' },
    { path: '/admin/orders', label: 'Orders' },
    { path: '/admin/clients', label: 'Clients' },
    { path: '/admin/chats', label: 'Chats' },
    { path: '/admin/email', label: 'Email' },
    { path: '/admin/invoices', label: 'Invoices' },
    { path: '/admin/calendar', label: 'Calendar' },
    { path: '/admin/coupons', label: 'Coupons' },
    { path: '/admin/settings', label: 'Settings' },
    { path: '/admin/profile', label: 'Profile' },
    { path: '/admin/users', label: 'Admin Users' },
  ];

  return (
    <div className="min-h-screen bg-slate text-white flex">
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-white/10 bg-slate/95 backdrop-blur-xl">
        <div className="px-6 py-6 border-b border-white/10">
          <Link href="/admin/dashboard" className="space-y-1 block">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">
              mypeteats
            </p>
            <Heading as="h3" className="text-2xl text-white">
              Admin Console
            </Heading>
          </Link>
          <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-white/40">
            secure area
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = currentPath === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <button
                  type="button"
                  className={cn(
                    'w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors h-10',
                    active
                      ? 'bg-brand-500 text-white shadow-elevated'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <span>{item.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-4 border-t border-white/10 text-xs text-white/40">
          <p>© {new Date().getFullYear()} MyPetEats</p>
          <p className="mt-1">Admin dashboard</p>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="flex-1 flex flex-col">
        <nav className="md:hidden sticky top-0 z-40 border-b border-white/10 bg-slate/90 backdrop-blur-xl">
          <div className="px-4 py-4 flex items-center justify-between">
            <Link href="/admin/dashboard" className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                mypeteats
              </p>
              <Heading as="h3" className="text-lg text-white">
                Admin
              </Heading>
            </Link>
          </div>
          <div className="px-2 pb-3 flex gap-2 overflow-x-auto">
            {navItems.slice(0, 5).map((item) => {
              const active = currentPath === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={active ? 'primary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'whitespace-nowrap',
                      active && 'pointer-events-none'
                    )}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}

