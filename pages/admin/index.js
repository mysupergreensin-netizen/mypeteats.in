import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/layout/AdminLayout';
import SiteLayout from '../../components/layout/SiteLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Heading from '../../components/ui/Heading';

const LOGIN_BACKGROUND =
  'bg-[radial-gradient(circle_at_10%_20%,rgba(161,76,255,.35),transparent_55%),radial-gradient(circle_at_80%_0,rgba(66,10,143,.65),transparent_60%),#0d0216]';

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to load products');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Check if user is already authenticated
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const allowedRoles = ['admin', 'super_admin', 'manager', 'staff'];
        if (data.user && allowedRoles.includes(data.user.role)) {
          setUser(data.user);
          setIsAuthed(true);
        }
      })
      .catch(() => {
        // Not authenticated, show login form
      });
  }, []);

  useEffect(() => {
    if (user && isAuthed) {
      fetchProducts();
    }
  }, [user, isAuthed]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user is admin
        if (data.user && data.user.role === 'admin') {
          setUser(data.user);
          setIsAuthed(true);
          // Redirect to dashboard
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/dashboard';
          }
        } else {
          setError('Access denied. Admin privileges required.');
          // Clear auth cookie if not admin
          await fetch('/api/auth/logout', { method: 'POST' });
        }
      } else {
        setError(data.error || 'Invalid username or password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthed(false);
      setProducts([]);
      setUser(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchProducts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete product');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (payload) => {
    const endpoint = editingProduct
      ? `/api/admin/products/${editingProduct._id}`
      : '/api/admin/products';
    const method = editingProduct ? 'PUT' : 'POST';

    setLoading(true);
    setError('');
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setShowForm(false);
        setEditingProduct(null);
        await fetchProducts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save product');
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
              <p className="text-sm text-brand-600">Sign in with your admin account.</p>
            </header>
            <form className="space-y-4" onSubmit={handleLogin}>
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                variant="light"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                variant="light"
              />
              {error && (
                <p className="rounded-2xl bg-red-500/25 px-4 py-2 text-sm text-red-50">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </Card>
        </div>
      </SiteLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Admin · MyPetEats</title>
      </Head>

      <section className="space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-deep-purple to-mid-violet p-8 text-white shadow-elevated md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">inventory</p>
            <Heading as="h1" className="text-4xl text-white">
              Product Control
            </Heading>
            <p className="text-white/70">
              {products.length} total · {products.filter((item) => item.published).length} published
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
            >
              + New Product
            </Button>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-50">
            {error}
          </div>
        )}

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3 text-left">SKU</th>
                  <th className="px-6 py-3 text-left">Product</th>
                  <th className="px-6 py-3 text-left">Price</th>
                  <th className="px-6 py-3 text-left">Inventory</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-purple-50/40">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{product.sku}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{product.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-mid-violet">
                      {(product.price_cents / 100).toLocaleString('en-IN', {
                        style: 'currency',
                        currency: product.currency || 'INR',
                        minimumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-6 py-4">{product.inventory}</td>
                    <td className="px-6 py-4">
                      <Badge variant={product.published ? 'success' : 'warning'}>
                        {product.published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && !loading && (
            <p className="px-6 py-12 text-center text-gray-500">
              No products yet. Add your first ritual above.
            </p>
          )}
          {loading && (
            <div className="px-6 py-12 text-center text-gray-500 flex items-center justify-center gap-3">
              <Spinner size="sm" />
              <span>Syncing inventory…</span>
            </div>
          )}
        </Card>

        {showForm && (
          <ProductForm
            key={editingProduct?._id || 'new'}
            product={editingProduct}
            onClose={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            onSubmit={handleSave}
          />
        )}
      </section>
    </AdminLayout>
  );
}

AdminPage.getLayout = (page) => page;

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

function ProductForm({ product, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    title: product?.title || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product ? (product.price_cents / 100).toFixed(2) : '',
    currency: product?.currency || 'INR',
    inventory: product?.inventory || 0,
    images: product?.images || [],
    categories: product?.categories || [],
    published: Boolean(product?.published),
  });
  const [localError, setLocalError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check total count
    if (formData.images.length + files.length > MAX_IMAGES) {
      setUploadError(`You can upload a maximum of ${MAX_IMAGES} images per product. You currently have ${formData.images.length} image(s).`);
      event.target.value = '';
      return;
    }

    // Validate files
    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
        setUploadError(`"${file.name}" is not a valid image. Only JPEG or PNG images are allowed.`);
        event.target.value = '';
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`"${file.name}" exceeds the 5MB size limit.`);
        event.target.value = '';
        return;
      }
    }

    setUploadError('');
    setUploading(true);

    try {
      const form = new FormData();
      files.forEach((file) => form.append('image', file));

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data.error ||
          (response.status === 401 || response.status === 403
            ? 'Not authorized to upload images. Please sign in again.'
            : 'Failed to upload image');
        setUploadError(message);
      } else {
        const urls = data.urls || (data.url ? [data.url] : []);
        if (urls.length === 0) {
          setUploadError('Upload succeeded but no URL was returned.');
        } else {
          const newImages = [...formData.images, ...urls].slice(0, MAX_IMAGES);
          setFormData((prev) => ({ ...prev, images: newImages }));
        }
      }
    } catch {
      setUploadError('Network error while uploading image');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setLocalError('');

    const payload = {
      sku: formData.sku.trim(),
      title: formData.title.trim(),
      slug: formData.slug.trim() || undefined,
      description: formData.description.trim(),
      price_cents: Math.round(parseFloat(formData.price || '0') * 100),
      currency: formData.currency.trim().toUpperCase() || 'INR',
      inventory: Number.parseInt(formData.inventory, 10) || 0,
      images: formData.images.filter(Boolean),
      categories: formData.categories.filter(Boolean),
      published: Boolean(formData.published),
    };

    if (payload.price_cents < 0) {
      setLocalError('Price must be positive');
      return;
    }

    if (payload.sku.length === 0) {
      setLocalError('SKU is required');
      return;
    }

    if (payload.title.length === 0) {
      setLocalError('Title is required');
      return;
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-8 shadow-elevated">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-600">
              {product ? 'Edit product' : 'Create product'}
            </p>
            <Heading as="h2" className="text-3xl text-deep-purple">
              {product ? 'Update Ritual' : 'New Ritual'}
            </Heading>
          </div>
          <Button
            variant="ghost"
            className="text-brand-600 hover:text-brand-700"
            onClick={onClose}
          >
            Close
          </Button>
        </header>

        <form className="space-y-6 pt-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="SKU" value={formData.sku} onChange={handleChange('sku')} required />
            <Input label="Title" value={formData.title} onChange={handleChange('title')} required />
          </div>

          <Input
            label="Slug (optional)"
            helper="Leave blank to auto-generate"
            value={formData.slug}
            onChange={handleChange('slug')}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Price (currency units)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange('price')}
              required
            />
            <Input
              label="Currency"
              maxLength={3}
              value={formData.currency}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  currency: event.target.value.toUpperCase(),
                }))
              }
            />
            <Input
              label="Inventory"
              type="number"
              min="0"
              value={formData.inventory}
              onChange={handleChange('inventory')}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                Images ({formData.images.length}/{MAX_IMAGES})
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                size="sm"
                variant="primary"
                disabled={uploading || formData.images.length >= MAX_IMAGES}
                onClick={() => fileInputRef.current?.click()}
                className="bg-brand-500 hover:bg-brand-600 text-white"
              >
                {uploading ? 'Uploading…' : formData.images.length >= MAX_IMAGES ? 'Maximum reached' : 'Upload Images'}
              </Button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {formData.images.length === 0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-sm text-gray-500">No images uploaded yet</p>
                <p className="text-xs text-gray-400 mt-1">Upload up to {MAX_IMAGES} JPEG or PNG images</p>
              </div>
            )}

            {uploadError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-xs text-red-600">{uploadError}</p>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Categories"
              helper="Comma separated (e.g., Food, Treats, Toys)"
              value={formData.categories.join(', ')}
              onChange={(event) => {
                const categories = event.target.value
                  .split(',')
                  .map((c) => c.trim())
                  .filter(Boolean);
                setFormData((prev) => ({ ...prev, categories }));
              }}
            />
          </div>

          <label className="inline-flex items-center space-x-3 text-sm text-gray-600">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-gray-300 text-mid-violet focus:ring-mid-violet"
              checked={formData.published}
              onChange={handleChange('published')}
            />
            <span>Published</span>
          </label>

          {localError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
              {localError}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{product ? 'Save Changes' : 'Create Product'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}


