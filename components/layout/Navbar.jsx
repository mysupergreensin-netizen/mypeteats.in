import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import Logo from '../ui/Logo';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/learn', label: 'Learn' },
];

const iconLinks = [
  {
    label: 'Search',
    href: '/search',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    ),
  },
  {
    label: 'Cart',
    href: '/cart',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2m0 0h13.2l-1.8 9H6.6m-1.2-9L5.4 5m1.2 9h11.4m-11.4 0a2 2 0 100 4 2 2 0 000-4zm11.4 0a2 2 0 110 4 2 2 0 010-4z"
      />
    ),
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { user, loading } = useAuth();
  const { count } = useCart();

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-2xl bg-purple/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 md:px-10">
        <Logo size="default" />

        <nav className="hidden items-center space-x-8 text-sm font-semibold text-white/80 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center space-x-3 md:flex">
          {iconLinks.map(({ label, href, icon }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className="relative rounded-full border border-white/20 p-2 text-white transition hover:border-white hover:text-highlight-purple"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {icon}
              </svg>
              {label === 'Cart' && count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-highlight-purple text-xs font-bold text-white">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          ))}
          {!loading && (
            <>
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="rounded-full border border-white/20 p-2 text-white transition hover:border-white hover:text-highlight-purple flex items-center gap-2"
                    aria-label="User menu"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-8 7a7 7 0 00-7 7h18a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="text-sm font-medium hidden lg:inline">
                      {user.name || user.email?.split('@')[0]}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-surface-200 backdrop-blur-xl shadow-elevated z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-semibold text-white">{user.name || 'User'}</p>
                        <p className="text-xs text-white/60 truncate">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          href="/club"
                          className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Club Membership
                        </Link>
                        <Link
                          href="/profile?tab=orders"
                          className="block px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Orders
                        </Link>
                      </div>
                      <div className="border-t border-white/10 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  aria-label="Login"
                  className="rounded-full border border-white/20 p-2 text-white transition hover:border-white hover:text-highlight-purple"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-8 7a7 7 0 00-7 7h18a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
              )}
            </>
          )}
        </div>

        <button
          className="text-white md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 bg-purple/95 px-6 py-4 md:hidden">
          <nav className="space-y-4 text-white/90">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center space-x-4">
            {iconLinks.map(({ label, href, icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="relative rounded-full border border-white/20 p-2 text-white transition hover:border-white hover:text-highlight-purple"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {icon}
                </svg>
                {label === 'Cart' && count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-highlight-purple text-xs font-bold text-white">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Link>
            ))}
            {!loading && (
              <>
                {user ? (
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 rounded-xl text-white/90 hover:bg-white/5 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/club"
                      className="block px-4 py-2 rounded-xl text-white/90 hover:bg-white/5 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Club Membership
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 rounded-xl text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="block px-4 py-2 rounded-xl text-white/90 hover:bg-white/5 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}


