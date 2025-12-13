import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/layout/AdminLayout';
import SiteLayout from '../../components/layout/SiteLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Heading from '../../components/ui/Heading';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';

const LOGIN_BACKGROUND =
  'bg-[radial-gradient(circle_at_10%_20%,rgba(161,76,255,.35),transparent_55%),radial-gradient(circle_at_80%_0,rgba(66,10,143,.65),transparent_60%),#0d0216]';

export default function AdminClients() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthed) {
      fetchClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, isAuthed]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      const allowedRoles = ['admin', 'super_admin', 'manager', 'staff'];
      if (data.user && allowedRoles.includes(data.user.role)) {
        setUser(data.user);
        setIsAuthed(true);
      }
    } catch {
      // ignore
    }
  };

  const fetchClients = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        role: 'customer',
      });
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data.users || []);
        setPagination(data.pagination);
      } else if (response.status === 401) {
        setIsAuthed(false);
        router.push('/admin');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to load clients');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthed) {
    return (
      <SiteLayout>
        <Head>
          <title>Admin Login · MyPetEats</title>
        </Head>
        <div className={`min-h-screen flex items-center justify-center px-4 py-20 text-white ${LOGIN_BACKGROUND}`}>
          <Card className="w-full max-w-md space-y-6 rounded-3xl border border-brand-200 bg-white/95 p-8 shadow-elevated backdrop-blur-xl">
            <header className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-brand-600">secure portal</p>
              <Heading as="h2" className="text-brand-700">
                Admin Console
              </Heading>
              <p className="text-sm text-purple-100/80">Please log in to access clients.</p>
            </header>
            <Button onClick={() => router.push('/admin')} className="w-full">
              Go to Login
            </Button>
          </Card>
        </div>
      </SiteLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Clients · Admin · MyPetEats</title>
      </Head>

      <section className="space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-deep-purple to-mid-violet p-8 text-white shadow-elevated md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">clients</p>
            <Heading as="h1" className="text-4xl text-white">
              Client Directory
            </Heading>
            <p className="text-white/70">
              {pagination?.total || clients.length} total customers
            </p>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-50">
            {error}
          </div>
        )}

        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search clients by name or email..."
            />
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Club Member</th>
                  <th className="px-6 py-3 text-left">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm">
                {clients.map((c) => (
                  <tr key={c._id} className="hover:bg-purple-50/40">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{c.email}</td>
                    <td className="px-6 py-4 text-gray-600">{c.phone || '—'}</td>
                    <td className="px-6 py-4">
                      {c.clubMember ? (
                        <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                          Club
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {clients.length === 0 && !loading && (
            <p className="px-6 py-12 text-center text-gray-500">
              {searchQuery ? 'No clients found matching your search.' : 'No clients yet.'}
            </p>
          )}
          {loading && (
            <div className="px-6 py-12 text-center text-gray-500 flex items-center justify-center gap-3">
              <Spinner size="sm" />
              <span>Loading clients…</span>
            </div>
          )}
        </Card>

        {pagination && pagination.pages > 1 && (
          <Pagination
            page={page}
            totalPages={pagination.pages}
            onPageChange={setPage}
            limit={pagination.limit}
            total={pagination.total}
          />
        )}
      </section>
    </AdminLayout>
  );
}

AdminClients.getLayout = (page) => page;


