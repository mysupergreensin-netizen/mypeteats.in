import '../styles/globals.css';
import SiteLayout from '../components/layout/SiteLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import { CartProvider } from '../contexts/CartContext';

export default function App({ Component, pageProps }) {
  const getLayout =
    Component.getLayout || ((page) => <SiteLayout>{page}</SiteLayout>);

  return (
    <ErrorBoundary>
      <CartProvider>
        {getLayout(<Component {...pageProps} />)}
      </CartProvider>
    </ErrorBoundary>
  );
}

