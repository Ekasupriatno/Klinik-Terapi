import React, { useState, useEffect } from 'react';
import { adminService, clinicService } from '../../services/api';
import { Search, Plus, Edit2, Trash2, Tag, Clock, Eye, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

export const AdminServicesTab = () => {
  const [services, setServices] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    specialization_id: '',
    name: '',
    description: '',
    duration_minutes: 45,
    price: 250000,
    age_target: '',
    benefits: '',
    show_price: true,
    is_active: true,
  });

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [srvRes, specRes] = await Promise.all([
        adminService.getServices(),
        clinicService.getSpecializations(),
      ]);
      const srvList = srvRes.data?.data || srvRes.data || [];
      const specList = specRes.data?.data || specRes.data || [];

      setServices(Array.isArray(srvList) ? srvList : []);
      setSpecializations(Array.isArray(specList) ? specList : []);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setForm({
      specialization_id: specializations[0]?.id || '',
      name: '',
      description: '',
      duration_minutes: 45,
      price: 250000,
      age_target: '2-12 Tahun',
      benefits: '',
      show_price: true,
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setEditingService(srv);
    setForm({
      specialization_id: srv.specialization_id || '',
      name: srv.name || '',
      description: srv.description || '',
      duration_minutes: srv.duration_minutes || 45,
      price: srv.price || 0,
      age_target: srv.age_target || '',
      benefits: srv.benefits || '',
      show_price: srv.show_price !== false,
      is_active: srv.is_active !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingService) {
        await adminService.updateService(editingService.id, form);
      } else {
        await adminService.createService(form);
      }
      setModalOpen(false);
      fetchInitial();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan layanan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus layanan terapi ini?')) return;
    try {
      await adminService.deleteService(id);
      fetchInitial();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus layanan.');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Manajemen Layanan Terapi</h3>
          <p className="text-xs text-slate-500">Katalog paket terapi anak, durasi per sesi, dan tarif klinik.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Tambah Layanan Baru
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Memuat layanan terapi...</div>
      ) : services.length === 0 ? (
        <div className="py-12 text-center text-slate-400">Belum ada layanan terapi dibuat.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Nama Layanan</th>
                <th className="py-3 px-4">Spesialisasi</th>
                <th className="py-3 px-4">Durasi Sesi</th>
                <th className="py-3 px-4">Tarif</th>
                <th className="py-3 px-4">Target Usia</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {services.map((srv) => (
                <tr key={srv.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">{srv.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-brand-50 text-brand-700 font-semibold">
                      {srv.specialization?.name || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-slate-600">
                    {srv.duration_minutes || 45} Menit
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatCurrency(srv.price)}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">{srv.age_target || '-'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        srv.is_active !== false
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {srv.is_active !== false ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(srv)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(srv.id)}
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
                {editingService ? 'Edit Layanan Terapi' : 'Tambah Layanan Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Spesialisasi Terapi *</label>
                <select
                  required
                  value={form.specialization_id}
                  onChange={(e) => setForm({ ...form, specialization_id: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="">-- Pilih Spesialisasi --</option>
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Layanan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Terapi Wicara Intensif"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Durasi (Menit) *</label>
                  <input
                    type="number"
                    min="15"
                    step="5"
                    required
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tarif (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Usia Anak</label>
                <input
                  type="text"
                  placeholder="Contoh: 1.5 - 6 Tahun"
                  value={form.age_target}
                  onChange={(e) => setForm({ ...form, age_target: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi Lengkap *</label>
                <textarea
                  rows={2}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Manfaat & Target Evaluasi</label>
                <textarea
                  rows={2}
                  value={form.benefits}
                  onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded text-brand-600"
                  />
                  Layanan Aktif
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.show_price}
                    onChange={(e) => setForm({ ...form, show_price: e.target.checked })}
                    className="rounded text-brand-600"
                  />
                  Tampilkan Tarif ke Publik
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
                  {saving ? 'Menyimpan...' : 'Simpan Layanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServicesTab;
