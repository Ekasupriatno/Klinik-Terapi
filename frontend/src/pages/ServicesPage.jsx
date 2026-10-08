import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { serviceService, clinicService } from '../services/api';
import {
  Sparkles,
  Clock,
  Tag,
  CheckCircle2,
  Calendar,
  Search,
  ArrowRight,
  Filter,
  Info,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';

export const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [servicesRes, specsRes] = await Promise.all([
        serviceService.getAll({ is_active: true }),
        clinicService.getSpecializations(),
      ]);

      const serviceList = servicesRes.data?.data || servicesRes.data || [];
      const specList = specsRes.data?.data || specsRes.data || [];

      setServices(Array.isArray(serviceList) ? serviceList : []);
      setSpecializations(Array.isArray(specList) ? specList : []);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((srv) => {
    const matchSpec =
      selectedSpec === 'all' ||
      srv.specialization_id === Number(selectedSpec) ||
      srv.specialization?.id === Number(selectedSpec);
    const matchSearch =
      !search ||
      srv.name?.toLowerCase().includes(search.toLowerCase()) ||
      srv.description?.toLowerCase().includes(search.toLowerCase()) ||
      srv.specialization?.name?.toLowerCase().includes(search.toLowerCase());
    return matchSpec && matchSearch;
  });

  const formatPrice = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-teal-700 text-white overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-teal-100 text-xs font-semibold mb-4 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Layanan Terapi Terpadu & Profesional
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Program Terapi Tumbuh Kembang Anak Terbaik
          </h1>
          <p className="mt-4 text-base sm:text-lg text-teal-50 max-w-2xl mx-auto">
            Metode terapi klinis terstandar yang disesuaikan dengan kebutuhan unik setiap buah hati, didampingi tim terapis berpengalaman dan penuh kasih.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari layanan (misal: Terapi Wicara, Sensori, Okupasi)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-800 placeholder-slate-400 font-medium shadow-lg shadow-black/10 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Category Pills Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 sm:p-4 mb-8 flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button
            onClick={() => setSelectedSpec('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              selectedSpec === 'all'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Semua Layanan ({services.length})
          </button>
          {specializations.map((spec) => {
            const count = services.filter(
              (s) => s.specialization_id === spec.id || s.specialization?.id === spec.id
            ).length;
            return (
              <button
                key={spec.id}
                onClick={() => setSelectedSpec(String(spec.id))}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedSpec === String(spec.id)
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {spec.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-16 bg-slate-100 rounded mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <Info className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Layanan Tidak Ditemukan</h3>
            <p className="text-sm text-slate-500 mt-1">
              Tidak ada layanan yang cocok dengan kata kunci atau filter yang Anda pilih.
            </p>
            <button
              onClick={() => {
                setSelectedSpec('all');
                setSearch('');
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-brand-300 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  {/* Category badge & Target age */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100">
                      {service.specialization?.name || 'Terapi Spesialis'}
                    </span>
                    {service.age_target && (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        Usia: {service.age_target}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {service.name}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Highlights / Benefits */}
                  {service.benefits && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Manfaat Utama
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 italic">
                        "{service.benefits}"
                      </p>
                    </div>
                  )}

                  {/* Duration & Price */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                      <Clock className="w-4 h-4 text-brand-500" />
                      <span>{service.duration_minutes || 45} Menit / Sesi</span>
                    </div>
                    {service.show_price !== false && (
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Tarif Sesi</div>
                        <div className="text-base font-extrabold text-brand-600">
                          {formatPrice(service.price)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedServiceForModal(service)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-white hover:border-slate-300 transition text-center"
                  >
                    Detail Layanan
                  </button>
                  <button
                    onClick={() => navigate(`/booking?service_id=${service.id}`)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm shadow-brand-500/20 active:scale-95"
                  >
                    <span>Booking Sesi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedServiceForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 mb-2">
                  {selectedServiceForModal.specialization?.name || 'Terapi Spesialis'}
                </span>
                <h3 className="text-2xl font-bold text-slate-900">
                  {selectedServiceForModal.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedServiceForModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-6 text-sm text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">
                  Deskripsi Program
                </h4>
                <p>{selectedServiceForModal.description}</p>
              </div>

              {selectedServiceForModal.benefits && (
                <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100">
                  <h4 className="font-bold text-brand-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    Manfaat & Target Perkembangan
                  </h4>
                  <p className="text-brand-800 text-xs sm:text-sm">{selectedServiceForModal.benefits}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-400 block">Durasi Sesi</span>
                  <span className="text-sm font-bold text-slate-800">
                    {selectedServiceForModal.duration_minutes || 45} Menit
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs text-slate-400 block">Target Usia</span>
                  <span className="text-sm font-bold text-slate-800">
                    {selectedServiceForModal.age_target || 'Semua Usia Anak'}
                  </span>
                </div>
              </div>

              {selectedServiceForModal.show_price !== false && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-700 font-medium">Biaya Konsultasi & Terapi</span>
                    <div className="text-xl font-black text-emerald-800">
                      {formatPrice(selectedServiceForModal.price)}
                    </div>
                  </div>
                  <ShieldCheck className="w-8 h-8 text-emerald-600/40" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedServiceForModal(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const id = selectedServiceForModal.id;
                  setSelectedServiceForModal(null);
                  navigate(`/booking?service_id=${id}`);
                }}
                className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition"
              >
                Jadwalkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
