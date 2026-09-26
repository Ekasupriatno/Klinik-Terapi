import React, { useState, useEffect } from 'react';
import { adminService, bookingService, doctorService, scheduleService, clinicService } from '../services/api';
import { BookingStatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { TableRowSkeleton } from '../components/common/Skeleton';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Stethoscope,
  Trash2,
  Edit2,
  FileText
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, doctors, schedules
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Bookings State
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchBooking, setSearchBooking] = useState('');

  // Doctor State
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    specialization_id: '',
    name: '',
    sip_number: '',
    title: '',
    experience_years: 3,
    consultation_fee: 200000,
    bio: '',
    image_url: '',
    is_active: true,
  });

  // Schedule State
  const [selectedDoctorIdForSchedule, setSelectedDoctorIdForSchedule] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    doctor_id: '',
    day_of_week: 'monday',
    start_time: '09:00',
    end_time: '15:00',
    slot_duration_minutes: 30,
  });

  // Notes Modal for completing booking
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [bookingForNotes, setBookingForNotes] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');

  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchStats();
    fetchBookings();
    fetchDoctors();
    fetchSpecializations();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await adminService.getStats();
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil statistik:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchBooking) params.search = searchBooking;

      const res = await bookingService.getAll(params);
      if (res.data?.data) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await doctorService.getAll();
      if (res.data?.data) {
        setDoctors(res.data.data);
        if (res.data.data.length > 0 && !selectedDoctorIdForSchedule) {
          setSelectedDoctorIdForSchedule(res.data.data[0].id.toString());
          fetchSchedules(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil dokter:', err);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const res = await clinicService.getSpecializations();
      if (res.data?.data) {
        setSpecializations(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil spesialisasi:', err);
    }
  };

  const fetchSchedules = async (docId) => {
    try {
      const res = await scheduleService.getByDoctor(docId);
      if (res.data?.data) {
        setSchedules(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil jadwal dokter:', err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus, notes = null) => {
    try {
      await bookingService.updateStatus(bookingId, newStatus, notes);
      setNotification({ type: 'success', message: `Status booking berhasil diubah menjadi ${newStatus}.` });
      fetchBookings();
      fetchStats();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Gagal mengubah status booking.',
      });
    }
  };

  const handleOpenCompleteModal = (booking) => {
    setBookingForNotes(booking);
    setDoctorNotes('');
    setNotesModalOpen(true);
  };

  const handleSaveCompletedWithNotes = async () => {
    if (!bookingForNotes) return;
    await handleUpdateBookingStatus(bookingForNotes.id, 'completed', doctorNotes);
    setNotesModalOpen(false);
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    try {
      await doctorService.create(doctorForm);
      setNotification({ type: 'success', message: 'Dokter baru berhasil ditambahkan.' });
      setDoctorModalOpen(false);
      fetchDoctors();
      fetchStats();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menambahkan dokter.',
      });
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      await scheduleService.create({
        ...scheduleForm,
        doctor_id: selectedDoctorIdForSchedule,
      });
      setNotification({ type: 'success', message: 'Jadwal praktek berhasil disimpan.' });
      setScheduleModalOpen(false);
      fetchSchedules(selectedDoctorIdForSchedule);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menambahkan jadwal.',
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Hapus jadwal praktek ini?')) return;
    try {
      await scheduleService.delete(scheduleId);
      setNotification({ type: 'success', message: 'Jadwal berhasil dihapus.' });
      fetchSchedules(selectedDoctorIdForSchedule);
    } catch (err) {
      setNotification({ type: 'error', message: 'Gagal menghapus jadwal.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Pusat Kendali Administrasi
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Admin Dashboard Klinik Terapi
          </h1>
          <p className="text-slate-500 text-sm">
            Pantau status reservasi pasien, kelola jadwal dokter, dan ringkasan operasional harian.
          </p>
        </div>
      </div>

      {/* Notification */}
      {notification.message && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification({ type: '', message: '' })}
            className="text-xs font-bold underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Pasien</span>
          <div className="text-2xl font-extrabold text-slate-800">
            {loadingStats ? '-' : stats?.metrics?.total_patients}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Dokter Aktif</span>
          <div className="text-2xl font-extrabold text-brand-700">
            {loadingStats ? '-' : stats?.metrics?.total_doctors}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Booking</span>
          <div className="text-2xl font-extrabold text-slate-800">
            {loadingStats ? '-' : stats?.metrics?.total_bookings}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-100 bg-amber-50/40 shadow-sm space-y-1">
          <span className="text-xs font-bold text-amber-700">Menunggu ACC</span>
          <div className="text-2xl font-extrabold text-amber-800">
            {loadingStats ? '-' : stats?.metrics?.pending_bookings}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Hari Ini</span>
          <div className="text-2xl font-extrabold text-blue-700">
            {loadingStats ? '-' : stats?.metrics?.today_bookings}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400">Selesai</span>
          <div className="text-2xl font-extrabold text-emerald-700">
            {loadingStats ? '-' : stats?.metrics?.completed_bookings}
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'bookings'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📋 Kelola Reservasi Pasien
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'doctors'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          👨‍⚕️ Kelola Data Dokter
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'schedules'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🕐 Jadwal Jam Praktek
        </button>
      </div>

      {/* ================================================= */}
      {/* TAB 1: KELOLA RESERVASI PASIEN                    */}
      {/* ================================================= */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
          
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchBooking}
                onChange={(e) => setSearchBooking(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchBookings()}
                placeholder="Cari kode atau nama pasien..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setTimeout(fetchBookings, 50);
                }}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu Konfirmasi</option>
                <option value="confirmed">Terkonfirmasi</option>
                <option value="in_consultation">Sedang Konsultasi</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>

              <button
                onClick={fetchBookings}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-y border-slate-100">
                <tr>
                  <th className="p-3.5">Kode Booking</th>
                  <th className="p-3.5">Pasien</th>
                  <th className="p-3.5">Dokter</th>
                  <th className="p-3.5">Jadwal</th>
                  <th className="p-3.5">Keluhan</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loadingBookings ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      Tidak ada reservasi yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-mono font-bold text-brand-700">
                        {b.booking_code}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{b.patient?.name || 'Pasien'}</div>
                        <div className="text-[10px] text-slate-400">{b.patient?.phone || b.patient?.email}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{b.doctor?.name}</div>
                        <div className="text-[10px] text-brand-600">{b.doctor?.specialization?.name}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{b.appointment_date}</div>
                        <div className="text-[10px] text-slate-500">{b.time_range} WIB</div>
                      </td>
                      <td className="p-3.5 max-w-[200px] truncate" title={b.patient_complaint}>
                        {b.patient_complaint}
                      </td>
                      <td className="p-3.5">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                              title="Setujui Reservasi"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                            >
                              Approve
                            </button>
                          )}

                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'in_consultation')}
                              title="Mulai Konsultasi"
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px]"
                            >
                              Konsultasi
                            </button>
                          )}

                          {b.status === 'in_consultation' && (
                            <button
                              onClick={() => handleOpenCompleteModal(b)}
                              title="Selesaikan & Isi Catatan Dokter"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px]"
                            >
                              Selesai
                            </button>
                          )}

                          {['pending', 'confirmed'].includes(b.status) && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                              title="Tolak / Batalkan"
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px]"
                            >
                              Tolak
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* TAB 2: KELOLA DATA DOKTER                         */}
      {/* ================================================= */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Daftar Tenaga Medis & Terapis</h3>
            <button
              onClick={() => {
                setDoctorForm({
                  specialization_id: specializations[0]?.id || '',
                  name: '',
                  sip_number: '',
                  title: '',
                  experience_years: 3,
                  consultation_fee: 200000,
                  bio: '',
                  image_url: '',
                  is_active: true,
                });
                setDoctorModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Tambah Dokter Baru
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={doc.image_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                      {doc.specialization?.name}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 mt-1">{doc.name}</h4>
                    <p className="text-xs text-slate-400">{doc.title}</p>
                    <p className="text-xs font-extrabold text-brand-700 mt-1">
                      {doc.formatted_fee || `Rp ${Number(doc.consultation_fee).toLocaleString('id-ID')}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>SIP: {doc.sip_number}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${doc.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {doc.is_active ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* TAB 3: JADWAL JAM PRAKTEK                         */}
      {/* ================================================= */}
      {activeTab === 'schedules' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Pengaturan Jam Kerja Dokter</h3>
              <p className="text-xs text-slate-500">Pilih dokter untuk melihat dan mengonfigurasi jadwal shift</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedDoctorIdForSchedule}
                onChange={(e) => {
                  setSelectedDoctorIdForSchedule(e.target.value);
                  fetchSchedules(e.target.value);
                }}
                className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialization?.name})
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setScheduleForm({
                    doctor_id: selectedDoctorIdForSchedule,
                    day_of_week: 'monday',
                    start_time: '09:00',
                    end_time: '15:00',
                    slot_duration_minutes: 30,
                  });
                  setScheduleModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Tambah Shift
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((sch) => (
              <div
                key={sch.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-extrabold text-brand-800 uppercase tracking-wide">
                    {sch.day_label || sch.day_of_week}
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {sch.formatted_time} WIB
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Durasi: {sch.slot_duration_minutes} Menit / Pasien
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteSchedule(sch.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Hapus Shift"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Selesaikan Booking dengan Catatan Dokter */}
      <Modal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        title="Selesaikan Sesi Konsultasi"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Sesi terapi bersama <strong>{bookingForNotes?.patient?.name}</strong> akan ditandai selesai. Masukkan catatan medis atau anjuran latihan fisioterapi untuk pasien.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Catatan Dokter / Hasil Terapi:</label>
            <textarea
              rows={4}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Contoh: Pasien telah diberikan traksi lumbal dan peregangan quadriceps. Disarankan kompres hangat dan kontrol kembali 1 minggu ke depan."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setNotesModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={handleSaveCompletedWithNotes}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
            >
              Simpan & Selesai
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Tambah Dokter */}
      <Modal
        isOpen={doctorModalOpen}
        onClose={() => setDoctorModalOpen(false)}
        title="Tambah Dokter / Terapis Baru"
      >
        <form onSubmit={handleSaveDoctor} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Lengkap & Gelar</label>
              <input
                required
                type="text"
                value={doctorForm.name}
                onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                placeholder="dr. Budi, Sp.KFR"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Spesialisasi</label>
              <select
                required
                value={doctorForm.specialization_id}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialization_id: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
              >
                <option value="">Pilih Spesialisasi</option>
                {specializations.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nomor SIP Resmi</label>
              <input
                required
                type="text"
                value={doctorForm.sip_number}
                onChange={(e) => setDoctorForm({ ...doctorForm, sip_number: e.target.value })}
                placeholder="SIP/446/2023/..."
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Biaya Konsultasi (Rp)</label>
              <input
                required
                type="number"
                value={doctorForm.consultation_fee}
                onChange={(e) => setDoctorForm({ ...doctorForm, consultation_fee: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Bio Singkat</label>
            <textarea
              rows={2}
              value={doctorForm.bio}
              onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
              placeholder="Pengalaman spesifik dan fokus penanganan..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">URL Foto Dokter</label>
            <input
              type="text"
              value={doctorForm.image_url}
              onChange={(e) => setDoctorForm({ ...doctorForm, image_url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setDoctorModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition"
            >
              Simpan Dokter
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah Shift Jadwal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Tambah Shift Jam Praktek"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Hari Praktek</label>
            <select
              value={scheduleForm.day_of_week}
              onChange={(e) => setScheduleForm({ ...scheduleForm, day_of_week: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
            >
              <option value="monday">Senin</option>
              <option value="tuesday">Selasa</option>
              <option value="wednesday">Rabu</option>
              <option value="thursday">Kamis</option>
              <option value="friday">Jumat</option>
              <option value="saturday">Sabtu</option>
              <option value="sunday">Minggu</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Jam Mulai</label>
              <input
                required
                type="time"
                value={scheduleForm.start_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, start_time: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Jam Selesai</label>
              <input
                required
                type="time"
                value={scheduleForm.end_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, end_time: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Durasi Per Slot (Menit)</label>
            <select
              value={scheduleForm.slot_duration_minutes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, slot_duration_minutes: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
            >
              <option value={20}>20 Menit</option>
              <option value={30}>30 Menit (Standar)</option>
              <option value={45}>45 Menit</option>
              <option value={60}>60 Menit</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition"
            >
              Simpan Shift
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
