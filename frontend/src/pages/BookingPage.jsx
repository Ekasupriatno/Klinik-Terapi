import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doctorService, bookingService } from '../services/api';
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
  Check
} from 'lucide-react';

export const BookingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Wizard Steps: 1 = Pilih Dokter, 2 = Jadwal & Slot, 3 = Keluhan Pasien, 4 = Konfirmasi
  const [step, setStep] = useState(1);

  // Form State
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(() => {
    // Default hari ini format YYYY-MM-DD
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [slotsData, setSlotsData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [complaint, setComplaint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);

  // Ambil data dokter saat pertama kali mount
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await doctorService.getAll();
        if (res.data?.data) {
          setDoctors(res.data.data);
          
          // Cek apakah ada query param ?doctor_id=
          const docIdParam = searchParams.get('doctor_id');
          if (docIdParam) {
            const found = res.data.data.find(d => d.id.toString() === docIdParam);
            if (found) {
              setSelectedDoctorId(docIdParam);
              setSelectedDoctor(found);
              setStep(2); // langsung lompat ke langkah 2
            }
          }
        }
      } catch (err) {
        console.error('Gagal mengambil daftar dokter:', err);
      }
    };

    loadDoctors();
  }, [searchParams]);

  // Saat dokter atau tanggal berubah, muat slot waktu tersedia
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

  const handleSelectDoctor = (doctor) => {
    setSelectedDoctorId(doctor.id.toString());
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleSelectSlot = (slot) => {
    if (!slot.is_available) return;
    setSelectedSlot(slot);
  };

  const handleSubmitBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/booking' } });
      return;
    }

    if (!selectedSlot || !selectedDoctor || !complaint.trim()) {
      setErrorMsg('Mohon lengkapi seluruh informasi booking.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        doctor_id: parseInt(selectedDoctor.id),
        schedule_id: selectedSlot.schedule_id ? parseInt(selectedSlot.schedule_id) : null,
        appointment_date: selectedDate,
        appointment_time: selectedSlot.start_time,
        patient_complaint: complaint,
      };

      console.log('Booking payload:', payload);
      const res = await bookingService.create(payload);
      console.log('Booking response:', res);
      if (res.data?.data) {
        setSuccessBooking(res.data.data);
      }
    } catch (err) {
      console.error('Booking error:', err);
      console.error('Error response:', err.response?.data);
      const msg = err.response?.data?.message || err.response?.data?.errors?.appointment_time?.[0] || 'Terjadi kendala saat memproses booking Anda.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      
      {/* Title & Wizard Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
          <Sparkles className="w-3.5 h-3.5" />
          Sistem Reservasi Appointment Digital
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Reservasi Jadwal Konsultasi Dokter
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Pilih dokter spesialis, tentukan tanggal & jam praktek yang sesuai, dan dapatkan konfirmasi jadwal pasti.
        </p>
      </div>

      {/* Stepper Wizard Indicator */}
      {!successBooking && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
            <div className={`p-2.5 rounded-2xl transition ${step >= 1 ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'text-slate-400'}`}>
              1. Pilih Dokter
            </div>
            <div className={`p-2.5 rounded-2xl transition ${step >= 2 ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'text-slate-400'}`}>
              2. Tanggal & Slot
            </div>
            <div className={`p-2.5 rounded-2xl transition ${step >= 3 ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'text-slate-400'}`}>
              3. Keluhan Pasien
            </div>
            <div className={`p-2.5 rounded-2xl transition ${step >= 4 ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'text-slate-400'}`}>
              4. Konfirmasi
            </div>
          </div>
        </div>
      )}

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Gagal Menyimpan Booking</p>
            <p className="text-xs mt-0.5 text-rose-700">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* SUCCESS SCREEN                                    */}
      {/* ================================================= */}
      {successBooking ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-card text-center space-y-6 animate-scale-up">
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
            <div className="flex justify-between">
              <span className="text-slate-500">Dokter Terapi:</span>
              <span className="font-bold text-slate-800">{successBooking.doctor?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal:</span>
              <span className="font-bold text-slate-800">{successBooking.formatted_date || successBooking.appointment_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu Konsultasi:</span>
              <span className="font-bold text-slate-800">{successBooking.time_range} WIB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status Awal:</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Menunggu Konfirmasi</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href={`https://wa.me/6281234567890?text=Halo%20Admin%20Klinik%20Terapi,%20saya%20telah%20membuat%20booking%20dengan%20kode%20${encodeURIComponent(successBooking.booking_code)}%20untuk%20dokter%20${encodeURIComponent(successBooking.doctor?.name || '')}.%20Mohon%20konfirmasinya.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
            >
              <PhoneCall className="w-4 h-4" />
              Kirim Notifikasi via WhatsApp
            </a>

            <button
              onClick={() => navigate('/my-bookings')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition"
            >
              Lihat Daftar Booking Saya
            </button>
          </div>
        </div>
      ) : (
        /* ================================================= */
        /* WIZARD CONTENT                                    */
        /* ================================================= */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card">
          
          {/* STEP 1: PILIH DOKTER */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-800">Langkah 1: Pilih Dokter Spesialis</h2>
                <p className="text-xs text-slate-500">Pilih tenaga medis yang sesuai dengan keluhan Anda</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => handleSelectDoctor(doctor)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start ${
                      selectedDoctorId === doctor.id.toString()
                        ? 'border-brand-600 bg-brand-50/50 shadow-sm ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <img
                      src={doctor.image_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                    />
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                        {doctor.specialization?.name}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{doctor.name}</h4>
                      <p className="text-xs text-slate-500">{doctor.title}</p>
                      <p className="text-xs font-extrabold text-brand-700 pt-1">
                        {doctor.formatted_fee || `Rp ${Number(doctor.consultation_fee).toLocaleString('id-ID')}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: TANGGAL & SLOT WAKTU */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Langkah 2: Pilih Tanggal & Waktu Praktek</h2>
                  <p className="text-xs text-slate-500">
                    Dokter: <strong className="text-slate-800">{selectedDoctor?.name}</strong> ({selectedDoctor?.specialization?.name})
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Ganti Dokter
                </button>
              </div>

              {/* Date Input */}
              <div className="space-y-2 max-w-sm">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  Pilih Tanggal Kedatangan:
                </label>
                <input
                  type="date"
                  min={getMinDate()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm font-semibold text-slate-800"
                />
              </div>

              {/* Slot Availability Grid */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-600" />
                    Pilih Jam Konsultasi yang Tersedia:
                  </label>
                  {slotsData?.available_slots_count !== undefined && (
                    <span className="text-xs font-semibold text-brand-700">
                      {slotsData.available_slots_count} Slot Tersedia
                    </span>
                  )}
                </div>

                {loadingSlots ? (
                  <SlotGridSkeleton />
                ) : !slotsData?.is_open ? (
                  <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center space-y-1">
                    <p className="font-bold">Dokter Tidak Praktek pada Tanggal Ini</p>
                    <p>{slotsData?.message || 'Silakan pilih tanggal lain di mana dokter memiliki jadwal praktek.'}</p>
                  </div>
                ) : slotsData?.slots?.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs text-center">
                    Tidak ada slot waktu yang tersedia pada tanggal ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {slotsData.slots.map((slot, idx) => {
                      const isSelected = selectedSlot?.start_time === slot.start_time;

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!slot.is_available}
                          onClick={() => handleSelectSlot(slot)}
                          className={`p-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-brand-600 text-white border-brand-600 shadow-md ring-2 ring-brand-400/30'
                              : slot.is_available
                              ? 'bg-white border-slate-200 text-slate-800 hover:border-brand-500 hover:bg-brand-50/50'
                              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                          }`}
                        >
                          <span>{slot.formatted_label}</span>
                          <span className="text-[10px] font-normal">
                            {isSelected ? 'Terpilih' : slot.is_available ? 'Tersedia' : slot.is_booked ? 'Penuh' : 'Lewat'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button
                  disabled={!selectedSlot}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  Lanjut ke Keluhan <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: KELUHAN PASIEN */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-800">Langkah 3: Informasi Keluhan Medis</h2>
                <p className="text-xs text-slate-500">Jelaskan keluhan nyeri atau kondisi kesehatan yang Anda rasakan</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Deskripsi Keluhan / Riwayat Nyeri <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="Contoh: Nyeri punggung bawah menjalar ke pinggul kanan sejak 2 minggu lalu setelah mengangkat benda berat. Terasa sakit terutama saat duduk lama."
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm leading-relaxed"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Minimal 10 karakter</span>
                  <span>{complaint.length} / 1000</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button
                  disabled={complaint.trim().length < 10}
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  Lanjut ke Ringkasan <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: KONFIRMASI & SUBMIT */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-800">Langkah 4: Konfirmasi Booking</h2>
                <p className="text-xs text-slate-500">Periksa kembali data reservasi sebelum dikirim ke sistem</p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-400 block text-xs">Dokter Terapi:</span>
                    <span className="font-bold text-slate-800">{selectedDoctor?.name}</span>
                    <span className="text-xs text-brand-700 block">{selectedDoctor?.specialization?.name}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs">Jadwal Appointment:</span>
                    <span className="font-bold text-slate-800">{selectedDate}</span>
                    <span className="text-xs text-brand-700 block">Jam {selectedSlot?.formatted_label} WIB</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs">Estimasi Biaya Konsultasi:</span>
                    <span className="font-extrabold text-brand-700 text-base">
                      {selectedDoctor?.formatted_fee || `Rp ${Number(selectedDoctor?.consultation_fee).toLocaleString('id-ID')}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-xs">Nama Pasien:</span>
                    <span className="font-bold text-slate-800">{user?.name || 'Harap Login'}</span>
                    <span className="text-xs text-slate-500 block">{user?.email}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <span className="text-slate-400 block text-xs">Ringkasan Keluhan:</span>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 italic">
                    "{complaint}"
                  </p>
                </div>
              </div>

              {/* Login Notice if unauthenticated */}
              {!isAuthenticated && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                  <span>Anda belum masuk. Silakan login untuk menyelesaikan reservasi.</span>
                  <button
                    onClick={() => navigate('/login', { state: { from: '/booking' } })}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition"
                  >
                    Login Sekarang
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>

                <button
                  disabled={submitting || !isAuthenticated}
                  onClick={handleSubmitBooking}
                  className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition active:scale-95 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Konfirmasi & Simpan Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
