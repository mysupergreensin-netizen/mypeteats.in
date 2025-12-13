import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/layout/AdminLayout';
import SiteLayout from '../../components/layout/SiteLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Heading from '../../components/ui/Heading';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import ConfirmationModal from '../../components/ui/ConfirmationModal';

const LOGIN_BACKGROUND =
  'bg-[radial-gradient(circle_at_10%_20%,rgba(161,76,255,.35),transparent_55%),radial-gradient(circle_at_80%_0,rgba(66,10,143,.65),transparent_60%),#0d0216]';

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export default function AdminProducts() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const totalVisibleInventory = products.reduce(
    (sum, product) => sum + (Number(product.inventory) || 0),
    0
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthed) {
      fetchProducts();
    }
  }, [page, searchQuery, isAuthed]);

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

  const getAuthHeaders = () => {
    return user ? {} : { 'x-admin-token': token };
  };

  const fetchProducts = async () => {
    if (!token && !user) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      const response = await fetch(`/api/admin/products?${params}`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        let filteredProducts = data.products || [];
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredProducts = filteredProducts.filter(
            (p) =>
              p.title.toLowerCase().includes(query) ||
              p.sku.toLowerCase().includes(query) ||
              (p.description && p.description.toLowerCase().includes(query))
          );
        }
        setProducts(filteredProducts);
        setPagination(data.pagination);
      } else if (response.status === 401) {
        sessionStorage.removeItem('admin_token');
        setIsAuthed(false);
        router.push('/admin');
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

  const handleDelete = async (id) => {
    if (!id) {
      setError('Product ID is required');
      return;
    }

    setDeletingId(id);
    setLoading(true);
    setError('');
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      };

      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        setDeleteConfirm(null);
        await fetchProducts();
      } else {
        let errorMessage = 'Failed to delete product';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem('admin_token');
          setIsAuthed(false);
          router.push('/admin');
          return;
        }

        setError(errorMessage);
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Network error. Please try again.');
      setDeleteConfirm(null);
    } finally {
      setLoading(false);
      setDeletingId(null);
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
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      };
      const response = await fetch(endpoint, {
        method,
        headers,
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
              <p className="text-sm text-purple-100/80">Please log in to access products.</p>
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
        <title>Products · Admin · MyPetEats</title>
      </Head>

      <section className="space-y-8">
        <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-deep-purple to-mid-violet p-8 text-white shadow-elevated md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">inventory</p>
            <Heading as="h1" className="text-4xl text-white">
              Product Control
            </Heading>
            <p className="text-white/70">
              {pagination?.total || products.length} total ·{' '}
              {products.filter((item) => item.published).length} published ·{' '}
              {totalVisibleInventory} units available
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
          >
            + New Product
          </Button>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-50">
            {error}
          </div>
        )}

        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search products by title, SKU, or description..."
            />
          </div>
        </div>

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
                      {product.published ? (
                        <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/40 font-semibold">
                          Published
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/40 font-semibold">
                          Draft
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                        className="bg-brand-500 hover:bg-brand-600 text-white w-[152px] ml-2 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] align-middle mb-0.5"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setDeleteConfirm(product)}
                        disabled={deletingId === product._id}
                        className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                      >
                        {deletingId === product._id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && !loading && (
            <p className="px-6 py-12 text-center text-gray-500">
              {searchQuery ? 'No products found matching your search.' : 'No products yet. Add your first product above.'}
            </p>
          )}
          {loading && (
            <div className="px-6 py-12 text-center text-gray-500 flex items-center justify-center gap-3">
              <Spinner size="sm" />
              <span>Loading products…</span>
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

        {showForm && (
          <ProductForm
            key={editingProduct?._id || 'new'}
            product={editingProduct}
            user={user}
            token={token}
            onClose={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            onSubmit={handleSave}
          />
        )}

        {deleteConfirm && (
          <ConfirmationModal
            isOpen={!!deleteConfirm}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={() => handleDelete(deleteConfirm._id)}
            title="Delete Product"
            message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
            loading={deletingId === deleteConfirm._id}
          />
        )}
      </section>
    </AdminLayout>
  );
}

AdminProducts.getLayout = (page) => page;

function ProductForm({ product, onClose, onSubmit, user, token }) {
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

      const headers = {};
      if (!user && token) {
        headers['x-admin-token'] = token;
      }

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: form,
        headers,
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
            <Heading as="h2" className="text-3xl text-[#02292b]">
              {product ? 'Update Product' : 'New Product'}
            </Heading>
          </div>
          <Button variant="ghost" className="text-[#696969] hover:text-[#696969] bg-[rgba(105,105,10,0.04)] border border-[#696969] h-10 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)]" onClick={onClose}>
            Close
          </Button>
        </header>

        <form className="space-y-6 pt-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="SKU" value={formData.sku} onChange={handleChange('sku')} required variant="light" />
            <Input label="Title" value={formData.title} onChange={handleChange('title')} required variant="light" />
          </div>

          <Input
            label="Slug (optional)"
            helper="Leave blank to auto-generate"
            value={formData.slug}
            onChange={handleChange('slug')}
            variant="light"
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Price (currency units)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange('price')}
              required
              variant="light"
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
              variant="light"
            />
            <Input
              label="Inventory"
              type="number"
              min="0"
              value={formData.inventory}
              onChange={handleChange('inventory')}
              variant="light"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Images ({formData.images.length}/{MAX_IMAGES})
                </label>
              </div>
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
              variant="light"
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
