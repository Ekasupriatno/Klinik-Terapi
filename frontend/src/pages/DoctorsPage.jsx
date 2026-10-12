import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorService, clinicService } from '../services/api';
import { DoctorCardSkeleton } from '../components/common/Skeleton';
import {
  Search,
  Star,
  Clock,
  Calendar,
  Stethoscope,
  ChevronRight,
  Check,
  Activity,
  Sparkles,
  ArrowRight,
  CalendarX
} from 'lucide-react';

const dayNamesMap = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
  sunday: 'Minggu'
};

const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const orderedWeekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const getDaysSummary = (activeSchedules) => {
  if (!activeSchedules || activeSchedules.length === 0) return 'Jadwal belum ditentukan';

  const scheduleDayKeys = orderedWeekDays.filter((k) =>
    activeSchedules.some((s) => s.day_of_week === k)
  );

  if (scheduleDayKeys.length === 0) return 'Jadwal belum ditentukan';
  if (scheduleDayKeys.length === 6 && !scheduleDayKeys.includes('sunday')) {
    return 'Senin – Sabtu';
  }
  if (scheduleDayKeys.length === 5 && !scheduleDayKeys.includes('saturday') && !scheduleDayKeys.includes('sunday')) {
    return 'Senin – Jumat';
  }
  if (scheduleDayKeys.length === 7) {
    return 'Setiap Hari (Senin – Minggu)';
  }

  return scheduleDayKeys.map((k) => dayNamesMap[k] || k).join(', ');
};

export const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecId, setSelectedSpecId] = useState('');
  const [selectedSlots, setSelectedSlots] = useState({});
  const [selectedDays, setSelectedDays] = useState({});

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const specParam = searchParams.get('specialization_id');
    if (specParam) {
      setSelectedSpecId(specParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchSpecializations();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecId, searchQuery]);

  const fetchSpecializations = async () => {
    try {
      const res = await clinicService.getSpecializations();
      if (res.data?.data) {
        setSpecializations(res.data.data);
      }
    } catch {
      // Fallback
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSpecId) params.specialization_id = selectedSpecId;
      if (searchQuery) params.search = searchQuery;

      const res = await doctorService.getAll(params);
      if (res.data?.data) {
        setDoctors(res.data.data);
        
        // Auto-select initial active day and first slot for each doctor
        const initialSlots = {};
        const initialDays = {};
        const todayKey = dayKeys[new Date().getDay()];

        res.data.data.forEach((doc) => {
          const scheduleInfo = getDoctorScheduleInfo(doc);
          if (scheduleInfo.isAvailable) {
            initialDays[doc.id] = scheduleInfo.chosenDayKey;
            if (scheduleInfo.slots.length > 0) {
              initialSlots[doc.id] = scheduleInfo.slots[0].time;
            }
          }
        });
        setSelectedDays(initialDays);
        setSelectedSlots(initialSlots);
      }
    } catch (err) {
      console.error('Gagal mengambil data dokter:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate availability and slots from real doctor schedules
  const getDoctorScheduleInfo = (doctor, selectedDayKey) => {
    const activeSchedules = (doctor.schedules || []).filter((s) => s.is_active !== false);

    if (activeSchedules.length === 0) {
      return {
        isAvailable: false,
        statusText: 'Jadwal Belum Ditentukan',
        daysSummary: 'Belum ada jadwal praktek',
        activeSchedules: [],
        slots: [],
        chosenDayKey: '',
        chosenDayLabel: '',
        activeScheduleTime: '',
      };
    }

    // Sort active schedules in order of the week
    const sortedActiveSchedules = [...activeSchedules].sort(
      (a, b) => orderedWeekDays.indexOf(a.day_of_week) - orderedWeekDays.indexOf(b.day_of_week)
    );

    const todayDayKey = dayKeys[new Date().getDay()];
    const todaySchedule = sortedActiveSchedules.find((s) => s.day_of_week === todayDayKey);

    let chosenSchedule = null;
    if (selectedDayKey) {
      chosenSchedule = sortedActiveSchedules.find((s) => s.day_of_week === selectedDayKey);
    }
    if (!chosenSchedule) {
      chosenSchedule = todaySchedule || sortedActiveSchedules[0];
    }

    const startTime = (chosenSchedule.start_time || '09:00').substring(0, 5);
    const endTime = (chosenSchedule.end_time || '15:00').substring(0, 5);
    const duration = Number(chosenSchedule.slot_duration_minutes) || 60;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    let currentMins = startH * 60 + (startM || 0);
    const endMins = endH * 60 + (endM || 0);

    const slots = [];
    while (currentMins < endMins && slots.length < 10) {
      const h = Math.floor(currentMins / 60);
      const m = currentMins % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const padH = displayH < 10 ? `0${displayH}` : `${displayH}`;
      const padM = m < 10 ? `0${m}` : `${m}`;
      const timeFormatted = `${padH}:${padM} ${period}`;

      slots.push({
        time: timeFormatted,
        rawTime: `${h < 10 ? '0' + h : h}:${padM}`,
        status: 'Available',
      });

      currentMins += duration;
    }

    const chosenDayLabel = dayNamesMap[chosenSchedule.day_of_week] || chosenSchedule.day_label || chosenSchedule.day_of_week;
    const daysSummary = getDaysSummary(sortedActiveSchedules);

    return {
      isAvailable: true,
      daysSummary,
      activeSchedules: sortedActiveSchedules,
      chosenDayKey: chosenSchedule.day_of_week,
      chosenDayLabel,
      activeScheduleTime: `${startTime} - ${endTime}`,
      isToday: chosenSchedule.day_of_week === todayDayKey,
      slots,
    };
  };

  const handleSelectDay = (doctorId, dayKey) => {
    setSelectedDays((prev) => ({
      ...prev,
      [doctorId]: dayKey,
    }));
    
    // Automatically select the first slot of the newly chosen day
    const doc = doctors.find((d) => d.id === doctorId);
    if (doc) {
      const info = getDoctorScheduleInfo(doc, dayKey);
      if (info.slots.length > 0) {
        setSelectedSlots((prev) => ({
          ...prev,
          [doctorId]: info.slots[0].time,
        }));
      }
    }
  };

  const handleSelectSlot = (doctorId, slotTime) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [doctorId]: slotTime,
    }));
  };

  const handleBookDoctor = (doctorId, slotTime, dayKey) => {
    const time = slotTime || selectedSlots[doctorId] || '';
    const day = dayKey || selectedDays[doctorId] || '';
    let query = `?doctor_id=${doctorId}`;
    if (time) query += `&time=${encodeURIComponent(time)}`;
    if (day) query += `&day=${encodeURIComponent(day)}`;
    navigate(`/booking${query}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      
      {/* Hero Header matching Services & Articles pages */}
      <div className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-teal-700 text-white overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-teal-100 text-xs font-semibold mb-4 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Tim Dokter Terapi & Rehabilitasi Medik
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Dokter Spesialis & Tenaga Medis Ahli
          </h1>
          <p className="mt-4 text-base sm:text-lg text-teal-50 max-w-2xl mx-auto">
            Pilih dokter spesialis rehabilitasi medik dan terapis berpengalaman kami sesuai jadwal praktek di klinik untuk konsultasi dan terapi maksimal.
          </p>

          {/* Search Bar inside Hero */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama dokter atau gelar spesialisasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-800 placeholder-slate-400 font-medium shadow-lg shadow-black/10 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Category Pills Filter */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 sm:p-4 mb-8 flex flex-wrap items-center justify-between gap-3 sm:gap-4"
        >
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <button
              onClick={() => setSelectedSpecId('')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedSpecId === ''
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Semua Spesialisasi ({doctors.length})
            </button>
            {specializations.map((spec) => {
              const count = doctors.filter(
                (d) => d.specialization?.id === spec.id || d.specialization_id === spec.id
              ).length;
              return (
                <button
                  key={spec.id}
                  onClick={() => setSelectedSpecId(spec.id.toString())}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    selectedSpecId === spec.id.toString()
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {spec.name} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          {(selectedSpecId || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSpecId('');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3.5 py-2 rounded-xl transition whitespace-nowrap flex-shrink-0"
            >
              Reset Filter
            </button>
          )}
        </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
          <DoctorCardSkeleton />
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Dokter Tidak Ditemukan</h3>
          <p className="text-sm text-slate-500">
            Tidak ada dokter yang sesuai dengan kriteria pencarian Anda. Silakan reset filter pencarian.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {doctors.map((doctor) => {
            const currentDayKey = selectedDays[doctor.id];
            const scheduleInfo = getDoctorScheduleInfo(doctor, currentDayKey);
            const currentSelectedSlot = selectedSlots[doctor.id] || (scheduleInfo.slots[0]?.time || '');
            const ratingScore = doctor.average_rating ? Number(doctor.average_rating).toFixed(1) : '4.5';
            const totalReviewsCount = doctor.total_reviews || 100;
            const specializationName = doctor.specialization?.name || 'Spesialis Terapi';
            const doctorTitle = doctor.title || `Professional ${specializationName}`;
            const todayDayKey = dayKeys[new Date().getDay()];

            return (
              <div
                key={doctor.id}
                className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Profile Header */}
                  <div className="flex items-start gap-4 sm:gap-5">
                    {/* Doctor Avatar with Verified Badge */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                      <img
                        src={
                          doctor.image_thumbnail_url ||
                          doctor.image_url ||
                          'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
                        }
                        alt={doctor.name}
                        className="w-full h-full rounded-full object-cover border-2 border-slate-50 shadow-sm"
                        loading="lazy"
                        decoding="async"
                      />
                      {/* Brand Verified Checkmark Badge overlapping bottom right */}
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center ring-2 ring-white shadow-sm"
                        title="Dokter Terverifikasi"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                      </div>
                    </div>

                    {/* Doctor Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Doctor Name */}
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-snug truncate">
                        {doctor.name}
                      </h3>

                      {/* Professional Subtitle */}
                      <p className="text-sm sm:text-base text-slate-500 font-normal leading-tight truncate">
                        {doctorTitle}
                      </p>

                      {/* Specialty Category Row with Chevron Right (No location) */}
                      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 font-medium pt-1">
                        <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                          <Activity className="w-4 h-4 text-brand-500 flex-shrink-0" />
                          <span className="truncate">{specializationName}</span>
                        </div>

                        {/* Chevron Right */}
                        <button
                          onClick={() => handleBookDoctor(doctor.id)}
                          className="text-slate-400 hover:text-brand-600 transition-colors p-1 flex-shrink-0"
                          aria-label="Reservasi dokter"
                        >
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
                        </button>
                      </div>

                      {/* Ratings Row */}
                      <div className="flex items-center gap-1.5 pt-1.5">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <span className="text-sm sm:text-base font-bold text-slate-800 ml-1">
                          {ratingScore}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-400 font-normal">
                          ({totalReviewsCount})
                        </span>
                      </div>

                      {/* Status Indicator: Available at Doctor's Office by day */}
                      <div className="flex items-center gap-2 pt-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full inline-block flex-shrink-0 ${
                            scheduleInfo.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        <span
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            scheduleInfo.isAvailable ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          {scheduleInfo.isAvailable
                            ? `Tersedia di Ruang Praktek: ${scheduleInfo.daysSummary}`
                            : 'Jadwal Praktek Belum Tersedia'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Consultation Fee and Quick Booking Action */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col min-[480px]:flex-row items-stretch min-[480px]:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      Biaya Konsultasi
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-brand-700">
                      {doctor.formatted_fee ||
                        `Rp ${Number(doctor.consultation_fee).toLocaleString('id-ID')}`}
                    </span>
                    <span className="text-[11px] text-slate-400"> / sesi</span>
                  </div>

                  <button
                    disabled={!scheduleInfo.isAvailable}
                    onClick={() => handleBookDoctor(doctor.id)}
                    className="w-full min-[480px]:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>{scheduleInfo.isAvailable ? 'Reservasi Konsultasi' : 'Jadwal Tutup'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};
