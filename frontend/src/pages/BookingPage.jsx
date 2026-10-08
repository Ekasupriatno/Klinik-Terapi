import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorService, bookingService, serviceService, parentService, clinicSettingService } from '../services/api';
import { SlotGridSkeleton } from '../components/common/Skeleton';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  PhoneCall,
  Sparkles,
  Check,
  Baby,
  Tag,
  Plus,
  HeartHandshake
} from 'lucide-react';

export const BookingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [clinicWhatsapp, setClinicWhatsapp] = useState('6282235123063');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Stepper Steps:
  // 1 = Pilih Anak, 2 = Pilih Layanan, 3 = Pilih Dokter, 4 = Tanggal & Slot, 5 = Keluhan & No Telp, 6 = Konfirmasi
  const [step, setStep] = useState(1);

  // Data Lists
  const [childrenList, setChildrenList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Selections
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
  const [guestChildName, setGuestChildName] = useState('');

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedService, setSelectedService] = useState(null);

  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [slotsData, setSlotsData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [complaint, setComplaint] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);

  // Quick Inline Add Child
  const [showAddChildInline, setShowAddChildInline] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthDate, setNewChildBirthDate] = useState('');
  const [newChildGender, setNewChildGender] = useState('male');
  const [savingNewChild, setSavingNewChild] = useState(false);

  // 1. Initial Data Fetching
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [servicesRes, doctorsRes] = await Promise.all([
          serviceService.getAll({ is_active: true }),
          doctorService.getAll(),
        ]);

        const srvs = servicesRes.data?.data || servicesRes.data || [];
        const docs = doctorsRes.data?.data || doctorsRes.data || [];

        setServicesList(Array.isArray(srvs) ? srvs : []);
        setDoctors(Array.isArray(docs) ? docs : []);

        // Pre-select service from URL param
        const serviceIdParam = searchParams.get('service_id');
        if (serviceIdParam && Array.isArray(srvs)) {
          const foundSrv = srvs.find((s) => s.id.toString() === serviceIdParam);
          if (foundSrv) {
            setSelectedServiceId(serviceIdParam);
            setSelectedService(foundSrv);
          }
        }

        // Pre-select doctor from URL param
        const docIdParam = searchParams.get('doctor_id');
        if (docIdParam && Array.isArray(docs)) {
          const foundDoc = docs.find((d) => d.id.toString() === docIdParam);
          if (foundDoc) {
            setSelectedDoctorId(docIdParam);
            setSelectedDoctor(foundDoc);
          }
        }
      } catch (err) {
        console.error('Failed to load services or doctors:', err);
      }

      try {
        const settingsRes = await clinicSettingService.getPublicSettings();
        if (settingsRes.data?.data?.whatsapp) {
          setClinicWhatsapp(settingsRes.data.data.whatsapp.replace(/[^0-9]/g, ''));
        }
      } catch (err) {
        console.error('Failed to load clinic settings:', err);
      }
    };

    loadInitialData();
  }, [searchParams]);

  // Load children if user is logged in
  useEffect(() => {
    if (isAuthenticated) {
      const loadChildren = async () => {
        try {
          const res = await parentService.getChildren();
          const list = res.data?.data || res.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setChildrenList(list);

            const childIdParam = searchParams.get('child_id');
            if (childIdParam) {
              const foundChild = list.find((c) => c.id.toString() === childIdParam);
              if (foundChild) {
                setSelectedChildId(childIdParam);
                setSelectedChild(foundChild);
              }
            } else if (!selectedChildId && list.length === 1) {
              // Auto select if only 1 child
              setSelectedChildId(list[0].id.toString());
              setSelectedChild(list[0]);
            }
          }
        } catch (err) {
          console.error('Failed to load parent children:', err);
        }
      };

      loadChildren();
    }
  }, [isAuthenticated, searchParams]);

  // Load slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      loadSlots();
    }
  }, [selectedDoctorId, selectedDate]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    setErrorMsg('');
    setSelectedSlot(null);
    try {
      const res = await doctorService.getAvailableSlots(selectedDoctorId, selectedDate);
      if (res.data?.data) {
        setSlotsData(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil slot dokter:', err);
      setErrorMsg('Gagal memuat slot jadwal. Silakan coba kembali.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectSlot = (slot) => {
    if (!slot.is_available) return;
    setSelectedSlot(slot);
  };

  // Quick save new child
  const handleCreateChildInline = async (e) => {
    e.preventDefault();
    if (!newChildName.trim() || !newChildBirthDate) return;

    setSavingNewChild(true);
    try {
      const res = await parentService.createChild({
        name: newChildName,
        birth_date: newChildBirthDate,
        gender: newChildGender,
      });
      const created = res.data?.data || res.data;
      setChildrenList((prev) => [...prev, created]);
      setSelectedChildId(created.id.toString());
      setSelectedChild(created);
      setShowAddChildInline(false);
      setNewChildName('');
      setNewChildBirthDate('');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan data anak.');
    } finally {
      setSavingNewChild(false);
    }
  };

  const handleSubmitBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/booking' } });
      return;
    }

    if (!selectedSlot || !selectedDoctor || !complaint.trim() || !phone.trim()) {
      setErrorMsg('Mohon lengkapi seluruh informasi booking yang diperlukan.');
      return;
    }

    // For authenticated users, child_id is required
    if (isAuthenticated && !selectedChildId) {
      setErrorMsg('Mohon pilih anak terlebih dahulu.');
      return;
    }

    // Service is now required based on PRD
    if (!selectedServiceId) {
      setErrorMsg('Mohon pilih layanan terapi terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        doctor_id: parseInt(selectedDoctor.id),
        service_id: parseInt(selectedServiceId),
        child_id: selectedChildId ? parseInt(selectedChildId) : null,
        schedule_id: selectedSlot.schedule_id ? parseInt(selectedSlot.schedule_id) : null,
        appointment_date: selectedDate,
        appointment_time: selectedSlot.start_time,
        patient_complaint: complaint,
        phone: phone,
      };

      const res = await bookingService.create(payload);
      if (res.data?.data) {
        setSuccessBooking(res.data.data);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setErrorMsg(formatBookingError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const formatBookingError = (err) => {
    const fieldErrors = err.response?.data?.errors;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const messages = Object.values(fieldErrors)
        .flat()
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean);
      if (messages.length > 0) {
        return [...new Set(messages)].join('\n');
      }
    }

    const summary = err.response?.data?.message;
    if (typeof summary === 'string' && summary.trim()) {
      return summary.replace(/\s*\(and \d+ more errors?\)\s*$/i, '').trim();
    }

    return 'Terjadi kendala saat memproses booking Anda.';
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 30);
    return max.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Reservasi Terapi Terpadu
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Pemesanan Jadwal Sesi Terapi
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Pilih data anak, layanan terapi, terapis ahli, dan slot waktu yang nyaman untuk buah hati Anda.
        </p>
      </div>

      {/* Stepper Progress */}
      {!successBooking && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[580px] text-xs font-bold gap-1">
            {[
              { num: 1, label: '1. Pasien Anak' },
              { num: 2, label: '2. Layanan Terapi' },
              { num: 3, label: '3. Dokter/Terapis' },
              { num: 4, label: '4. Tanggal & Slot' },
              { num: 5, label: '5. Keluhan & Kontak' },
              { num: 6, label: '6. Konfirmasi' },
            ].map((st) => (
              <div
                key={st.num}
                onClick={() => {
                  if (st.num < step) setStep(st.num);
                }}
                className={`py-2 px-3 rounded-xl transition text-center whitespace-nowrap cursor-pointer ${
                  step === st.num
                    ? 'bg-brand-600 text-white shadow-sm'
                    : step > st.num
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-400'
                }`}
              >
                {st.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Gagal Menyimpan Booking</p>
            <div className="text-xs mt-0.5 text-rose-700 space-y-1">
              {errorMsg.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* SUCCESS SCREEN                                    */}
      {/* ================================================= */}
      {successBooking ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Reservasi Berhasil Diajukan!
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Nomor Referensi Booking Anda adalah:
            </p>
            <div className="inline-block px-5 py-2 rounded-2xl bg-slate-100 text-brand-800 font-mono font-extrabold text-lg border border-slate-200 tracking-wider">
              {successBooking.booking_code}
            </div>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-3 text-xs sm:text-sm">
            {successBooking.child && (
              <div className="flex justify-between">
                <span className="text-slate-500">Pasien Anak:</span>
                <span className="font-bold text-slate-800">{successBooking.child?.name}</span>
              </div>
            )}
            {successBooking.service && (
              <div className="flex justify-between">
                <span className="text-slate-500">Layanan Terapi:</span>
                <span className="font-bold text-slate-800">{successBooking.service?.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Terapis:</span>
              <span className="font-bold text-slate-800">{successBooking.doctor?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal:</span>
              <span className="font-bold text-slate-800">
                {successBooking.formatted_date || successBooking.appointment_date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu:</span>
              <span className="font-bold text-slate-800">{successBooking.time_range} WIB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status Awal:</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Menunggu Konfirmasi
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href={`https://wa.me/${clinicWhatsapp}?text=Halo%20Admin%20Klinik%20Terapi,%20saya%20telah%20membuat%20booking%20dengan%20kode%20${encodeURIComponent(
                successBooking.booking_code
              )}%20untuk%20dokter%20${encodeURIComponent(
                successBooking.doctor?.name || ''
              )}.%20Mohon%20konfirmasinya.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <PhoneCall className="w-4 h-4" />
              Kirim Notifikasi via WhatsApp
            </a>

            <button
              onClick={() => navigate('/my-bookings')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
            >
              Lihat Riwayat Booking Saya
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ================================================= */}
          {/* STEP 1: SELECT CHILD                              */}
          {/* ================================================= */}
          {step === 1 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Baby className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Langkah 1: Pilih Pasien Buah Hati</h3>
                    <p className="text-xs text-slate-500">
                      Tentukan anak yang akan mengikuti sesi konsultasi atau terapi.
                    </p>
                  </div>
                </div>

                {isAuthenticated && !showAddChildInline && (
                  <button
                    onClick={() => setShowAddChildInline(true)}
                    className="py-2 px-3 rounded-xl bg-brand-50 text-brand-700 font-bold text-xs hover:bg-brand-100 transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Anak Baru
                  </button>
                )}
              </div>

              {/* Inline Add Child Form */}
              {showAddChildInline && (
                <form
                  onSubmit={handleCreateChildInline}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-slate-800 text-sm">Daftarkan Anak Baru Cepat</h4>
                    <button
                      type="button"
                      onClick={() => setShowAddChildInline(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama Anak"
                        value={newChildName}
                        onChange={(e) => setNewChildName(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                        Tanggal Lahir *
                      </label>
                      <input
                        type="date"
                        required
                        value={newChildBirthDate}
                        onChange={(e) => setNewChildBirthDate(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                        Jenis Kelamin
                      </label>
                      <select
                        value={newChildGender}
                        onChange={(e) => setNewChildGender(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                      >
                        <option value="male">Laki-laki</option>
                        <option value="female">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingNewChild}
                      className="py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
                    >
                      {savingNewChild ? 'Menyimpan...' : 'Simpan & Pilih Anak'}
                    </button>
                  </div>
                </form>
              )}

              {/* Children List */}
              {isAuthenticated ? (
                childrenList.length === 0 && !showAddChildInline ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Baby className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                      Anda belum mendaftarkan profil anak.
                    </p>
                    <button
                      onClick={() => setShowAddChildInline(true)}
                      className="mt-3 py-2 px-4 rounded-xl bg-brand-600 text-white text-xs font-bold"
                    >
                      + Tambahkan Profil Anak
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {childrenList.map((ch) => {
                      const isSelected = selectedChildId === ch.id.toString();
                      return (
                        <div
                          key={ch.id}
                          onClick={() => {
                            setSelectedChildId(ch.id.toString());
                            setSelectedChild(ch);
                          }}
                          className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                            isSelected
                              ? 'border-brand-600 bg-brand-50/70 shadow-sm ring-2 ring-brand-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                              ch.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {ch.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm leading-tight">
                                {ch.name}
                              </h4>
                              <span className="text-xs text-slate-500">
                                {ch.gender === 'female' ? '👧 Perempuan' : '👦 Laki-laki'}
                              </span>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="text-xs font-bold text-amber-900">
                    💡 Booking Sebagai Tamu atau Pasien Mandiri
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nama Pasien Anak / Pendaftar:
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nama anak..."
                      value={guestChildName}
                      onChange={(e) => setGuestChildName(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Atau masuk / daftar akun orang tua untuk mengaitkan rekam medis anak Anda secara permanen.
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => setStep(2)}
                  className="py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-sm"
                >
                  <span>Lanjut: Pilih Layanan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* STEP 2: SELECT SERVICE                            */}
          {/* ================================================= */}
          {step === 2 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Langkah 2: Pilih Layanan Terapi</h3>
                    <p className="text-xs text-slate-500">
                      Pilih jenis program atau terapi yang dibutuhkan buah hati.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicesList.map((srv) => {
                  const isSelected = selectedServiceId === srv.id.toString();
                  return (
                    <div
                      key={srv.id}
                      onClick={() => {
                        setSelectedServiceId(srv.id.toString());
                        setSelectedService(srv);
                      }}
                      className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/70 shadow-sm ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-100 text-brand-800">
                            {srv.specialization?.name || 'Terapi Spesialis'}
                          </span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">{srv.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {srv.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-brand-500" />
                          {srv.duration_minutes || 45} Menit
                        </span>
                        {srv.show_price !== false && (
                          <span className="font-extrabold text-brand-700">
                            {formatCurrency(srv.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setStep(1)}
                  className="py-3 px-5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-sm"
                >
                  <span>Lanjut: Pilih Dokter/Terapis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* STEP 3: SELECT DOCTOR                             */}
          {/* ================================================= */}
          {step === 3 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Langkah 3: Pilih Dokter / Terapis</h3>
                  <p className="text-xs text-slate-500">
                    Pilih terapis terpercaya yang akan mendampingi sesi terapi buah hati.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doc) => {
                  const isSelected = selectedDoctorId === doc.id.toString();
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoctorId(doc.id.toString());
                        setSelectedDoctor(doc);
                      }}
                      className={`p-5 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/70 shadow-sm ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.image_thumbnail_url || doc.image_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'}
                          alt={doc.name}
                          className="w-14 h-14 rounded-2xl object-cover bg-slate-100"
                          loading="lazy"
                          decoding="async"
                        />
                        <div>
                          <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full inline-block mb-1">
                            {doc.specialization?.name || 'Terapis Ahli'}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">
                            {doc.name}
                          </h4>
                          <span className="text-xs text-slate-500">
                            Pengalaman {doc.experience_years || 3}+ Tahun
                          </span>
                        </div>
                      </div>

                      {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setStep(2)}
                  className="py-3 px-5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button
                  disabled={!selectedDoctorId}
                  onClick={() => setStep(4)}
                  className="py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <span>Lanjut: Tanggal & Slot</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* STEP 4: DATE & SLOTS                              */}
          {/* ================================================= */}
          {step === 4 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Langkah 4: Pilih Tanggal & Waktu Konsultasi</h3>
                  <p className="text-xs text-slate-500">
                    Jadwal ketersediaan {selectedDoctor?.name || 'Dokter'}.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                  Tanggal Kunjungan Terapi:
                </label>
                <input
                  type="date"
                  min={getMinDate()}
                  max={getMaxDate()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-64 py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white"
                />
              </div>

              {/* Slot Picker */}
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase mb-3">
                  Slot Waktu Tersedia:
                </div>

                {loadingSlots ? (
                  <SlotGridSkeleton />
                ) : !slotsData || !slotsData.slots || slotsData.slots.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs sm:text-sm">
                    {slotsData?.message || 'Tidak ada slot waktu tersedia pada tanggal ini. Silakan pilih tanggal lain.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {slotsData.slots.map((slot, index) => {
                      const isSelected = selectedSlot?.start_time === slot.start_time;
                      return (
                        <button
                          key={index}
                          type="button"
                          disabled={!slot.is_available}
                          onClick={() => handleSelectSlot(slot)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/20'
                              : slot.is_available
                              ? 'bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 text-slate-700'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{slot.start_time}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setStep(3)}
                  className="py-3 px-5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button
                  disabled={!selectedSlot}
                  onClick={() => setStep(5)}
                  className="py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <span>Lanjut: Keluhan & Kontak</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* STEP 5: COMPLAINT & PHONE                         */}
          {/* ================================================= */}
          {step === 5 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Langkah 5: Keluhan Pasien & Nomor WhatsApp</h3>
                  <p className="text-xs text-slate-500">
                    Jelaskan kondisi atau tantangan tumbuh kembang yang dihadapi buah hati.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Klinik akan mengirimkan pengingat jadwal dan konfirmasi melalui nomor ini.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Keluhan & Catatan Khusus (Min. 10 Karakter) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    minLength={10}
                    placeholder="Jelaskan secara singkat kondisi anak, misal: Anak belum lancar bicara di usia 3 tahun, kesulitan fokus..."
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setStep(4)}
                  className="py-3 px-5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button
                  disabled={!phone.trim() || complaint.trim().length < 10}
                  onClick={() => setStep(6)}
                  className="py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <span>Lanjut: Konfirmasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* STEP 6: CONFIRMATION                              */}
          {/* ================================================= */}
          {step === 6 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Langkah 6: Konfirmasi Jadwal</h3>
                  <p className="text-xs text-slate-500">
                    Mohon periksa kembali detail pesanan sesi terapi sebelum mengirimkan formulir.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4 text-xs sm:text-sm">
                <div className="flex justify-between pb-3 border-b border-slate-200">
                  <span className="text-slate-500">Pasien Anak:</span>
                  <span className="font-bold text-slate-900">
                    {selectedChild?.name || guestChildName || 'Pasien Umum'}
                  </span>
                </div>

                <div className="flex justify-between pb-3 border-b border-slate-200">
                  <span className="text-slate-500">Layanan Terapi:</span>
                  <span className="font-bold text-brand-700">
                    {selectedService?.name || 'Sesi Terapi Spesialis'}
                  </span>
                </div>

                <div className="flex justify-between pb-3 border-b border-slate-200">
                  <span className="text-slate-500">Dokter / Terapis:</span>
                  <span className="font-bold text-slate-900">{selectedDoctor?.name}</span>
                </div>

                <div className="flex justify-between pb-3 border-b border-slate-200">
                  <span className="text-slate-500">Tanggal Sesi:</span>
                  <span className="font-bold text-slate-900">
                    {new Date(selectedDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex justify-between pb-3 border-b border-slate-200">
                  <span className="text-slate-500">Waktu / Slot:</span>
                  <span className="font-bold text-slate-900">{selectedSlot?.start_time} WIB</span>
                </div>

                <div className="flex justify-between pb-3 border-b border-slate-200">
                  <span className="text-slate-500">Nomor WhatsApp:</span>
                  <span className="font-bold text-slate-900">{phone}</span>
                </div>

                <div className="pt-1">
                  <span className="text-slate-500 block mb-1">Keluhan / Catatan:</span>
                  <p className="font-medium text-slate-800 italic bg-white p-3 rounded-xl border border-slate-200">
                    "{complaint}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setStep(5)}
                  className="py-3 px-5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Ubah Data
                </button>
                <button
                  disabled={submitting}
                  onClick={handleSubmitBooking}
                  className="py-3.5 px-8 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Memproses Reservasi...' : 'Ajukan Reservasi Sekarang'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingPage;
