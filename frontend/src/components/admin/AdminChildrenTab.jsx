import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Search, Plus, Edit2, Trash2, Baby, Eye, Filter, Loader2 } from 'lucide-react';

export const AdminChildrenTab = () => {
  const [children, setChildren] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [saving, setSaving] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  const [form, setChildForm] = useState({
    guardian_id: '',
    name: '',
    birth_date: '',
    gender: 'male',
    status: 'active',
    medical_history: '',
    allergies: '',
    notes: '',
  });

  useEffect(() => {
    fetchInitial();
  }, [statusFilter]);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const [chRes, gRes] = await Promise.all([
        adminService.getChildren(params),
        adminService.getGuardians(),
      ]);

      const chList = chRes.data?.data || chRes.data || [];
      const gList = gRes.data?.data || gRes.data || [];

      setChildren(Array.isArray(chList) ? chList : []);
      setGuardians(Array.isArray(gList) ? gList : []);
    } catch (err) {
      console.error('Failed to load children:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingChild(null);
    setChildForm({
      guardian_id: guardians[0]?.id || '',
      name: '',
      birth_date: '',
      gender: 'male',
      status: 'active',
      medical_history: '',
      allergies: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (child) => {
    setEditingChild(child);
    setChildForm({
      guardian_id: child.guardian_id || '',
      name: child.name || '',
      birth_date: child.birth_date ? child.birth_date.split('T')[0] : '',
      gender: child.gender || 'male',
      status: child.status || 'active',
      medical_history: child.medical_history || '',
      allergies: child.allergies || '',
      notes: child.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingChild) {
        await adminService.updateChild(editingChild.id, form);
      } else {
        await adminService.createChild(form);
      }
      setModalOpen(false);
      fetchInitial();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data anak.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data anak ini?')) return;
    try {
      await adminService.deleteChild(id);
      fetchInitial();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus anak.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Manajemen Pasien Anak</h3>
          <p className="text-xs text-slate-500">Data rekam medis dasar, riwayat alergi, dan relasi wali anak.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama anak..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchInitial()}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 w-44"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
            <option value="completed">Selesai Terapi</option>
          </select>

          <button
            onClick={handleOpenAdd}
            className="py-2 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Anak
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Memuat data anak...</div>
      ) : children.length === 0 ? (
        <div className="py-12 text-center text-slate-400">Tidak ada data anak ditemukan.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Nama Pasien Anak</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Tanggal Lahir</th>
                <th className="py-3 px-4">Wali / Orang Tua</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {children.map((ch) => (
                <tr key={ch.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{ch.name}</td>
                  <td className="py-3 px-4">
                    {ch.gender === 'female' ? '👧 Perempuan' : '👦 Laki-laki'}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {ch.birth_date ? new Date(ch.birth_date).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {ch.guardian?.user?.name || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 capitalize">
                      {ch.status || 'Aktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setDetailModal(ch)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(ch)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ch.id)}
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingChild ? 'Edit Data Pasien Anak' : 'Tambah Pasien Anak'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pilih Wali / Orang Tua *</label>
                <select
                  required
                  value={form.guardian_id}
                  onChange={(e) => setChildForm({ ...form, guardian_id: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="">-- Pilih Wali --</option>
                  {guardians.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.user?.name} ({g.phone || g.user?.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Pasien Anak *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setChildForm({ ...form, name: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={form.birth_date}
                    onChange={(e) => setChildForm({ ...form, birth_date: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setChildForm({ ...form, gender: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Riwayat Medis / Terapi</label>
                <textarea
                  rows={2}
                  value={form.medical_history}
                  onChange={(e) => setChildForm({ ...form, medical_history: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Alergi</label>
                <input
                  type="text"
                  value={form.allergies}
                  onChange={(e) => setChildForm({ ...form, allergies: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                />
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
                  {saving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">{detailModal.name}</h3>
              <button onClick={() => setDetailModal(null)} className="text-slate-400">✕</button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between"><span className="text-slate-400">Wali:</span> <span className="font-bold">{detailModal.guardian?.user?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Gender:</span> <span>{detailModal.gender}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Tanggal Lahir:</span> <span>{detailModal.birth_date}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Alergi:</span> <span>{detailModal.allergies || 'Tidak ada'}</span></div>
              <div className="pt-2">
                <span className="text-slate-400 block mb-1">Riwayat Medis:</span>
                <p className="bg-slate-50 p-2.5 rounded-xl text-slate-800">{detailModal.medical_history || 'Tidak ada riwayat khusus.'}</p>
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <button onClick={() => setDetailModal(null)} className="py-2 px-4 rounded-xl bg-slate-100 text-xs font-bold">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChildrenTab;
