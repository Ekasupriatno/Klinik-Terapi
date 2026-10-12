import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Search, Plus, Edit2, Trash2, User, Eye, Filter, Loader2 } from 'lucide-react';

export const AdminPatientsTab = () => {
  const [patients, setPatients] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  const [form, setPatientForm] = useState({
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

      const [pRes, gRes] = await Promise.all([
        adminService.getPatients(params),
        adminService.getGuardians(),
      ]);

      const pList = pRes.data?.data || pRes.data || [];
      const gList = gRes.data?.data || gRes.data || [];

      setPatients(Array.isArray(pList) ? pList : []);
      setGuardians(Array.isArray(gList) ? gList : []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setPatientForm({
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

  const handleOpenEdit = (patient) => {
    setEditingPatient(patient);
    setPatientForm({
      guardian_id: patient.guardian_id || '',
      name: patient.name || '',
      birth_date: patient.birth_date ? patient.birth_date.substring(0, 10) : '',
      gender: patient.gender || 'male',
      status: patient.status || 'active',
      medical_history: patient.medical_history || '',
      allergies: patient.allergies || '',
      notes: patient.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.birth_date) {
      alert('Nama dan tanggal lahir wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      if (editingPatient) {
        await adminService.updatePatient(editingPatient.id, form);
      } else {
        await adminService.createPatient(form);
      }
      setModalOpen(false);
      fetchInitial();
    } catch (err) {
      console.error('Error saving patient:', err);
      alert(err.response?.data?.message || 'Gagal menyimpan data pasien.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus data pasien "${name}"?`)) return;
    try {
      await adminService.deletePatient(id);
      fetchInitial();
    } catch (err) {
      console.error('Failed to delete patient:', err);
      alert('Gagal menghapus data pasien.');
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '-';
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970) + ' th';
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <User className="text-brand-600" /> Manajemen Data Pasien
          </h2>
          <p className="text-sm text-slate-500">Kelola informasi pasien, riwayat alergi, dan catatan medis klinik.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition font-medium shadow-sm shadow-brand-500/20"
        >
          <Plus size={18} /> Tambah Pasien
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchInitial();
          }}
          className="flex-1 relative"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama pasien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
            <option value="completed">Selesai Terapi</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-brand-600" size={28} />
            <span>Memuat data pasien...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <User className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="font-medium text-slate-600">Belum ada data pasien</p>
            <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Tambah Pasien" untuk mendaftarkan pasien baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nama Pasien</th>
                  <th className="py-3 px-4 font-semibold">Usia / Gender</th>
                  <th className="py-3 px-4 font-semibold">Wali / Kontak</th>
                  <th className="py-3 px-4 font-semibold">Alergi & Riwayat</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-xs">
                          {patient.name?.charAt(0).toUpperCase()}
                        </div>
                        <span>{patient.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {calculateAge(patient.birth_date)} •{' '}
                      <span className="capitalize">{patient.gender === 'female' ? 'Perempuan' : 'Laki-laki'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs">
                        <div className="font-semibold text-slate-800">{patient.guardian?.user?.name || patient.guardian?.emergency_contact || '-'}</div>
                        <div className="text-slate-400">{patient.guardian?.phone || '-'}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate text-xs text-slate-500">
                      {patient.allergies ? `Alergi: ${patient.allergies}` : patient.medical_history || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          patient.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {patient.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailModal(patient)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(patient)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id, patient.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">
                {editingPatient ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Wali Pasien</label>
                <select
                  value={form.guardian_id}
                  onChange={(e) => setPatientForm({ ...form, guardian_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">-- Pilih Wali --</option>
                  {guardians.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.user?.name || g.emergency_contact || `Wali ID: ${g.id}`} ({g.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pasien *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setPatientForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="Contoh: Dinda Putri"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={form.birth_date}
                    onChange={(e) => setPatientForm({ ...form, birth_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Kelamin</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setPatientForm({ ...form, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Riwayat Alergi</label>
                <input
                  type="text"
                  value={form.allergies}
                  onChange={(e) => setPatientForm({ ...form, allergies: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="Misal: Alergi debu, dingin, obat antibiotik"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Riwayat Medis / Keluhan</label>
                <textarea
                  rows={2}
                  value={form.medical_history}
                  onChange={(e) => setPatientForm({ ...form, medical_history: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="Catatan riwayat sakit atau diagnosis terapi sebelumnya"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setPatientForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="Catatan observasi internal klinik"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Pasien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{detailModal.name}</h3>
                <p className="text-xs text-slate-400">ID Pasien: #{detailModal.id}</p>
              </div>
              <button onClick={() => setDetailModal(null)} className="text-slate-400 hover:text-slate-600 text-lg">
                &times;
              </button>
            </div>

            <div className="space-y-2 text-sm text-slate-600 divide-y divide-slate-100">
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Usia:</span>
                <span className="font-semibold">{calculateAge(detailModal.birth_date)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Tanggal Lahir:</span>
                <span>{detailModal.birth_date ? new Date(detailModal.birth_date).toLocaleDateString('id-ID') : '-'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Jenis Kelamin:</span>
                <span className="capitalize">{detailModal.gender === 'female' ? 'Perempuan' : 'Laki-laki'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Wali:</span>
                <span className="font-semibold">{detailModal.guardian?.user?.name || detailModal.guardian?.emergency_contact || '-'}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 block text-xs mb-1">Riwayat Alergi:</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg text-xs">{detailModal.allergies || 'Tidak ada riwayat alergi yang tercatat.'}</p>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 block text-xs mb-1">Riwayat Medis:</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg text-xs">{detailModal.medical_history || 'Tidak ada riwayat medis.'}</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setDetailModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
