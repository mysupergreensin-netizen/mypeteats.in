import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import Heading from '../../components/ui/Heading';
import Card from '../../components/ui/Card';

export default function AdminCoupons() {
  return (
    <AdminLayout>
      <Head>
        <title>Coupons · Admin · MyPetEats</title>
      </Head>
      <section className="space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-deep-purple to-mid-violet p-8 text-white shadow-elevated">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">promotions</p>
            <Heading as="h1" className="text-4xl text-white">
              Coupons
            </Heading>
            <p className="text-white/70">Create and manage discount codes (UI placeholder).</p>
          </div>
        </header>

        <Card className="p-6">
          <p className="text-sm text-white/70">
            When you are ready, this page can be wired to a `Coupon` collection to manage code, type, value, expiry
            date, and usage limits.
          </p>
        </Card>
      </section>
    </AdminLayout>
  );
}

AdminCoupons.getLayout = (page) => page;


