import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { parentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Receipt,
  User,
  Plus,
  Edit2,
  Calendar,
  Phone,
  MapPin,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Search,
  Filter,
  Eye,
  Shield,
  Save,
  Loader2
} from 'lucide-react';

export const ParentPortalPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const activeTab = searchParams.get('tab') || 'patients'; // 'patients', 'invoices', 'profile'

  // Tab switch helper
  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  // State: Patients
  const [patientsList, setPatientsList] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [savingPatient, setSavingPatient] = useState(false);
  const [patientFormError, setPatientFormError] = useState('');
  const [patientForm, setPatientForm] = useState({
    name: '',
    birth_date: '',
    gender: 'male',
    medical_history: '',
    allergies: '',
    notes: '',
  });

  // State: Invoices
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // State: Guardian Profile
  const [guardianProfile, setGuardianProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    relationship_to_patient: 'parent',
  });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'patients') {
      fetchPatients();
    } else if (activeTab === 'invoices') {
      fetchInvoices();
    } else if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [activeTab, invoiceStatusFilter]);

  // ==========================
  // PATIENTS LOGIC
  // ==========================
  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const res = await parentService.getPatients();
      const list = res.data?.data || res.data || [];
      setPatientsList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleOpenAddPatient = () => {
    setEditingPatient(null);
    setPatientFormError('');
    setPatientForm({
      name: '',
      birth_date: '',
      gender: 'male',
      medical_history: '',
      allergies: '',
      notes: '',
    });
    setPatientModalOpen(true);
  };

  const handleOpenEditPatient = (patient) => {
    setEditingPatient(patient);
    setPatientFormError('');
    setPatientForm({
      name: patient.name || '',
      birth_date: patient.birth_date ? patient.birth_date.split('T')[0] : '',
      gender: patient.gender || 'male',
      medical_history: patient.medical_history || '',
      allergies: patient.allergies || '',
      notes: patient.notes || '',
    });
    setPatientModalOpen(true);
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    setSavingPatient(true);
    setPatientFormError('');
    try {
      if (editingPatient) {
        await parentService.updatePatient(editingPatient.id, patientForm);
      } else {
        await parentService.createPatient(patientForm);
      }
      setPatientModalOpen(false);
      fetchPatients();
    } catch (err) {
      setPatientFormError(err.response?.data?.message || 'Gagal menyimpan data pasien.');
    } finally {
      setSavingPatient(false);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years <= 0) return `${months} Bulan`;
    return `${years} Tahun ${months > 0 ? `${months} Bln` : ''}`;
  };

  // ==========================
  // INVOICES LOGIC
  // ==========================
  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const params = {};
      if (invoiceStatusFilter !== 'all') {
        params.status = invoiceStatusFilter;
      }
      const res = await parentService.getInvoices(params);
      const list = res.data?.data || res.data || [];
      setInvoices(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // ==========================
  // PROFILE LOGIC
  // ==========================
  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await parentService.getProfile();
      const profile = res.data?.data || res.data || {};
      setGuardianProfile(profile);
      setProfileForm({
        phone: profile.phone || user?.phone || '',
        address: profile.address || '',
        emergency_contact: profile.emergency_contact || '',
        emergency_phone: profile.emergency_phone || '',
        relationship_to_patient: profile.relationship_to_patient || 'parent',
      });
    } catch (err) {
      console.error('Failed to fetch guardian profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: '', text: '' });
    try {
      const res = await parentService.updateProfile(profileForm);
      setGuardianProfile(res.data?.data || res.data);
      setProfileMessage({
        type: 'success',
        text: 'Data profil wali berhasil diperbarui!',
      });
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.message || 'Gagal memperbarui profil.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Portal Header */}
      <div className="bg-gradient-to-r from-teal-700 via-brand-600 to-indigo-700 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold mb-2">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-300" />
              Portal Orang Tua & Wali Pasien
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Halo, {user?.name || 'Orang Tua Pasien'}
            </h1>
            <p className="text-sm text-teal-100 mt-1">
              Kelola data pasien, riwayat jadwal terapi, dan dokumen tagihan klinik Anda di satu tempat.
            </p>
          </div>

          <button
            onClick={() => navigate('/booking')}
            className="self-start md:self-auto py-2.5 px-4 rounded-xl bg-white text-brand-700 font-bold text-xs sm:text-sm hover:bg-teal-50 transition shadow-md shadow-black/10 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-brand-600" />
            Reservasi Terapi Baru
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-8">
          <button
            onClick={() => handleTabChange('patients')}
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'patients'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Pasien</span>
            {patientsList.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'patients' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {patientsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('invoices')}
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'invoices'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Tagihan & Invoice</span>
          </button>

          <button
            onClick={() => handleTabChange('profile')}
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil Wali</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: PATIENTS / DATA PASIEN                             */}
        {/* ========================================================= */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Daftar Pasien Terdaftar
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tambahkan data profil pasien untuk mempermudah pemesanan jadwal dan pemantauan sesi terapi.
                </p>
              </div>

              <button
                onClick={handleOpenAddPatient}
                className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Tambah Pasien Baru
              </button>
            </div>

            {loadingPatients ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                    <div className="h-6 bg-slate-200 rounded w-1/2 mb-3"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
                    <div className="h-16 bg-slate-100 rounded mb-4"></div>
                  </div>
                ))}
              </div>
            ) : patientsList.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Belum Ada Data Pasien</h4>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xs mx-auto">
                  Daftarkan profil pasien Anda untuk menghubungkan rekam medis dan catatan terapi klinis.
                </p>
                <button
                  onClick={handleOpenAddPatient}
                  className="mt-6 py-2.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm transition"
                >
                  + Daftarkan Pasien Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patientsList.map((patient) => (
                  <div
                    key={patient.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base ${
                            patient.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {patient.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-base leading-tight">
                              {patient.name}
                            </h4>
                            <span className="text-xs text-slate-500 font-medium">
                              {patient.gender === 'female' ? '👩 Perempuan' : '👨 Laki-laki'} • {calculateAge(patient.birth_date)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenEditPatient(patient)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition"
                          title="Edit Pasien"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 mt-4 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <div>
                          <span className="text-slate-400 block font-medium">Tanggal Lahir:</span>
                          <span className="font-semibold text-slate-800">
                            {patient.birth_date
                              ? new Date(patient.birth_date).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })
                              : '-'}
                          </span>
                        </div>

                        {patient.allergies && (
                          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
                            <span className="font-bold block text-[11px] text-amber-800">⚠️ Alergi:</span>
                            <span>{patient.allergies}</span>
                          </div>
                        )}

                        {patient.medical_history && (
                          <div>
                            <span className="text-slate-400 block font-medium">Riwayat Tumbuh Kembang / Medis:</span>
                            <span className="text-slate-700 line-clamp-2">{patient.medical_history}</span>
                          </div>
                        )}

                        {patient.notes && (
                          <div>
                            <span className="text-slate-400 block font-medium">Catatan Khusus:</span>
                            <span className="text-slate-700 line-clamp-2 italic">{patient.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">
                        Status: <span className="text-emerald-700 font-bold capitalize">{patient.status || 'Aktif'}</span>
                      </span>
                      <button
                        onClick={() => navigate(`/booking?patient_id=${patient.id}`)}
                        className="py-1.5 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <span>Pesan Terapi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: INVOICES                                           */}
        {/* ========================================================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tagihan & Riwayat Pembayaran</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar tagihan sesi konsultasi dan terapi pasien Anda di Klinik Terapi Alabina.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={invoiceStatusFilter}
                  onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="unpaid">Belum Dibayar (Unpaid)</option>
                  <option value="pending">Menunggu Konfirmasi (Pending)</option>
                  <option value="paid">Lunas (Paid)</option>
                </select>
              </div>
            </div>

            {loadingInvoices ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                Memuat data tagihan...
              </div>
            ) : invoices.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">Tidak Ada Tagihan</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Saat ini belum ada data tagihan untuk filter yang dipilih.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 sm:px-6">No. Invoice</th>
                        <th className="py-3.5 px-4">Nama Pasien</th>
                        <th className="py-3.5 px-4">Jatuh Tempo</th>
                        <th className="py-3.5 px-4">Total</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-brand-700">
                            {inv.invoice_number}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {inv.patient?.name || inv.booking?.patient?.name || 'Pasien Umum'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-xs">
                            {inv.due_date
                              ? new Date(inv.due_date).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-'}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {formatCurrency(inv.total)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                inv.status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : inv.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {inv.status === 'paid'
                                ? 'Lunas'
                                : inv.status === 'pending'
                                ? 'Menunggu'
                                : 'Belum Bayar'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Rincian
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: GUARDIAN PROFILE                                   */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                {user?.name?.charAt(0) || 'W'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {user?.email} • Akun Terverifikasi
                </span>
              </div>
            </div>

            {profileMessage.text && (
              <div
                className={`p-4 rounded-2xl mb-6 text-xs sm:text-sm flex items-start gap-2.5 ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="Contoh: 08123456789"
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hubungan dengan Pasien
                  </label>
                  <select
                    value={profileForm.relationship_to_patient || 'parent'}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, relationship_to_patient: e.target.value })
                    }
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="parent">Orang Tua Kandung (Ayah / Ibu)</option>
                    <option value="guardian">Wali Resmi / Pengasuh</option>
                    <option value="relative">Keluarga (Kakek / Nenek / Tante)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Alamat Lengkap Tempat Tinggal
                </label>
                <textarea
                  rows={3}
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="Jl. Merpati No. 12, Kelurahan, Kecamatan, Kota"
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4">
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Kontak Darurat (Emergency Contact)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">
                      Nama Kontak Darurat
                    </label>
                    <input
                      type="text"
                      value={profileForm.emergency_contact}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, emergency_contact: e.target.value })
                      }
                      placeholder="Nama Pasangan / Keluarga"
                      className="w-full py-2 px-3 rounded-xl border border-amber-200 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">
                      Nomor Telepon Darurat
                    </label>
                    <input
                      type="text"
                      value={profileForm.emergency_phone}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, emergency_phone: e.target.value })
                      }
                      placeholder="08198765432"
                      className="w-full py-2 px-3 rounded-xl border border-amber-200 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition flex items-center gap-2 disabled:opacity-60"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Perubahan Profil
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT PATIENT                                  */}
      {/* ========================================================= */}
      {patientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {editingPatient ? 'Edit Data Pasien' : 'Tambah Data Pasien'}
              </h3>
              <button
                onClick={() => setPatientModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="space-y-4">
              {patientFormError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{patientFormError}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Lengkap Pasien *
                </label>
                <input
                  type="text"
                  required
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                  placeholder="Contoh: Muhammad Rafa"
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    required
                    value={patientForm.birth_date}
                    onChange={(e) => setPatientForm({ ...patientForm, birth_date: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Riwayat Tumbuh Kembang / Medis
                </label>
                <textarea
                  rows={2}
                  value={patientForm.medical_history}
                  onChange={(e) => setPatientForm({ ...patientForm, medical_history: e.target.value })}
                  placeholder="Misal: pernah speech delay..."
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alergi Makanan / Kontak
                </label>
                <input
                  type="text"
                  value={patientForm.allergies}
                  onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })}
                  placeholder="Misal: Alergi kacang, gluten, debu halus"
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan Tambahan untuk Terapis
                </label>
                <textarea
                  rows={2}
                  value={patientForm.notes}
                  onChange={(e) => setPatientForm({ ...patientForm, notes: e.target.value })}
                  placeholder="Kebiasaan pasien, hal yang disukai saat sesi terapi..."
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPatientModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingPatient}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2"
                >
                  {savingPatient ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Data Pasien'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: INVOICE DETAIL                                      */}
      {/* ========================================================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-brand-600">
                  {selectedInvoice.invoice_number}
                </span>
                <h3 className="text-xl font-bold text-slate-900">Rincian Tagihan</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs sm:text-sm">
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pasien:</span>
                  <span className="font-bold text-slate-900">
                    {selectedInvoice.patient?.name || selectedInvoice.booking?.patient?.name || 'Pasien Umum'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jatuh Tempo:</span>
                  <span className="font-semibold text-slate-700">
                    {selectedInvoice.due_date || 'Saat Sesi Konsultasi'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Pembayaran:</span>
                  <span className="font-bold capitalize text-emerald-700">
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Layanan:</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskon:</span>
                    <span>-{formatCurrency(selectedInvoice.discount_amount)}</span>
                  </div>
                )}
                {selectedInvoice.tax_amount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Pajak (PPN):</span>
                    <span>+{formatCurrency(selectedInvoice.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total Tagihan:</span>
                  <span className="text-brand-600">{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="p-3 bg-blue-50/60 rounded-xl text-xs text-blue-900">
                  <span className="font-bold block mb-0.5">Catatan Pembayaran:</span>
                  <span>{selectedInvoice.notes}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm"
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

export default ParentPortalPage;
