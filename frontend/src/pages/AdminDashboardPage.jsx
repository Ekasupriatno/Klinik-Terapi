import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  FileText,
  Eye,
  Phone,
  UserCheck,
  UserPlus,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { AdminGuardiansTab } from '../components/admin/AdminGuardiansTab';
import { AdminChildrenTab } from '../components/admin/AdminChildrenTab';
import { AdminServicesTab } from '../components/admin/AdminServicesTab';
import { AdminSessionNotesTab } from '../components/admin/AdminSessionNotesTab';
import { AdminInvoicesTab } from '../components/admin/AdminInvoicesTab';
import { AdminPaymentsTab } from '../components/admin/AdminPaymentsTab';
import { AdminArticlesTab } from '../components/admin/AdminArticlesTab';
import { AdminAuditLogsTab } from '../components/admin/AdminAuditLogsTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';
import { processImage } from '../utils/imageUtils';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(currentTabFromUrl || 'bookings');

  useEffect(() => {
    if (currentTabFromUrl && currentTabFromUrl !== activeTab) {
      setActiveTab(currentTabFromUrl);
    }
  }, [currentTabFromUrl]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Bookings State
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchBooking, setSearchBooking] = useState('');

  // Patients list for admin booking form
  const [patients, setPatients] = useState([]);

  // Booking CRUD Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    patient_type: 'registered', // 'registered' or 'new'
    user_id: '',
    patient_name: '',
    patient_email: '',
    phone: '',
    doctor_id: '',
    schedule_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '09:00',
    end_time: '09:30',
    status: 'confirmed',
    patient_complaint: '',
    doctor_notes: '',
    cancel_reason: '',
  });

  // Booking Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState(null);

  // Booking Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [deletingBooking, setDeletingBooking] = useState(false);

  // Doctor State
  const [doctors, setDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loadingPendingDoctors, setLoadingPendingDoctors] = useState(false);
  const [doctorActionModal, setDoctorActionModal] = useState({ open: false, type: '', doctor: null, reason: '' });
  const [therapistAccounts, setTherapistAccounts] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [savingDoctor, setSavingDoctor] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [imageError, setImageError] = useState('');
  const [doctorForm, setDoctorForm] = useState({
    user_id: '',
    specialization_id: '',
    name: '',
    sip_number: '',
    title: '',
    experience_years: 3,
    consultation_fee: 200000,
    bio: '',
    image_url: '',
    image: null,
    is_active: true,
  });

  useEffect(() => {
    if (!(doctorForm.image instanceof File)) return undefined;

    const previewUrl = URL.createObjectURL(doctorForm.image);
    setDoctorForm((prev) => ({ ...prev, image_url: previewUrl }));

    return () => URL.revokeObjectURL(previewUrl);
  }, [doctorForm.image]);

  // Schedule State
  const [selectedDoctorIdForSchedule, setSelectedDoctorIdForSchedule] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
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
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [adminAccountForm, setAdminAccountForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [savingAdminAccount, setSavingAdminAccount] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchBookings();
    fetchDoctors();
    fetchPendingDoctors();
    fetchTherapistAccounts();
    fetchSpecializations();
    fetchPatients();
  }, []);

  const fetchPendingDoctors = async () => {
    setLoadingPendingDoctors(true);
    try {
      const res = await doctorService.getPendingDoctors();
      if (res.data?.data) {
        setPendingDoctors(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar dokter pending:', err);
    } finally {
      setLoadingPendingDoctors(false);
    }
  };

  const handleApproveDoctor = async (doc) => {
    try {
      await doctorService.approveDoctor(doc.id);
      setNotification({
        type: 'success',
        message: `Akun dokter ${doc.name} berhasil disetujui (Approved). Dokter kini dapat login dan menerima reservasi.`,
      });
      fetchPendingDoctors();
      fetchDoctors();
      fetchStats();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyetujui akun dokter.',
      });
    }
  };

  const handleConfirmDoctorAction = async () => {
    if (!doctorActionModal.doctor) return;
    try {
      if (doctorActionModal.type === 'reject') {
        await doctorService.rejectDoctor(doctorActionModal.doctor.id, doctorActionModal.reason);
        setNotification({
          type: 'success',
          message: `Pendaftaran dokter ${doctorActionModal.doctor.name} telah ditolak.`,
        });
      } else if (doctorActionModal.type === 'suspend') {
        await doctorService.suspendDoctor(doctorActionModal.doctor.id, doctorActionModal.reason);
        setNotification({
          type: 'success',
          message: `Akun dokter ${doctorActionModal.doctor.name} berhasil ditangguhkan.`,
        });
      }
      setDoctorActionModal({ open: false, type: '', doctor: null, reason: '' });
      fetchPendingDoctors();
      fetchDoctors();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Gagal memproses aksi pada akun dokter.',
      });
    }
  };

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

  const fetchPatients = async () => {
    try {
      const res = await bookingService.getPatients();
      if (res.data?.data) {
        setPatients(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data pasien:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await doctorService.getAllForAdmin();
      if (res.data?.data) {
        setDoctors(res.data.data);
        if (res.data.data.length > 0 && !selectedDoctorIdForSchedule) {
          setSelectedDoctorIdForSchedule(res.data.data[0].id.toString());
          fetchSchedules(res.data.data[0].id);
        } else if (res.data.data.length === 0) {
          setSelectedDoctorIdForSchedule('');
          setSchedules([]);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil dokter:', err);
    }
  };

  const fetchTherapistAccounts = async () => {
    try {
      const res = await doctorService.getTherapistAccounts();
      if (res.data?.data) {
        setTherapistAccounts(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil akun dokter/terapis:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Gagal memuat daftar akun dokter/terapis.',
      });
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      const response = await adminService.changePassword(passwordForm);
      setNotification({
        type: 'success',
        message: response.data?.message || 'Kata sandi berhasil diperbarui.',
      });
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : err.response?.data?.message || 'Gagal mengubah kata sandi.',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCreateAdminAccount = async (e) => {
    e.preventDefault();
    setSavingAdminAccount(true);
    try {
      const response = await adminService.createAdminAccount(adminAccountForm);
      setNotification({
        type: 'success',
        message: response.data?.message || 'Akun admin berhasil dibuat.',
      });
      setAdminAccountForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : err.response?.data?.message || 'Gagal membuat akun admin.',
      });
    } finally {
      setSavingAdminAccount(false);
    }
  };

  // ==========================================
  // HANDLERS CRUD RESERVASI PASIEN (ADMIN)
  // ==========================================
  const openCreateBookingModal = () => {
    setEditingBooking(null);
    setBookingForm({
      patient_type: 'registered',
      user_id: patients[0]?.id || '',
      patient_name: '',
      patient_email: '',
      phone: patients[0]?.phone || '',
      doctor_id: doctors[0]?.id || '',
      schedule_id: '',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '09:00',
      end_time: '09:30',
      status: 'confirmed',
      patient_complaint: '',
      doctor_notes: '',
      cancel_reason: '',
    });
    setBookingModalOpen(true);
  };

  const openEditBookingModal = (booking) => {
    setEditingBooking(booking);
    setBookingForm({
      patient_type: 'registered',
      user_id: booking.user_id || booking.patient?.id || '',
      patient_name: booking.patient?.name || '',
      patient_email: booking.patient?.email || '',
      phone: booking.phone || booking.patient?.phone || '',
      doctor_id: booking.doctor?.id || booking.doctor_id || (doctors[0]?.id || ''),
      schedule_id: booking.schedule_id || '',
      appointment_date: booking.appointment_date || new Date().toISOString().split('T')[0],
      appointment_time: booking.appointment_time ? booking.appointment_time.slice(0, 5) : '09:00',
      end_time: booking.end_time ? booking.end_time.slice(0, 5) : '09:30',
      status: booking.status || 'confirmed',
      patient_complaint: booking.patient_complaint || '',
      doctor_notes: booking.doctor_notes || '',
      cancel_reason: booking.cancel_reason || '',
    });
    setBookingModalOpen(true);
  };

  const openDetailModal = (booking) => {
    setSelectedBookingForDetail(booking);
    setDetailModalOpen(true);
  };

  const confirmDeleteBooking = (booking) => {
    setBookingToDelete(booking);
    setDeleteModalOpen(true);
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    setDeletingBooking(true);
    try {
      await bookingService.delete(bookingToDelete.id);
      setNotification({ type: 'success', message: `Data reservasi ${bookingToDelete.booking_code} berhasil dihapus.` });
      setDeleteModalOpen(false);
      setBookingToDelete(null);
      fetchBookings();
      fetchStats();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus data reservasi pasien.',
      });
    } finally {
      setDeletingBooking(false);
    }
  };

  const handleSaveBooking = async (e) => {
    e.preventDefault();
    setSavingBooking(true);
    try {
      if (editingBooking) {
        const payload = {
          doctor_id: bookingForm.doctor_id,
          appointment_date: bookingForm.appointment_date,
          appointment_time: bookingForm.appointment_time,
          end_time: bookingForm.end_time,
          phone: bookingForm.phone,
          patient_complaint: bookingForm.patient_complaint,
          status: bookingForm.status,
          doctor_notes: bookingForm.doctor_notes,
          cancel_reason: bookingForm.cancel_reason,
        };
        await bookingService.adminUpdate(editingBooking.id, payload);
        setNotification({ type: 'success', message: `Reservasi ${editingBooking.booking_code} berhasil diperbarui.` });
      } else {
        const payload = {
          doctor_id: bookingForm.doctor_id,
          appointment_date: bookingForm.appointment_date,
          appointment_time: bookingForm.appointment_time,
          end_time: bookingForm.end_time,
          phone: bookingForm.phone,
          patient_complaint: bookingForm.patient_complaint,
          status: bookingForm.status,
          doctor_notes: bookingForm.doctor_notes,
        };

        if (bookingForm.patient_type === 'registered') {
          payload.user_id = bookingForm.user_id;
        } else {
          payload.patient_name = bookingForm.patient_name;
          payload.patient_email = bookingForm.patient_email;
        }

        await bookingService.adminCreate(payload);
        setNotification({ type: 'success', message: 'Reservasi pasien baru berhasil ditambahkan.' });
      }

      setBookingModalOpen(false);
      setEditingBooking(null);
      fetchBookings();
      fetchStats();
      fetchPatients();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan data reservasi.',
      });
    } finally {
      setSavingBooking(false);
    }
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    setSavingDoctor(true);
    setImageError('');
    try {
      const formData = new FormData();
      
      // Process image if provided
      if (doctorForm.image instanceof File) {
        setImageUploading(true);
        setImageUploadProgress(20);
        
        try {
          const processedImage = await processImage(doctorForm.image, {
            maxInputSizeMB: 5,
            maxSizeMB: 1,
            maxWidthOrHeight: 800,
            initialQuality: 0.85
          });
          
          setImageUploadProgress(80);
          formData.append('image', processedImage.file);
          console.log(`Image compressed: ${processedImage.compressionRatio}% reduction`);
        } catch (imgError) {
          setImageError(imgError.message);
          setSavingDoctor(false);
          setImageUploading(false);
          setNotification({
            type: 'error',
            message: imgError.message || 'Gagal memproses gambar.',
          });
          return;
        }
      }

      setImageUploadProgress(100);
      
      // Append other form fields
      Object.keys(doctorForm).forEach(key => {
        if (key !== 'image' && key !== 'image_url') {
          const value = key === 'is_active'
            ? (doctorForm[key] ? '1' : '0')
            : doctorForm[key];
          formData.append(key, value);
        }
      });

      if (editingDoctor) {
        await doctorService.update(editingDoctor.id, formData);
      } else {
        await doctorService.create(formData);
      }
      setNotification({
        type: 'success',
        message: editingDoctor ? 'Data dokter berhasil diperbarui.' : 'Dokter baru berhasil ditambahkan.',
      });
      closeDoctorModal();
      setImageUploading(false);
      setImageUploadProgress(0);
      fetchDoctors();
      fetchStats();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : err.response?.data?.message || (editingDoctor ? 'Gagal memperbarui dokter.' : 'Gagal menambahkan dokter.'),
      });
    } finally {
      setSavingDoctor(false);
      setImageUploading(false);
      setImageUploadProgress(0);
    }
  };

  const openCreateDoctorModal = () => {
    setEditingDoctor(null);
    setDoctorForm({
      user_id: '',
      specialization_id: specializations[0]?.id || '',
      name: '',
      sip_number: '',
      title: '',
      experience_years: 3,
      consultation_fee: 200000,
      bio: '',
      image_url: '',
      image: null,
      is_active: true,
    });
    setDoctorModalOpen(true);
  };

  const openEditDoctorModal = (doctor) => {
    setEditingDoctor(doctor);
    setDoctorForm({
      user_id: doctor.therapist_account?.id?.toString() || '',
      specialization_id: doctor.specialization?.id || '',
      name: doctor.name || '',
      sip_number: doctor.sip_number || '',
      title: doctor.title || '',
      experience_years: doctor.experience_years ?? 0,
      consultation_fee: doctor.consultation_fee ?? 0,
      bio: doctor.bio || '',
      image_url: doctor.image_url || '',
      image: null,
      is_active: Boolean(doctor.is_active),
    });
    setDoctorModalOpen(true);
  };

  const closeDoctorModal = () => {
    setDoctorModalOpen(false);
    setEditingDoctor(null);
    setDoctorForm((prev) => ({
      ...prev,
      image: null,
      image_url: editingDoctor?.image_url || '',
    }));
  };

  const handleDeleteDoctor = async (doctor) => {
    if (!window.confirm(`Hapus ${doctor.name} dari daftar dokter? Tindakan ini tidak dapat dibatalkan dari dashboard.`)) return;

    try {
      await doctorService.delete(doctor.id);
      setNotification({ type: 'success', message: 'Data dokter berhasil dihapus.' });
      if (selectedDoctorIdForSchedule === doctor.id.toString()) {
        setSelectedDoctorIdForSchedule('');
        setSchedules([]);
      }
      fetchDoctors();
      fetchStats();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menghapus dokter.',
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

  const openEditScheduleModal = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      doctor_id: schedule.doctor_id,
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time ? schedule.start_time.slice(0, 5) : '09:00',
      end_time: schedule.end_time ? schedule.end_time.slice(0, 5) : '15:00',
      slot_duration_minutes: schedule.slot_duration_minutes,
    });
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await scheduleService.update(editingSchedule.id, scheduleForm);
        setNotification({ type: 'success', message: 'Jadwal praktek berhasil diperbarui.' });
      } else {
        await scheduleService.create({
          ...scheduleForm,
          doctor_id: selectedDoctorIdForSchedule,
        });
        setNotification({ type: 'success', message: 'Jadwal praktek berhasil disimpan.' });
      }
      setScheduleModalOpen(false);
      setEditingSchedule(null);
      fetchSchedules(selectedDoctorIdForSchedule);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan jadwal.',
      });
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('settings')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
              activeTab === 'settings'
                ? 'bg-brand-600 text-white shadow-brand-500/25 ring-2 ring-brand-400'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            ⚙️ Edit Kontak Klinik (Telp, WA, Email, Alamat)
          </button>
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
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'bookings', label: '📋 Reservasi' },
          { key: 'doctors', label: '👨‍⚕️ Dokter' },
          { key: 'schedules', label: '🕐 Jadwal' },
          { key: 'guardians', label: '👨‍👩‍👧‍👦 Wali Pasien' },
          { key: 'children', label: '👶 Data Anak' },
          { key: 'services', label: '🩺 Layanan' },
          { key: 'session_notes', label: '📝 Catatan Sesi' },
          { key: 'invoices', label: '🧾 Invoices' },
          { key: 'payments', label: '💳 Pembayaran' },
          { key: 'articles', label: '📰 Artikel CMS' },
          { key: 'audit_logs', label: '🛡️ Audit Logs' },
          { key: 'settings', label: '⚙️ Pengaturan Klinik' },
          ...(['super_admin', 'admin'].includes(user?.role)
            ? [{ key: 'account_security', label: '🔐 Akun & Keamanan' }]
            : []),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
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

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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
                <option value="no_show">Tidak Hadir</option>
              </select>

              <button
                onClick={fetchBookings}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition"
              >
                Refresh
              </button>

              <button
                onClick={openCreateBookingModal}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Tambah Reservasi
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
                  <th className="p-3.5">Telepon</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Status Cepat</th>
                  <th className="p-3.5 text-right">Aksi</th>
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
                    <td colSpan="9" className="p-8 text-center text-slate-400">
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
                        <div className="text-[10px] text-slate-400">{b.phone || b.patient?.phone || b.patient?.email}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{b.doctor?.name}</div>
                        <div className="text-[10px] text-brand-600">{b.doctor?.specialization?.name}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{b.appointment_date}</div>
                        <div className="text-[10px] text-slate-500">{b.time_range} WIB</div>
                      </td>
                      <td className="p-3.5 max-w-[180px] truncate" title={b.patient_complaint}>
                        {b.patient_complaint}
                      </td>
                      <td className="p-3.5">
                        <div className="text-xs font-semibold text-slate-800">{b.phone || b.patient?.phone || '-'}</div>
                      </td>
                      <td className="p-3.5">
                        <BookingStatusBadge status={b.status} />
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {b.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                              title="Setujui Reservasi"
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                            >
                              Approve
                            </button>
                          )}

                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'in_consultation')}
                              title="Mulai Konsultasi"
                              className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px]"
                            >
                              Konsultasi
                            </button>
                          )}

                          {b.status === 'in_consultation' && (
                            <button
                              onClick={() => handleOpenCompleteModal(b)}
                              title="Selesaikan & Isi Catatan Dokter"
                              className="px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px]"
                            >
                              Selesai
                            </button>
                          )}

                          {['pending', 'confirmed'].includes(b.status) && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                              title="Tolak / Batalkan"
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px]"
                            >
                              Tolak
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetailModal(b)}
                            className="p-1.5 text-slate-400 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition"
                            title="Lihat Detail Reservasi"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditBookingModal(b)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Edit Data Reservasi"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDeleteBooking(b)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Reservasi Pasien"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
        <div className="space-y-8">
          
          {/* SECTION: VERIFIKASI PENDAFTARAN DOKTER (PENDING) */}
          <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-950 flex items-center gap-2">
                    Verifikasi Pendaftaran Dokter Baru
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-200 text-amber-900">
                      {pendingDoctors.length} Menunggu Approval
                    </span>
                  </h3>
                  <p className="text-xs text-amber-800/80">
                    Dokter yang mendaftar melalui portal publik memerlukan verifikasi SIP/STR sebelum dapat aktif
                  </p>
                </div>
              </div>
              <button
                onClick={fetchPendingDoctors}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 underline self-start sm:self-auto"
              >
                Segarkan Data
              </button>
            </div>

            {loadingPendingDoctors ? (
              <div className="p-8 text-center text-xs text-amber-800 font-medium">
                Memuat data dokter pending...
              </div>
            ) : pendingDoctors.length === 0 ? (
              <div className="p-8 text-center bg-white/70 rounded-2xl border border-dashed border-amber-200 text-slate-500 text-xs">
                Tidak ada pendaftaran dokter yang menunggu verifikasi saat ini. Seluruh dokter telah diproses.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl p-5 border border-amber-200/70 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={doc.profile_photo_url || doc.image_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}
                          alt={doc.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md inline-block">
                            {doc.specialization?.name || doc.specialization || 'Spesialis'}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 truncate mt-1">
                            {doc.name}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">
                            {doc.user?.email || doc.phone}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">No. Lisensi / SIP:</span>
                          <span className="font-mono font-bold text-slate-800">{doc.license_number || doc.sip_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pendidikan:</span>
                          <span className="font-medium text-slate-700 truncate max-w-[200px]">{doc.education || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Pengalaman:</span>
                          <span className="font-bold text-slate-800">{doc.experience_years} Tahun</span>
                        </div>
                        {doc.phone && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Telepon:</span>
                            <span className="font-medium text-slate-700">{doc.phone}</span>
                          </div>
                        )}
                      </div>

                      {doc.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 italic bg-amber-50/40 p-2 rounded-lg border border-amber-100">
                          "{doc.bio}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleApproveDoctor(doc)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Setujui (Approve)
                      </button>
                      <button
                        onClick={() => setDoctorActionModal({ open: true, type: 'reject', doctor: doc, reason: '' })}
                        className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION: DAFTAR DOKTER AKTIF */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Daftar Tenaga Medis & Terapis Terdaftar</h3>
            <button
              onClick={openCreateDoctorModal}
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
                    src={doc.image_thumbnail_url || doc.image_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                      {doc.specialization?.name || doc.specialization}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 mt-1">{doc.name}</h4>
                    <p className="text-xs text-slate-400">{doc.title}</p>
                    <p className="text-xs font-extrabold text-brand-700 mt-1">
                      {doc.formatted_fee || `Rp ${Number(doc.consultation_fee).toLocaleString('id-ID')}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>SIP: {doc.sip_number || doc.license_number}</span>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      doc.status === 'suspended'
                        ? 'bg-amber-100 text-amber-800'
                        : doc.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : doc.is_active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {doc.status === 'suspended' ? 'Ditangguhkan' : doc.status === 'rejected' ? 'Ditolak' : doc.is_active ? 'Aktif' : 'Non-Aktif'}
                    </span>

                    {/* Suspend action button for active doctors */}
                    {doc.status !== 'suspended' && (
                      <button
                        onClick={() => setDoctorActionModal({ open: true, type: 'suspend', doctor: doc, reason: '' })}
                        className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                        title={`Tangguhkan ${doc.name}`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => openEditDoctorModal(doc)}
                      className="p-1.5 text-slate-400 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition"
                      title={`Edit ${doc.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doc)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title={`Hapus ${doc.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                  setEditingSchedule(null);
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

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditScheduleModal(sch)}
                    className="p-2 text-slate-400 hover:text-brand-700 rounded-lg hover:bg-brand-50 transition"
                    title="Edit Shift"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(sch.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Hapus Shift"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* TAB 4: GUARDIANS (WALI / ORANG TUA)               */}
      {/* ================================================= */}
      {activeTab === 'guardians' && <AdminGuardiansTab />}

      {/* ================================================= */}
      {/* TAB 5: CHILDREN (PASIEN ANAK)                     */}
      {/* ================================================= */}
      {activeTab === 'children' && <AdminChildrenTab />}

      {/* ================================================= */}
      {/* TAB 6: SERVICES (LAYANAN TERAPI)                  */}
      {/* ================================================= */}
      {activeTab === 'services' && <AdminServicesTab />}

      {/* ================================
      ================= */}
      {/* TAB 7: SESSION NOTES (CATATAN SESI)               */}
      {/* ================================================= */}
      {activeTab === 'session_notes' && <AdminSessionNotesTab />}

      {/* ================================================= */}
      {/* TAB 8: INVOICES (TAGIHAN)                         */}
      {/* ================================================= */}
      {activeTab === 'invoices' && <AdminInvoicesTab />}

      {/* ================================================= */}
      {/* TAB 9: PAYMENTS (PEMBAYARAN)                      */}
      {/* ================================================= */}
      {activeTab === 'payments' && <AdminPaymentsTab />}

      {/* ================================================= */}
      {/* TAB 10: ARTICLES (CMS ARTIKEL)                    */}
      {/* ================================================= */}
      {activeTab === 'articles' && <AdminArticlesTab />}

      {/* ================================================= */}
      {/* TAB 11: AUDIT LOGS (LOG AKTIVITAS)                */}
      {/* ================================================= */}
      {activeTab === 'audit_logs' && <AdminAuditLogsTab />}

      {/* ================================================= */}
      {/* TAB 12: PENGATURAN KLINIK                         */}
      {/* ================================================= */}
      {activeTab === 'settings' && <AdminSettingsTab />}

      {activeTab === 'account_security' && ['super_admin', 'admin'].includes(user?.role) && (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Ubah Kata Sandi Admin</h2>
                <p className="text-xs text-slate-500">Pastikan akun admin tetap aman.</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Kata sandi saat ini</span>
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Kata sandi baru</span>
                <input
                  required
                  minLength={6}
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Konfirmasi kata sandi baru</span>
                <input
                  required
                  minLength={6}
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
              <p className="text-[11px] text-slate-500">Minimal 6 karakter, mengandung huruf besar/kecil, angka, dan simbol.</p>
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                <KeyRound className="h-4 w-4" />
                {savingPassword ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Buat Akun Admin</h2>
                <p className="text-xs text-slate-500">Hanya admin yang sudah masuk dapat membuat admin lain.</p>
              </div>
            </div>
            <form onSubmit={handleCreateAdminAccount} className="space-y-4">
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Nama</span>
                <input
                  required
                  value={adminAccountForm.name}
                  onChange={(e) => setAdminAccountForm({ ...adminAccountForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Email</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={adminAccountForm.email}
                  onChange={(e) => setAdminAccountForm({ ...adminAccountForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-bold text-slate-700">Nomor telepon (opsional)</span>
                <input
                  type="tel"
                  value={adminAccountForm.phone}
                  onChange={(e) => setAdminAccountForm({ ...adminAccountForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-bold text-slate-700">Kata sandi</span>
                  <input
                    required
                    minLength={6}
                    type="password"
                    autoComplete="new-password"
                    value={adminAccountForm.password}
                    onChange={(e) => setAdminAccountForm({ ...adminAccountForm, password: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-bold text-slate-700">Konfirmasi</span>
                  <input
                    required
                    minLength={6}
                    type="password"
                    autoComplete="new-password"
                    value={adminAccountForm.password_confirmation}
                    onChange={(e) => setAdminAccountForm({ ...adminAccountForm, password_confirmation: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </label>
              </div>
              <p className="text-[11px] text-slate-500">Password minimal 6 karakter dengan huruf besar/kecil, angka, dan simbol.</p>
              <button
                type="submit"
                disabled={savingAdminAccount}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                {savingAdminAccount ? 'Membuat Akun...' : 'Buat Akun Admin'}
              </button>
            </form>
          </section>
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

      {/* Modal tambah dan edit dokter */}
      <Modal
        isOpen={doctorModalOpen}
        onClose={closeDoctorModal}
        title={editingDoctor ? 'Edit Data Dokter / Terapis' : 'Tambah Dokter / Terapis Baru'}
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

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Akun Dokter (Penerima Notifikasi)</label>
            <select
              value={doctorForm.user_id}
              onChange={(e) => setDoctorForm({ ...doctorForm, user_id: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
            >
              <option value="">Belum ditautkan</option>
              {therapistAccounts.map((account) => {
                const assignedToAnotherDoctor = doctors.some(
                  (doctor) => doctor.therapist_account?.id === account.id && doctor.id !== editingDoctor?.id
                );
                return (
                  <option
                    key={account.id}
                    value={account.id}
                    disabled={assignedToAnotherDoctor}
                  >
                    {account.name} ({account.email}){assignedToAnotherDoctor ? ' — sudah ditautkan' : ''}
                  </option>
                );
              })}
            </select>
            <p className="text-[10px] text-slate-500">
              Tautkan akun login agar dokter ini menerima notifikasi saat pasien membuat reservasi.
            </p>
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
              <label className="text-xs font-bold text-slate-700">Gelar / Jabatan</label>
              <input
                type="text"
                value={doctorForm.title}
                onChange={(e) => setDoctorForm({ ...doctorForm, title: e.target.value })}
                placeholder="Sp.KFR, Terapis Senior"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Pengalaman (tahun)</label>
              <input
                required
                min="0"
                max="60"
                type="number"
                value={doctorForm.experience_years}
                onChange={(e) => setDoctorForm({ ...doctorForm, experience_years: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Biaya Konsultasi (Rp)</label>
              <input
                required
                min="0"
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

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={doctorForm.is_active}
              onChange={(e) => setDoctorForm({ ...doctorForm, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            Tampilkan dokter sebagai aktif di katalog publik
          </label>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Foto Dokter</label>
            <div className="space-y-2">
              {doctorForm.image_url && (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={doctorForm.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageError('');
                    setDoctorForm((prev) => ({ ...prev, image: file }));
                  }
                  e.target.value = '';
                }}
                disabled={imageUploading}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white disabled:opacity-50"
              />
              {imageError && (
                <p className="text-[10px] text-rose-600 font-semibold">{imageError}</p>
              )}
              {imageUploading && (
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div 
                      className="bg-brand-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${imageUploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-500">Memproses gambar... {imageUploadProgress}%</p>
                </div>
              )}
              <p className="text-[10px] text-slate-500">Format: JPEG, PNG, JPG, GIF, WebP (Maks. 5 MB sebelum dikompres; foto baru akan menggantikan foto lama setelah disimpan)</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={closeDoctorModal}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingDoctor}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition"
            >
              {savingDoctor ? 'Menyimpan...' : editingDoctor ? 'Simpan Perubahan' : 'Simpan Dokter'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah/Edit Shift Jadwal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          setEditingSchedule(null);
        }}
        title={editingSchedule ? 'Edit Shift Jam Praktek' : 'Tambah Shift Jam Praktek'}
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
              {editingSchedule ? 'Simpan Perubahan' : 'Simpan Shift'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================================================= */}
      {/* MODAL 1: TAMBAH & EDIT RESERVASI PASIEN (CRUD)    */}
      {/* ================================================= */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setEditingBooking(null);
        }}
        title={editingBooking ? `Edit Reservasi - ${editingBooking.booking_code}` : 'Tambah Reservasi Pasien Baru'}
      >
        <form onSubmit={handleSaveBooking} className="space-y-4">
          
          {/* Pemilihan Pasien (Hanya saat Buat Baru) */}
          {!editingBooking ? (
            <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block">Pilihan Pasien:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBookingForm({ ...bookingForm, patient_type: 'registered' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    bookingForm.patient_type === 'registered'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Pasien Terdaftar
                </button>
                <button
                  type="button"
                  onClick={() => setBookingForm({ ...bookingForm, patient_type: 'new' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    bookingForm.patient_type === 'new'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Pasien Baru / Walk-In
                </button>
              </div>

              {bookingForm.patient_type === 'registered' ? (
                <div className="space-y-2 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Pilih Pasien Terdaftar</label>
                    <select
                      value={bookingForm.user_id}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const patient = patients.find((p) => p.id.toString() === selectedId);
                        setBookingForm({
                          ...bookingForm,
                          user_id: selectedId,
                          phone: patient?.phone || bookingForm.phone,
                          patient_name: patient?.name || '',
                        });
                      }}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">-- Pilih Akun Pasien --</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.phone || p.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Nomor Telepon Pasien</label>
                    <input
                      required
                      type="text"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      placeholder="08123456789"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Nama Lengkap Pasien *</label>
                      <input
                        required
                        type="text"
                        value={bookingForm.patient_name}
                        onChange={(e) => setBookingForm({ ...bookingForm, patient_name: e.target.value })}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Nomor HP / WA *</label>
                      <input
                        required
                        type="text"
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Email Pasien (Opsional)</label>
                    <input
                      type="email"
                      value={bookingForm.patient_email}
                      onChange={(e) => setBookingForm({ ...bookingForm, patient_email: e.target.value })}
                      placeholder="pasien@gmail.com"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Info Pasien Saat Mode Edit */
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Pasien:</span>
                <span className="font-extrabold text-brand-700">{editingBooking.patient?.name || 'Pasien'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Kode:</span>
                <span className="font-mono font-bold text-slate-800">{editingBooking.booking_code}</span>
              </div>
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-slate-600">Nomor HP / WhatsApp Pasien</label>
                <input
                  required
                  type="text"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {/* Dokter & Spesialisasi */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Pilih Dokter / Terapis *</label>
            <select
              required
              value={bookingForm.doctor_id}
              onChange={(e) => setBookingForm({ ...bookingForm, doctor_id: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Pilih Dokter --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialization?.name})
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal & Jam Konsultasi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tanggal *</label>
              <input
                required
                type="date"
                value={bookingForm.appointment_date}
                onChange={(e) => setBookingForm({ ...bookingForm, appointment_date: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Jam Mulai *</label>
              <input
                required
                type="time"
                value={bookingForm.appointment_time}
                onChange={(e) => setBookingForm({ ...bookingForm, appointment_time: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Jam Selesai</label>
              <input
                type="time"
                value={bookingForm.end_time}
                onChange={(e) => setBookingForm({ ...bookingForm, end_time: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Status Reservasi */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Status Reservasi *</label>
            <select
              value={bookingForm.status}
              onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="pending">Menunggu Konfirmasi (Pending)</option>
              <option value="confirmed">Terkonfirmasi (Confirmed)</option>
              <option value="in_consultation">Sedang Konsultasi (In Consultation)</option>
              <option value="completed">Selesai (Completed)</option>
              <option value="cancelled">Dibatalkan (Cancelled)</option>
              <option value="no_show">Tidak Hadir (No Show)</option>
            </select>
          </div>

          {/* Keluhan Pasien */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Keluhan Pasien *</label>
            <textarea
              required
              rows={3}
              value={bookingForm.patient_complaint}
              onChange={(e) => setBookingForm({ ...bookingForm, patient_complaint: e.target.value })}
              placeholder="Contoh: Nyeri bahu kanan sejak 3 hari lalu, sulit digerakkan..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Catatan Dokter / Medis */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Catatan Dokter / Penanganan (Opsional)</label>
            <textarea
              rows={2}
              value={bookingForm.doctor_notes}
              onChange={(e) => setBookingForm({ ...bookingForm, doctor_notes: e.target.value })}
              placeholder="Catatan terapi, diagnosis awal, atau petunjuk khusus..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Alasan Pembatalan (Jika status cancelled) */}
          {bookingForm.status === 'cancelled' && (
            <div className="space-y-1 animate-fade-in">
              <label className="text-xs font-bold text-rose-700">Alasan Pembatalan</label>
              <input
                type="text"
                value={bookingForm.cancel_reason}
                onChange={(e) => setBookingForm({ ...bookingForm, cancel_reason: e.target.value })}
                placeholder="Alasan pasien atau klinik membatalkan jadwal..."
                className="w-full p-2.5 rounded-xl bg-rose-50/50 border border-rose-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setBookingModalOpen(false);
                setEditingBooking(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingBooking}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
            >
              {savingBooking ? 'Menyimpan...' : (editingBooking ? 'Simpan Perubahan' : 'Buat Reservasi')}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================================================= */}
      {/* MODAL 2: LIHAT DETAIL RESERVASI PASIEN            */}
      {/* ================================================= */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedBookingForDetail(null);
        }}
        title="Detail Lengkap Reservasi Pasien"
      >
        {selectedBookingForDetail && (
          <div className="space-y-4">
            {/* Header Kode & Status */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nomor Referensi Booking
                </span>
                <span className="font-mono font-extrabold text-brand-700 text-base">
                  {selectedBookingForDetail.booking_code}
                </span>
              </div>
              <div>
                <BookingStatusBadge status={selectedBookingForDetail.status} />
              </div>
            </div>

            {/* Grid Informasi Pasien & Dokter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl border border-slate-100 bg-white space-y-1.5">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Informasi Pasien</span>
                <p className="font-extrabold text-slate-800 text-sm">
                  {selectedBookingForDetail.patient?.name || 'Pasien'}
                </p>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-brand-600" />
                  <span>{selectedBookingForDetail.phone || selectedBookingForDetail.patient?.phone || '-'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectedBookingForDetail.patient?.email || 'Tidak ada email'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-100 bg-white space-y-1.5">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Tenaga Medis</span>
                <p className="font-extrabold text-slate-800 text-sm">
                  {selectedBookingForDetail.doctor?.name}
                </p>
                <span className="inline-block px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[10px] font-bold">
                  {selectedBookingForDetail.doctor?.specialization?.name}
                </span>
                <p className="text-[11px] text-slate-400">
                  Biaya: Rp {Number(selectedBookingForDetail.doctor?.consultation_fee || 0).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Jadwal Konsultasi */}
            <div className="p-3.5 rounded-2xl border border-slate-100 bg-white space-y-1 text-xs">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">Waktu Sesi Konsultasi</span>
              <div className="flex items-center gap-4 text-slate-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  {selectedBookingForDetail.formatted_date || selectedBookingForDetail.appointment_date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-600" />
                  {selectedBookingForDetail.time_range} WIB
                </span>
              </div>
            </div>

            {/* Keluhan Pasien */}
            <div className="p-3.5 rounded-2xl border border-slate-100 bg-white space-y-1 text-xs">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">Keluhan Utama Pasien</span>
              <p className="text-slate-700 font-medium leading-relaxed">
                {selectedBookingForDetail.patient_complaint}
              </p>
            </div>

            {/* Catatan Dokter jika ada */}
            {selectedBookingForDetail.doctor_notes && (
              <div className="p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/40 space-y-1 text-xs">
                <span className="font-bold text-emerald-800 uppercase text-[10px] block">Catatan Medis Dokter</span>
                <p className="text-emerald-950 font-medium leading-relaxed">
                  {selectedBookingForDetail.doctor_notes}
                </p>
              </div>
            )}

            {/* Alasan Pembatalan jika ada */}
            {selectedBookingForDetail.cancel_reason && (
              <div className="p-3.5 rounded-2xl border border-rose-100 bg-rose-50/40 space-y-1 text-xs">
                <span className="font-bold text-rose-800 uppercase text-[10px] block">Alasan Pembatalan</span>
                <p className="text-rose-950 font-medium">
                  {selectedBookingForDetail.cancel_reason}
                </p>
              </div>
            )}

            {/* Tombol Aksi Detail */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const b = selectedBookingForDetail;
                  setDetailModalOpen(false);
                  openEditBookingModal(b);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Reservasi Ini
              </button>

              <button
                type="button"
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedBookingForDetail(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================================================= */}
      {/* MODAL 3: KONFIRMASI HAPUS RESERVASI PASIEN        */}
      {/* ================================================= */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setBookingToDelete(null);
        }}
        title="Konfirmasi Hapus Data Reservasi"
      >
        {bookingToDelete && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                Hapus Reservasi #{bookingToDelete.booking_code}?
              </div>
              <p className="text-rose-700">
                Apakah Anda yakin ingin menghapus data reservasi pasien <strong>{bookingToDelete.patient?.name || 'Pasien'}</strong> pada jadwal <strong>{bookingToDelete.appointment_date} ({bookingToDelete.time_range} WIB)</strong>?
              </p>
              <p className="text-[11px] text-rose-600">
                Tindakan ini tidak dapat dibatalkan dan reservasi akan dihapus dari daftar operasional klinik.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setBookingToDelete(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deletingBooking}
                onClick={handleDeleteBooking}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deletingBooking ? 'Menghapus...' : 'Ya, Hapus Reservasi'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Aksi Dokter (Tolak / Tangguhkan) */}
      <Modal
        isOpen={doctorActionModal.open}
        onClose={() => setDoctorActionModal({ open: false, type: '', doctor: null, reason: '' })}
        title={doctorActionModal.type === 'reject' ? 'Tolak Pendaftaran Dokter' : 'Tangguhkan Akun Dokter'}
      >
        {doctorActionModal.doctor && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Anda akan {doctorActionModal.type === 'reject' ? 'menolak pendaftaran' : 'menangguhkan akun'} untuk dokter{' '}
              <strong>{doctorActionModal.doctor.name}</strong> (SIP: {doctorActionModal.doctor.license_number || doctorActionModal.doctor.sip_number}).
            </p>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Alasan {doctorActionModal.type === 'reject' ? 'Penolakan' : 'Penangguhan'} (Opsional/Direkomendasikan):
              </label>
              <textarea
                rows={3}
                value={doctorActionModal.reason}
                onChange={(e) => setDoctorActionModal((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Tuliskan catatan alasan untuk dokter..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDoctorActionModal({ open: false, type: '', doctor: null, reason: '' })}
                className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDoctorAction}
                className={`px-5 py-2 rounded-xl font-bold text-white transition shadow-sm ${
                  doctorActionModal.type === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {doctorActionModal.type === 'reject' ? 'Konfirmasi Tolak' : 'Konfirmasi Tangguhkan'}
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
