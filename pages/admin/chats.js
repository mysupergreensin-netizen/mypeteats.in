import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import Heading from '../../components/ui/Heading';
import Card from '../../components/ui/Card';

export default function AdminChats() {
  return (
    <AdminLayout>
      <Head>
        <title>Chats · Admin · MyPetEats</title>
      </Head>
      <section className="space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-deep-purple to-mid-violet p-8 text-white shadow-elevated">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">communication</p>
            <Heading as="h1" className="text-4xl text-white">
              Chats
            </Heading>
            <p className="text-white/70">Central place for customer conversations (coming soon).</p>
          </div>
        </header>

        <Card className="p-6">
          <p className="text-sm text-white/70">
            This section will show live and historical chats with customers, including filters by status and
            priority. For now, it&apos;s a design placeholder so your navigation is complete.
          </p>
        </Card>
      </section>
    </AdminLayout>
  );
}

AdminChats.getLayout = (page) => page;


