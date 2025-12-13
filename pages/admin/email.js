import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import Heading from '../../components/ui/Heading';
import Card from '../../components/ui/Card';

export default function AdminEmail() {
  return (
    <AdminLayout>
      <Head>
        <title>Email · Admin · MyPetEats</title>
      </Head>
      <section className="space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-deep-purple to-mid-violet p-8 text-white shadow-elevated">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">communication</p>
            <Heading as="h1" className="text-4xl text-white">
              Email Center
            </Heading>
            <p className="text-white/70">Plan transactional and campaign emails (placeholder for now).</p>
          </div>
        </header>

        <Card className="p-6 space-y-4">
          <p className="text-sm text-white/70">
            This page is ready for integrating with your preferred email provider (e.g. Resend, SendGrid, Mailchimp).
          </p>
          <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
            <li>Show recent transactional emails for orders and shipping.</li>
            <li>Segment customers into lists for campaigns.</li>
            <li>Preview and schedule email templates.</li>
          </ul>
        </Card>
      </section>
    </AdminLayout>
  );
}

AdminEmail.getLayout = (page) => page;


