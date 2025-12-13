import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import Heading from '../../components/ui/Heading';
import Card from '../../components/ui/Card';

export default function AdminCalendar() {
  return (
    <AdminLayout>
      <Head>
        <title>Calendar · Admin · MyPetEats</title>
      </Head>
      <section className="space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-deep-purple to-mid-violet p-8 text-white shadow-elevated">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">planning</p>
            <Heading as="h1" className="text-4xl text-white">
              Calendar
            </Heading>
            <p className="text-white/70">Plan launches, campaigns, and reminders.</p>
          </div>
        </header>

        <Card className="p-6">
          <p className="text-sm text-white/70">
            This calendar view is a placeholder where you can later integrate real events, order fulfilment schedules,
            or marketing campaigns.
          </p>
        </Card>
      </section>
    </AdminLayout>
  );
}

AdminCalendar.getLayout = (page) => page;


