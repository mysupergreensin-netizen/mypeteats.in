import Head from 'next/head';
import Link from 'next/link';
import Button from '../components/ui/Button';

export default function ServerError() {
  return (
    <>
      <Head>
        <title>500 - Server Error · MyPetEats</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <h1 className="text-6xl font-bold text-white">500</h1>
        <h2 className="text-2xl font-display text-white">Server Error</h2>
        <p className="text-white/70 max-w-md">
          Something went wrong on our end. We're working to fix it. Please try again later.
        </p>
        <div className="flex gap-4">
          <Button as={Link} href="/">
            Go Home
          </Button>
          <Button onClick={() => window.location.reload()} variant="ghost">
            Reload Page
          </Button>
        </div>
      </div>
    </>
  );
}

