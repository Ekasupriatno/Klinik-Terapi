import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorService, clinicService } from '../services/api';
import { DoctorCardSkeleton } from '../components/common/Skeleton';
import {
  Search,
  Star,
  Clock,
  Calendar,
  DollarSign,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Filter,
  Award,
  MapPin,
  Phone,
  GraduationCap,
  Heart
} from 'lucide-react';

export const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecId, setSelectedSpecId] = useState('');

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
      }
    } catch (err) {
      console.error('Gagal mengambil data dokter:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookDoctor = (doctorId) => {
    navigate(`/booking?doctor_id=${doctorId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Tim Dokter & Terapis Spesialis
        </h1>
        <p className="text-slate-600 text-base">
          Pilih dokter spesialis rehabilitasi medik dan terapis berpengalaman kami yang siap mendampingi masa pemulihan Anda dengan metode klinis modern.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search Input */}
          <div className="md:col-span-8 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama dokter atau gelar spesialisasi..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
            />
          </div>

          {/* Reset button */}
          <div className="md:col-span-4 flex items-center justify-end">
            {(selectedSpecId || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedSpecId('');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3.5 py-2.5 rounded-xl transition"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        </div>

        {/* Specialization Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2">
          <button
            onClick={() => setSelectedSpecId('')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedSpecId === ''
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Spesialisasi
          </button>
          {specializations.map((spec) => (
            <button
              key={spec.id}
              onClick={() => setSelectedSpecId(spec.id.toString())}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSpecId === spec.id.toString()
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spec.name}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="space-y-6">
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
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card hover:border-brand-200 hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Doctor Avatar */}
                <div className="relative">
                  <img
                    src={doctor.image_thumbnail_url || doctor.image_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'}
                    alt={doctor.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-slate-100 flex-shrink-0 shadow-sm group-hover:border-brand-200 transition"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-brand-50 to-teal-50 text-brand-700 border border-brand-100">
                        {doctor.specialization?.name || 'Spesialis Terapi'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2">
                        {doctor.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        {doctor.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-xl border border-amber-200 text-amber-800 text-xs font-bold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{doctor.average_rating || '5.0'}</span>
                      <span className="text-amber-600 font-normal">({doctor.total_reviews || 0})</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed pt-1">
                    {doctor.bio || 'Dokter spesialis berkomitmen membantu proses pemulihan fisik dan fungsional pasien secara maksimal.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-brand-600" />
                      {doctor.experience_years} Tahun Pengalaman
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded-lg">
                      <Award className="w-4 h-4 text-amber-600" />
                      SIP: {doctor.sip_number}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info Section */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-brand-600" />
                    <span>Jakarta Selatan</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone className="w-4 h-4 text-brand-600" />
                    <span>(021) 123-4567</span>
                  </div>
                </div>
              </div>

              {/* Bottom Schedule & Booking CTA */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-slate-400 font-medium">Biaya Konsultasi</span>
                  <span className="text-lg font-extrabold text-brand-700">
                    {doctor.formatted_fee || `Rp ${Number(doctor.consultation_fee).toLocaleString('id-ID')}`}
                  </span>
                  <span className="text-xs text-slate-400"> / sesi</span>
                </div>

                <button
                  onClick={() => handleBookDoctor(doctor.id)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white text-sm font-bold shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  Reservasi Jadwal
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
