import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Button from '../components/ui/Button';

function Error({ statusCode }) {
  return (
    <>
      <Head>
        <title>
          {statusCode ? `${statusCode} - Error` : 'Error'} · MyPetEats
        </title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <h1 className="text-6xl font-bold text-white">
          {statusCode || 'Error'}
        </h1>
        <h2 className="text-2xl font-display text-white">
          {statusCode === 404
            ? 'Page Not Found'
            : statusCode === 500
            ? 'Server Error'
            : 'An Error Occurred'}
        </h2>
        <p className="text-white/70 max-w-md">
          {statusCode === 404
            ? "The page you're looking for doesn't exist or has been moved."
            : statusCode === 500
            ? "Something went wrong on our end. We're working to fix it."
            : 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-4">
          <Button as={Link} href="/">
            Go Home
          </Button>
          {statusCode !== 404 && (
            <Button onClick={() => window.location.reload()} variant="ghost">
              Reload Page
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;

