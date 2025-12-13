import Head from 'next/head';
import Link from 'next/link';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found · MyPetEats</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <h1 className="text-6xl font-bold text-white">404</h1>
        <h2 className="text-2xl font-display text-white">Page Not Found</h2>
        <p className="text-white/70 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4">
          <Button as={Link} href="/">
            Go Home
          </Button>
          <Button as={Link} href="/products" variant="ghost">
            Browse Products
          </Button>
        </div>
      </div>
    </>
  );
}

