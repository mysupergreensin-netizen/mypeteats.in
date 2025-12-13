import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/layout/AdminLayout';
import SiteLayout from '../../components/layout/SiteLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Heading from '../../components/ui/Heading';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const LOGIN_BACKGROUND =
  'bg-[radial-gradient(circle_at_10%_20%,rgba(161,76,255,.35),transparent_55%),radial-gradient(circle_at_80%_0,rgba(66,10,143,.65),transparent_60%),#0d0216]';

export default function AdminUsers() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [promoteConfirm, setPromoteConfirm] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthed) {
      fetchUsers();
    }
  }, [page, roleFilter, searchQuery, isAuthed]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      const allowedRoles = ['admin', 'super_admin', 'manager', 'staff'];
      if (data.user && allowedRoles.includes(data.user.role)) {
        setUser(data.user);
        setIsAuthed(true);
      } else {
        const stored = sessionStorage.getItem('admin_token');
        if (stored) {
          setToken(stored);
          setIsAuthed(true);
        }
      }
    } catch {
      const stored = sessionStorage.getItem('admin_token');
      if (stored) {
        setToken(stored);
        setIsAuthed(true);
      }
    }
  };

  const fetchUsers = async () => {
    if (!token && !user) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (roleFilter) {
        params.append('role', roleFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      const response = await fetch(`/api/admin/users?${params}`, {
        headers: user ? {} : { 'x-admin-token': token },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setPagination(data.pagination);
      } else if (response.status === 401) {
        sessionStorage.removeItem('admin_token');
        setIsAuthed(false);
        router.push('/admin');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to load users');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    setUpdatingUser(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? {} : { 'x-admin-token': token }),
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        await fetchUsers();
        setSelectedUser(null);
        setPromoteConfirm(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update user');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setUpdatingUser(false);
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
              <p className="text-sm text-purple-100/80">Please log in to access users.</p>
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
        <title>Users · Admin · MyPetEats</title>
      </Head>

      <section className="space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-deep-purple to-mid-violet p-8 text-white shadow-elevated md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">users</p>
            <Heading as="h1" className="text-4xl text-white">
              User Management
            </Heading>
            <p className="text-white/70">
              {pagination?.total || users.length} total users
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
              placeholder="Search by name or email..."
            />
          </div>
          <div className="w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto rounded-2xl border border-border-subtle bg-surface-100 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400/50"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Club Member</th>
                  <th className="px-6 py-3 text-left">Joined</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-purple-50/40">
                    <td className="px-6 py-4 font-medium text-gray-900">{u.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={u.role === 'admin' ? 'danger' : 'neutral'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {u.clubMember ? (
                        <Badge variant="success">Yes</Badge>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      {u.role !== 'admin' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setPromoteConfirm(u)}
                        >
                          Promote to Admin
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(u)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && !loading && (
            <p className="px-6 py-12 text-center text-gray-500">
              {searchQuery || roleFilter ? 'No users found matching your filters.' : 'No users yet.'}
            </p>
          )}
          {loading && (
            <div className="px-6 py-12 text-center text-gray-500 flex items-center justify-center gap-3">
              <Spinner size="sm" />
              <span>Loading users…</span>
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

        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onRoleUpdate={handleRoleUpdate}
            updating={updatingUser}
          />
        )}

        {promoteConfirm && (
          <ConfirmationModal
            isOpen={!!promoteConfirm}
            onClose={() => setPromoteConfirm(null)}
            onConfirm={() => handleRoleUpdate(promoteConfirm._id, 'admin')}
            title="Promote to Admin"
            message={`Are you sure you want to promote "${promoteConfirm.name || promoteConfirm.email}" to admin? They will have full access to the admin panel.`}
            confirmText="Promote"
            cancelText="Cancel"
            variant="default"
            loading={updatingUser}
          />
        )}
      </section>
    </AdminLayout>
  );
}

AdminUsers.getLayout = (page) => page;

function UserDetailModal({ user, onClose, onRoleUpdate, updating }) {
  const [role, setRole] = useState(user.role);
  const [clubMember, setClubMember] = useState(user.clubMember || false);

  const handleUpdate = async () => {
    await onRoleUpdate(user._id, role);
    // Also update clubMember if needed
    if (clubMember !== user.clubMember) {
      try {
        const response = await fetch(`/api/admin/users/${user._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clubMember }),
        });
        if (response.ok) {
          // Refresh will happen in parent
        }
      } catch (err) {
        console.error('Failed to update club member status:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-8 shadow-elevated">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">User Details</p>
            <Heading as="h2" className="text-3xl text-deep-purple">
              {user.name || 'User'}
            </Heading>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </header>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-white/60 mb-1">Email</p>
            <p className="text-white">{user.email}</p>
          </div>

          {user.phone && (
            <div>
              <p className="text-sm text-white/60 mb-1">Phone</p>
              <p className="text-white">{user.phone}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-2xl border border-border-subtle bg-surface-100 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400/50"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="inline-flex items-center space-x-3 text-sm text-white/80">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300 text-mid-violet focus:ring-mid-violet"
                checked={clubMember}
                onChange={(e) => setClubMember(e.target.checked)}
              />
              <span>Club Member</span>
            </label>
          </div>

          <div>
            <p className="text-sm text-white/60 mb-1">Joined</p>
            <p className="text-white">
              {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

