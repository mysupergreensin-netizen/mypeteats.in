import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import Heading from '../../components/ui/Heading';
import Card from '../../components/ui/Card';

export default function AdminInvoices() {
  return (
    <AdminLayout>
      <Head>
        <title>Invoices · Admin · MyPetEats</title>
      </Head>
      <section className="space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-deep-purple to-mid-violet p-8 text-white shadow-elevated">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">billing</p>
            <Heading as="h1" className="text-4xl text-white">
              Invoices
            </Heading>
            <p className="text-white/70">Track invoices generated from orders and payments.</p>
          </div>
        </header>

        <Card className="p-6">
          <p className="text-sm text-white/70">
            In a future iteration, this page can list invoices generated from each completed order, with download
            links and GST details. For now, it completes the navigation and layout, ready to be wired to data.
          </p>
        </Card>
      </section>
    </AdminLayout>
  );
}

AdminInvoices.getLayout = (page) => page;


