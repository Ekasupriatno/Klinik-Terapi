import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Search, Plus, Edit2, Trash2, BookOpen, Eye, Filter, Loader2 } from 'lucide-react';

export const AdminArticlesTab = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'Tumbuh Kembang',
    excerpt: '',
    content: '',
    tags: '',
    is_published: true,
  });

  useEffect(() => {
    fetchArticles();
  }, [categoryFilter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const res = await adminService.getArticles(params);
      const list = res.data?.data || res.data || [];
      setArticles(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setForm({
      title: '',
      category: 'Tumbuh Kembang',
      excerpt: '',
      content: '',
      tags: 'tumbuh kembang, anak, terapi',
      is_published: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (art) => {
    setEditingArticle(art);
    setForm({
      title: art.title || '',
      category: art.category || 'Tumbuh Kembang',
      excerpt: art.excerpt || '',
      content: art.content || '',
      tags: art.tags || '',
      is_published: art.is_published !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingArticle) {
        await adminService.updateArticle(editingArticle.id, form);
      } else {
        await adminService.createArticle(form);
      }
      setModalOpen(false);
      fetchArticles();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan artikel.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus artikel ini?')) return;
    try {
      await adminService.deleteArticle(id);
      fetchArticles();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus artikel.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Manajemen Konten & Artikel (CMS)</h3>
          <p className="text-xs text-slate-500">Publikasikan panduan orang tua, tips terapi wicara, dan edukasi kesehatan anak.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul artikel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchArticles()}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 w-44"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="py-2 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Buat Artikel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Memuat artikel...</div>
      ) : articles.length === 0 ? (
        <div className="py-12 text-center text-slate-400">Belum ada artikel ditemukan.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Judul Artikel</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Penulis</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {articles.map((art) => (
                <tr key={art.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 max-w-sm truncate">
                    {art.title}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
                      {art.category || 'Edukasi'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{art.author?.name || 'Admin'}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-slate-500">
                    {art.view_count || 0} pembaca
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        art.is_published !== false
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {art.is_published !== false ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(art)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(art.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingArticle ? 'Edit Artikel Edukasi' : 'Tulis Artikel Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Judul Artikel *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Misal: Ciri-Ciri Keterlambatan Bicara (Speech Delay) pada Anak Usia 2 Tahun"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Topik</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Tumbuh Kembang">Tumbuh Kembang</option>
                    <option value="Terapi Wicara">Terapi Wicara</option>
                    <option value="Sensori Integrasi">Sensori Integrasi</option>
                    <option value="Okupasi Terapi">Okupasi Terapi</option>
                    <option value="Parenting Tips">Parenting Tips</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tags (Pisahkan Koma)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="speech delay, anak, orang tua"
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ringkasan / Excerpt</label>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Ringkasan 1-2 kalimat untuk kartu artikel..."
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Isi Lengkap Artikel *</label>
                <textarea
                  rows={8}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Tuliskan konten artikel lengkap di sini..."
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-normal leading-relaxed"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="rounded text-brand-600"
                  />
                  Publikasikan Langsung ke Pembaca (Published)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Artikel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArticlesTab;
