import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Search, Plus, Edit2, Trash2, Users, Phone, MapPin, Eye, Loader2, AlertCircle } from 'lucide-react';

export const AdminGuardiansTab = () => {
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState(null);
  const [saving, setSaving] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  const [form, setForm] = useState({
    user_id: '',
    phone: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    relationship_to_child: 'parent',
  });

  useEffect(() => {
    fetchGuardians();
  }, []);

  const fetchGuardians = async () => {
    try {
      setLoading(true);
      const res = await adminService.getGuardians({ search });
      const list = res.data?.data || res.data || [];
      setGuardians(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load guardians:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (guardian) => {
    setEditingGuardian(guardian);
    setForm({
      user_id: guardian.user_id || '',
      phone: guardian.phone || '',
      address: guardian.address || '',
      emergency_contact: guardian.emergency_contact || '',
      emergency_phone: guardian.emergency_phone || '',
      relationship_to_child: guardian.relationship_to_child || 'parent',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingGuardian) {
        await adminService.updateGuardian(editingGuardian.id, form);
      } else {
        await adminService.createGuardian(form);
      }
      setModalOpen(false);
      fetchGuardians();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data wali.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data wali ini?')) return;
    try {
      await adminService.deleteGuardian(id);
      fetchGuardians();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus data wali.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Manajemen Wali & Orang Tua</h3>
          <p className="text-xs text-slate-500">Kelola kontak, relasi, dan data pendukung wali pasien anak.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchGuardians()}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 w-52"
            />
          </div>
          <button
            onClick={fetchGuardians}
            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            Cari
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Memuat data wali...</div>
      ) : guardians.length === 0 ? (
        <div className="py-12 text-center text-slate-400">Tidak ada data wali ditemukan.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Nama Akun / Wali</th>
                <th className="py-3 px-4">Kontak & WhatsApp</th>
                <th className="py-3 px-4">Relasi</th>
                <th className="py-3 px-4">Anak Terdaftar</th>
                <th className="py-3 px-4">Alamat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {guardians.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>{g.user?.name || '-'}</div>
                    <div className="text-xs text-slate-400 font-normal">{g.user?.email}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">{g.phone || g.user?.phone || '-'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-brand-50 text-brand-700 font-semibold capitalize">
                      {g.relationship_to_child || 'Parent'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {g.children?.length || 0} Anak
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                    {g.address || '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setDetailModal(g)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
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

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingGuardian ? 'Edit Data Wali' : 'Tambah Wali Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nomor Telepon / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hubungan dengan Anak</label>
                <select
                  value={form.relationship_to_child}
                  onChange={(e) => setForm({ ...form, relationship_to_child: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="parent">Orang Tua (Ayah / Ibu)</option>
                  <option value="guardian">Wali Resmi</option>
                  <option value="relative">Keluarga</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nama Kontak Darurat</label>
                  <input
                    type="text"
                    value={form.emergency_contact}
                    onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nomor Kontak Darurat</label>
                  <input
                    type="text"
                    value={form.emergency_phone}
                    onChange={(e) => setForm({ ...form, emergency_phone: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Detail Profil Wali</h3>
              <button onClick={() => setDetailModal(null)} className="text-slate-400">✕</button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between"><span className="text-slate-400">Nama:</span> <span className="font-bold">{detailModal.user?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Email:</span> <span>{detailModal.user?.email}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Telepon:</span> <span>{detailModal.phone}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Relasi:</span> <span className="capitalize">{detailModal.relationship_to_child}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Kontak Darurat:</span> <span>{detailModal.emergency_contact || '-'} ({detailModal.emergency_phone || '-'})</span></div>
              <div className="pt-2">
                <span className="text-slate-400 block mb-1">Alamat:</span>
                <p className="bg-slate-50 p-2.5 rounded-xl text-slate-800">{detailModal.address || '-'}</p>
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

export default AdminGuardiansTab;
