import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import Heading from '../../components/ui/Heading';
import Card from '../../components/ui/Card';

export default function AdminSettings() {
  return (
    <AdminLayout>
      <Head>
        <title>Settings · Admin · MyPetEats</title>
      </Head>
      <section className="space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-deep-purple to-mid-violet p-8 text-white shadow-elevated">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">system</p>
            <Heading as="h1" className="text-4xl text-white">
              Settings
            </Heading>
            <p className="text-white/70">Global configuration for your MyPetEats store (placeholder).</p>
          </div>
        </header>

        <Card className="p-6 space-y-3">
          <p className="text-sm text-white/70">
            Use this page later for store-wide settings like tax rates, shipping rules, payment keys, and branding
            options. For now it provides the structure for your admin navigation.
          </p>
        </Card>
      </section>
    </AdminLayout>
  );
}

AdminSettings.getLayout = (page) => page;


