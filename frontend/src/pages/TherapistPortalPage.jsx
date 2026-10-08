import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { notificationService, therapistService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Calendar,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Edit2,
  Eye,
  Stethoscope,
  Save,
  ChevronLeft,
  ChevronRight,
  Share2,
  Loader2,
  LogOut,
  Bell
} from 'lucide-react';

export const TherapistPortalPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const activeTab = searchParams.get('tab') || 'dashboard'; // 'dashboard', 'patients', 'session-notes', 'calendar'

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notification) => {
    if (notification.read_at) return;

    try {
      await notificationService.markAsRead(notification.id);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
      )));
      setUnreadNotificationCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error('Failed to mark doctor notification as read:', err);
    }
  };

  // ==============================
  // DASHBOARD STATE
  // ==============================
  const [dashData, setDashData] = useState(null);
  const [loadingDash, setLoadingDash] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // ==============================
  // PATIENTS STATE
  // ==============================
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [searchPatient, setSearchPatient] = useState('');
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);

  // ==============================
  // SESSION NOTES STATE
  // ==============================
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [noteStatusFilter, setNoteStatusFilter] = useState('all');
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [savingNote, setSavingNote] = useState(false);
  const [viewingNoteDetail, setViewingNoteDetail] = useState(null);

  const [noteForm, setNoteForm] = useState({
    booking_id: '',
    note: '',
    interventions: '',
    observations: '',
    progress: '',
    next_plan: '',
    status: 'draft', // 'draft' or 'completed'
    share_with_guardian: true,
  });

  // ==============================
  // CALENDAR STATE
  // ==============================
  const [calendarAppointments, setCalendarAppointments] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard();
    } else if (activeTab === 'patients') {
      fetchPatients();
    } else if (activeTab === 'session-notes') {
      fetchSessionNotes();
    } else if (activeTab === 'calendar') {
      fetchCalendar();
    }
  }, [activeTab, noteStatusFilter, currentMonth]);

  useEffect(() => {
    let active = true;
    const fetchNotifications = async () => {
      try {
        const response = await notificationService.getAll();
        if (active && response.data?.success) {
          setNotifications(response.data.data || []);
          setUnreadNotificationCount(response.data.unread_count || 0);
        }
      } catch (err) {
        if (active) {
          console.error('Failed to load doctor notifications:', err);
        }
      }
    };

    fetchNotifications();
    const intervalId = window.setInterval(fetchNotifications, 30000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  // FETCH METHODS
  const fetchDashboard = async () => {
    try {
      setLoadingDash(true);
      setDashboardError('');
      const res = await therapistService.getDashboard();
      setDashData(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load therapist dashboard:', err);
      setDashboardError(err.response?.data?.message || 'Data dashboard gagal dimuat. Silakan coba lagi.');
    } finally {
      setLoadingDash(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const res = await therapistService.getPatients({ search: searchPatient });
      const list = res.data?.data || res.data || [];
      setPatients(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load patients:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchSessionNotes = async () => {
    try {
      setLoadingNotes(true);
      const params = {};
      if (noteStatusFilter !== 'all') {
        params.status = noteStatusFilter;
      }
      const res = await therapistService.getSessionNotes(params);
      const list = res.data?.data || res.data || [];
      setNotes(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load session notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  const fetchCalendar = async () => {
    try {
      setLoadingCalendar(true);
      const y = currentMonth.getFullYear();
      const m = currentMonth.getMonth();
      const start = new Date(y, m, 1).toISOString().split('T')[0];
      const end = new Date(y, m + 1, 0).toISOString().split('T')[0];
      const res = await therapistService.getCalendar({ start_date: start, end_date: end });
      const list = res.data?.data || res.data || [];
      setCalendarAppointments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load calendar:', err);
    } finally {
      setLoadingCalendar(false);
    }
  };

  // NOTE ACTIONS
  const handleOpenAddNote = (bookingId = '') => {
    setEditingNote(null);
    setNoteForm({
      booking_id: bookingId || (dashData?.today_appointments?.[0]?.id || ''),
      note: '',
      interventions: '',
      observations: '',
      progress: '',
      next_plan: '',
      status: 'draft',
      share_with_guardian: true,
    });
    setNoteModalOpen(true);
  };

  const handleOpenEditNote = (note) => {
    setEditingNote(note);
    setNoteForm({
      booking_id: note.booking_id || '',
      note: note.note || '',
      interventions: note.interventions || '',
      observations: note.observations || '',
      progress: note.progress || '',
      next_plan: note.next_plan || '',
      status: note.status || 'draft',
      share_with_guardian: !!note.share_with_guardian,
    });
    setNoteModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    setSavingNote(true);
    try {
      if (editingNote) {
        await therapistService.updateSessionNote(editingNote.id, noteForm);
      } else {
        await therapistService.createSessionNote(noteForm);
      }
      setNoteModalOpen(false);
      fetchSessionNotes();
      if (activeTab === 'dashboard') fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan catatan sesi.');
    } finally {
      setSavingNote(false);
    }
  };

  const todayAppointmentIds = new Set((dashData?.today_appointments || []).map((appointment) => appointment.id));
  const upcomingAppointments = (dashData?.upcoming_appointments || []).filter(
    (appointment) => !todayAppointmentIds.has(appointment.id)
  );

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Alabina · Klinik</p>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">Dashboard Dokter</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">Dokter / Terapis</p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-teal-50 hover:text-teal-800"
                aria-label={`Notifikasi${unreadNotificationCount ? `, ${unreadNotificationCount} belum dibaca` : ''}`}
                aria-expanded={notificationsOpen}
              >
                <Bell className="h-5 w-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <h2 className="text-sm font-bold text-slate-800">Notifikasi Reservasi</h2>
                    {unreadNotificationCount > 0 && (
                      <span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-800">
                        {unreadNotificationCount} baru
                      </span>
                    )}
                  </div>
                  {notifications.length ? (
                    <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${
                            notification.read_at ? 'bg-white' : 'bg-teal-50/60'
                          }`}
                        >
                          <span className="block text-xs font-bold text-slate-800">
                            {notification.data?.title || 'Notifikasi'}
                          </span>
                          <span className="mt-1 block text-xs text-slate-600">
                            {notification.data?.message}
                          </span>
                          {notification.data?.appointment_date && (
                            <span className="mt-1 block text-[10px] text-slate-500">
                              {notification.data?.booking_code ? `${notification.data.booking_code} · ` : ''}
                              {new Date(`${notification.data.appointment_date}T${notification.data.appointment_time || '00:00'}`).toLocaleString('id-ID')}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-6 text-center text-xs text-slate-500">Belum ada notifikasi reservasi.</p>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 flex gap-1 mb-8 overflow-x-auto">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Dashboard Praktik</span>
          </button>

          <button
            onClick={() => handleTabChange('patients')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'patients'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pasien Saya</span>
          </button>

          <button
            onClick={() => handleTabChange('session-notes')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'session-notes'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Catatan Sesi (Notes)</span>
          </button>

          <button
            onClick={() => handleTabChange('calendar')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'calendar'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Kalender Jadwal</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD                                          */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-700">Selamat bertugas, {user?.name || 'Dokter'}</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Ringkasan praktik</h2>
                <p className="mt-1 text-sm text-slate-500">Pantau agenda, pasien, dan dokumentasi sesi Anda.</p>
              </div>
              <button
                onClick={() => handleOpenAddNote()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
              >
                <Plus className="h-4 w-4" />
                Tulis Catatan Sesi
              </button>
            </div>

            {dashboardError && (
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{dashboardError}</span>
                </div>
                <button onClick={fetchDashboard} className="shrink-0 font-bold underline underline-offset-2">
                  Coba lagi
                </button>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400">Sesi Hari Ini</span>
                  <div className="text-2xl font-black text-slate-800">
                    {loadingDash ? '—' : dashData?.today_appointments?.length ?? '—'}
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400">Selesai Hari Ini</span>
                  <div className="text-2xl font-black text-slate-800">
                    {loadingDash ? '—' : dashData?.completed_today ?? '—'}
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400">Draft Catatan Sesi</span>
                  <div className="text-2xl font-black text-slate-800">
                    {loadingDash ? '—' : dashData?.pending_session_notes ?? '—'}
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400">Total Pasien Aktif</span>
                  <div className="text-2xl font-black text-slate-800">
                    {loadingDash ? '—' : dashData?.total_patients ?? '—'}
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400">Jadwal Terdekat</span>
                  <div className="text-2xl font-black text-slate-800">
                    {loadingDash ? '—' : dashData ? upcomingAppointments.length : '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
              {/* Today's appointments */}
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-600" />
                  <h3 className="text-lg font-bold text-slate-900">Agenda Terapi Hari Ini</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {loadingDash ? (
                <div className="py-8 text-center text-slate-400">Memuat agenda...</div>
              ) : !dashData?.today_appointments || dashData.today_appointments.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  Tidak ada agenda sesi terapi untuk hari ini.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {dashData.today_appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="px-3 py-2 rounded-xl bg-brand-50 text-brand-700 font-bold text-sm text-center min-w-[75px]">
                          {apt.appointment_time}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-base">
                              {apt.child?.name || 'Pasien Buah Hati'}
                            </h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                              {apt.status_label || apt.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Layanan: <span className="font-semibold text-slate-700">{apt.service?.name || 'Sesi Terapi'}</span>
                          </p>
                          {apt.patient_complaint && (
                            <p className="text-xs text-slate-500 italic mt-0.5">
                              Keluhan: "{apt.patient_complaint}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenAddNote(apt.id)}
                          className="py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Tulis Catatan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-teal-700" />
                    <h3 className="text-lg font-bold text-slate-900">Jadwal Berikutnya</h3>
                  </div>
                  <button
                    onClick={() => handleTabChange('calendar')}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900"
                  >
                    Buka kalender
                  </button>
                </div>

                {loadingDash ? (
                  <div className="py-8 text-center text-sm text-slate-400">Memuat jadwal...</div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-400">
                    Belum ada jadwal terkonfirmasi berikutnya.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center gap-3 py-3.5">
                        <div className="min-w-[68px] rounded-xl bg-teal-50 px-2 py-2 text-center text-xs font-bold text-teal-800">
                          <div>{appointment.appointment_time}</div>
                          <div className="mt-1 font-medium text-teal-700">
                            {appointment.appointment_date
                              ? new Date(`${appointment.appointment_date}T00:00:00`).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                })
                              : '—'}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {appointment.child?.name || 'Pasien'}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {appointment.service?.name || 'Sesi terapi'}
                          </p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                          {appointment.status_label || 'Terkonfirmasi'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PATIENTS                                           */}
        {/* ========================================================= */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pasien Anak yang Ditangani</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar anak dan orang tua yang terdaftar dalam sesi terapi Anda.
                </p>
              </div>

              <div className="flex items-center gap-2 max-w-xs w-full">
                <input
                  type="text"
                  placeholder="Cari nama pasien anak..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchPatients()}
                  className="w-full py-2 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={fetchPatients}
                  className="p-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loadingPatients ? (
              <div className="py-12 text-center text-slate-400">Memuat data pasien...</div>
            ) : patients.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">Belum Ada Pasien</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Belum ada pasien anak yang terdaftar pada jadwal Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients.map((b) => {
                  const child = b.child;
                  const guardian = child?.guardian;
                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 p-5 shadow-sm transition space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-lg">
                          {child?.name ? child.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">
                            {child?.name || 'Pasien Buah Hati'}
                          </h4>
                          <span className="text-xs text-slate-500">
                            {child?.gender === 'female' ? '👧 Perempuan' : '👦 Laki-laki'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                        <div>
                          <span className="text-slate-400">Wali / Orang Tua:</span>{' '}
                          <span className="font-semibold text-slate-800">
                            {guardian?.user?.name || b.patient?.name || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Layanan Terakhir:</span>{' '}
                          <span className="font-semibold text-slate-800">{b.service?.name || '-'}</span>
                        </div>
                        {child?.medical_history && (
                          <div className="text-slate-500 line-clamp-2 pt-1">
                            <span className="font-medium text-slate-600">Riwayat:</span> {child.medical_history}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => handleOpenAddNote(b.id)}
                          className="py-1.5 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition"
                        >
                          + Tambah Catatan Sesi
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SESSION NOTES                                      */}
        {/* ========================================================= */}
        {activeTab === 'session-notes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Catatan Rekam Sesi Klinis</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dokumentasi intervensi, respon motorik/bahasa anak, dan evaluasi rencana pertemuan berikutnya.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={noteStatusFilter}
                  onChange={(e) => setNoteStatusFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none"
                >
                  <option value="all">Semua Status Catatan</option>
                  <option value="draft">Draft (Belum Selesai)</option>
                  <option value="completed">Completed (Final)</option>
                </select>
                <button
                  onClick={() => handleOpenAddNote()}
                  className="py-2 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Tulis Catatan
                </button>
              </div>
            </div>

            {loadingNotes ? (
              <div className="py-12 text-center text-slate-400">Memuat catatan sesi...</div>
            ) : notes.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">Belum Ada Catatan</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Gunakan tombol di atas untuk membuat catatan sesi terapi baru.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 shadow-sm p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-1 ${
                            note.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {note.status === 'completed' ? 'Selesai' : 'Draft'}
                          </span>
                          <h4 className="font-bold text-slate-900 text-base">
                            {note.booking?.child?.name || 'Pasien Anak'}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewingNoteDetail(note)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditNote(note)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100"
                            title="Edit Catatan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-2">
                        {note.note}
                      </p>

                      {note.observations && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                          <span className="font-bold text-slate-900 block mb-0.5">Observasi:</span>
                          <span className="line-clamp-2">{note.observations}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>
                        {note.created_at
                          ? new Date(note.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </span>
                      {note.share_with_guardian && (
                        <span className="text-brand-600 font-semibold flex items-center gap-1">
                          <Share2 className="w-3 h-3" /> Dibagikan ke Wali
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CALENDAR                                           */}
        {/* ========================================================= */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                      )
                    }
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-lg font-bold text-slate-900">
                    {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                      )
                    }
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs font-semibold text-slate-500">
                  Total {calendarAppointments.length} Appointment Bulan Ini
                </span>
              </div>

              {loadingCalendar ? (
                <div className="py-12 text-center text-slate-400">Memuat kalender...</div>
              ) : calendarAppointments.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  Tidak ada janji temu terapis di bulan ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {calendarAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-brand-300 transition flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-center py-2 bg-brand-50 text-brand-700 rounded-xl font-bold">
                          <div className="text-xs uppercase">
                            {new Date(apt.appointment_date).toLocaleDateString('id-ID', { month: 'short' })}
                          </div>
                          <div className="text-lg">
                            {new Date(apt.appointment_date).getDate()}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {apt.child?.name || 'Pasien Anak'}
                          </h4>
                          <span className="text-xs text-slate-500">
                            Pukul {apt.appointment_time} WIB • {apt.service?.name || 'Terapi Spesialis'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold capitalize ${
                          apt.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT SESSION NOTE                             */}
      {/* ========================================================= */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {editingNote ? 'Edit Catatan Sesi Klinis' : 'Tulis Catatan Sesi Terapi Baru'}
              </h3>
              <button
                onClick={() => setNoteModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan Umum / Ringkasan Sesi *
                </label>
                <textarea
                  required
                  rows={3}
                  value={noteForm.note}
                  onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                  placeholder="Ringkasan aktivitas yang dilakukan hari ini..."
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Intervensi yang Dilakukan
                  </label>
                  <textarea
                    rows={2}
                    value={noteForm.interventions}
                    onChange={(e) => setNoteForm({ ...noteForm, interventions: e.target.value })}
                    placeholder="Metode stimulasi sensorik, artikulasi kata..."
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Hasil Observasi Perilaku
                  </label>
                  <textarea
                    rows={2}
                    value={noteForm.observations}
                    onChange={(e) => setNoteForm({ ...noteForm, observations: e.target.value })}
                    placeholder="Kontak mata, fokus atensi, regulasi emosi..."
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Progres Perkembangan
                  </label>
                  <textarea
                    rows={2}
                    value={noteForm.progress}
                    onChange={(e) => setNoteForm({ ...noteForm, progress: e.target.value })}
                    placeholder="Kemajuan dibanding pertemuan sebelumnya..."
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rencana Sesi Berikutnya (Next Plan)
                  </label>
                  <textarea
                    rows={2}
                    value={noteForm.next_plan}
                    onChange={(e) => setNoteForm({ ...noteForm, next_plan: e.target.value })}
                    placeholder="Latihan lanjutan dan pekerjaan rumah untuk ortu..."
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status Dokumen
                  </label>
                  <select
                    value={noteForm.status}
                    onChange={(e) => setNoteForm({ ...noteForm, status: e.target.value })}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="draft">Draft (Bisa diubah kembali)</option>
                    <option value="completed">Completed (Final / Selesai)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="shareGuardian"
                    checked={noteForm.share_with_guardian}
                    onChange={(e) =>
                      setNoteForm({ ...noteForm, share_with_guardian: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-brand-600"
                  />
                  <label htmlFor="shareGuardian" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Bagikan Catatan dengan Orang Tua
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingNote}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2"
                >
                  {savingNote ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Catatan Sesi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VIEW NOTE DETAIL                                    */}
      {/* ========================================================= */}
      {viewingNoteDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <span className="text-xs uppercase font-bold text-brand-600">
                  {viewingNoteDetail.status}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {viewingNoteDetail.booking?.child?.name || 'Pasien Buah Hati'}
                </h3>
              </div>
              <button
                onClick={() => setViewingNoteDetail(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-2 text-xs sm:text-sm">
              <div>
                <span className="font-bold text-slate-700 block uppercase text-[11px] mb-1">
                  Catatan Sesi
                </span>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-xl">{viewingNoteDetail.note}</p>
              </div>

              {viewingNoteDetail.interventions && (
                <div>
                  <span className="font-bold text-slate-700 block uppercase text-[11px] mb-1">
                    Intervensi
                  </span>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl">
                    {viewingNoteDetail.interventions}
                  </p>
                </div>
              )}

              {viewingNoteDetail.observations && (
                <div>
                  <span className="font-bold text-slate-700 block uppercase text-[11px] mb-1">
                    Observasi
                  </span>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl">
                    {viewingNoteDetail.observations}
                  </p>
                </div>
              )}

              {viewingNoteDetail.progress && (
                <div>
                  <span className="font-bold text-slate-700 block uppercase text-[11px] mb-1">
                    Progres Perkembangan
                  </span>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl">{viewingNoteDetail.progress}</p>
                </div>
              )}

              {viewingNoteDetail.next_plan && (
                <div>
                  <span className="font-bold text-slate-700 block uppercase text-[11px] mb-1">
                    Rencana Pertemuan Berikutnya
                  </span>
                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl">{viewingNoteDetail.next_plan}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingNoteDetail(null)}
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

export default TherapistPortalPage;
