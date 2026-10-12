import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  ExternalLink,
  Navigation,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';
import { clinicSettingService } from '../services/api';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const DEFAULT_CLINIC_SETTINGS = {
  name: 'Klinik Terapi & Rehabilitasi Medik',
  phone: '+62 82235123063',
  whatsapp: '6282235123063',
  email: 'layanan@klinikterapi.com',
  address: 'Jl. HMS Mintareja Sarjana Hukum No.Ruko A-28, Baros, Kec. Cimahi Tengah, Kota Cimahi, Jawa Barat 40521',
  operational_hours: 'Senin - Jumat: 08:00 - 18:00 WIB\nSabtu: 08:00 - 15:00 WIB\nMinggu & Hari Libur Nasional: Tutup',
};

const INQUIRY_TOPICS = [
  'Pertanyaan Umum & Jam Buka',
  'Fisioterapi & Cedera Olahraga',
  'Terapi Saraf Kejepit & Tulang Belakang',
  'Rehabilitasi Stroke',
  'Lainnya',
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Reusable contact detail row with icon, title, and customizable content.
 */
const ContactInfoRow = ({ icon: Icon, title, children }) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-xs font-bold text-slate-800">{title}</h4>
      <div className="mt-0.5 text-xs text-slate-500 leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

/**
 * Direct WhatsApp consultation call-to-action banner.
 */
const WhatsAppBanner = ({ whatsappUrl }) => (
  <div className="p-6 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-700 text-white space-y-3 shadow-lg shadow-emerald-600/20">
    <div className="flex items-center gap-2">
      <MessageCircle className="w-5 h-5 text-emerald-200" />
      <h4 className="text-base font-extrabold">Konsultasi Darurat / Pertanyaan Cepat?</h4>
    </div>
    <p className="text-xs text-emerald-100 leading-relaxed">
      Tim perawat dan resepsionis kami siap melayani pertanyaan seputar estimasi biaya, persiapan terapi, dan panduan rujukan dokter.
    </p>
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition shadow-sm"
    >
      <Phone className="w-4 h-4 text-emerald-600" />
      <span>Buka WhatsApp Resepsionis</span>
    </a>
  </div>
);

/**
 * Contact inquiry form with controlled state and user feedback.
 */
const ContactInquiryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: INQUIRY_TOPICS[0],
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      subject: INQUIRY_TOPICS[0],
      message: '',
    });
    setIsSubmitted(false);
  };

  return (
    <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-5">
      <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
        Kirim Pertanyaan atau Pesan
      </h3>

      {isSubmitted ? (
        <div className="p-8 text-center space-y-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 animate-fade-in">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">Pesan Anda Berhasil Terkirim!</h4>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Terima kasih, <strong>{formData.name}</strong>. Pesan Anda telah diterima oleh tim resepsionis klinik dan kami akan segera menghubungi Anda kembali melalui WhatsApp ke nomor <strong>{formData.phone}</strong>.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
          >
            Kirim Pertanyaan Lainnya
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nama Anda</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Budi Santoso"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nomor WhatsApp</label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="081234567890"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Subjek Pertanyaan</label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {INQUIRY_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Pesan / Pertanyaan Anda</label>
            <textarea
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tuliskan pertanyaan atau keluhan yang ingin Anda konsultasikan..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition active:scale-95 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Pesan ke Resepsionis</span>
          </button>
        </form>
      )}
    </div>
  );
};

/**
 * Interactive map card with Google Maps iframe embed and direct route navigation.
 */
const LocationMapSection = ({ googleMapsUrl, embedMapUrl }) => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-5">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Peta Lokasi Fasilitas Klinik</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Navigasi langsung ke fasilitas klinik kami melalui Google Maps.
        </p>
      </div>

      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm hover:shadow-md self-start sm:self-auto group"
      >
        <Navigation className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        <span>Petunjuk Arah Google Maps</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>

    {/* Map Container with Clickable Action Overlay */}
    <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-inner group h-80 sm:h-96 bg-slate-100">
      <iframe
        title="Lokasi Google Maps Fasilitas Klinik"
        src={embedMapUrl}
        className="w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-800 text-xs font-bold shadow-lg border border-slate-200 backdrop-blur-sm transition-all hover:scale-105 hover:text-brand-600 group"
      >
        <MapPin className="w-4 h-4 text-brand-600" />
        <span>Buka Langsung di Google Maps</span>
        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition" />
      </a>
    </div>
  </div>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export const ContactPage = () => {
  const [settings, setSettings] = useState(DEFAULT_CLINIC_SETTINGS);

  // Fetch settings from API and listen for dynamic updates
  useEffect(() => {
    clinicSettingService.getPublicSettings()
      .then((res) => {
        if (res.data?.data) {
          setSettings((prev) => ({ ...prev, ...res.data.data }));
        }
      })
      .catch((err) => console.error('Failed to load clinic settings in ContactPage:', err));

    const handleSettingsUpdated = (e) => {
      if (e.detail) {
        setSettings((prev) => ({ ...prev, ...e.detail }));
      }
    };

    window.addEventListener('clinic-settings-updated', handleSettingsUpdated);
    return () => window.removeEventListener('clinic-settings-updated', handleSettingsUpdated);
  }, []);

  // Memoized external links
  const cleanWhatsappNumber = useMemo(() => {
    return (settings.whatsapp || DEFAULT_CLINIC_SETTINGS.whatsapp).replace(/[^0-9]/g, '');
  }, [settings.whatsapp]);

  const whatsappUrl = useMemo(() => {
    const text = encodeURIComponent('Halo Admin Klinik Terapi, saya ingin berkonsultasi mengenai layanan');
    return `https://wa.me/${cleanWhatsappNumber}?text=${text}`;
  }, [cleanWhatsappNumber]);

  const googleMapsUrl = useMemo(() => {
    const query = encodeURIComponent(settings.address || DEFAULT_CLINIC_SETTINGS.address);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }, [settings.address]);

  const embedMapUrl = useMemo(() => {
    const query = encodeURIComponent(settings.address || DEFAULT_CLINIC_SETTINGS.address);
    return `https://maps.google.com/maps?q=${query}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }, [settings.address]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
          Pusat Bantuan & Lokasi
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Hubungi {settings.name}
        </h1>
        <p className="text-slate-600 text-sm">
          Kami siap membantu memberikan penjelasan terkait jenis terapi yang cocok dengan keluhan nyeri Anda.
        </p>
      </div>

      {/* Main Grid: Direct Contact Info & Inquiry Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Informasi Kontak Langsung
            </h3>

            {/* Address */}
            <ContactInfoRow icon={MapPin} title="Alamat Fasilitas Terapi">
              <p className="whitespace-pre-line">{settings.address}</p>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 mt-2 hover:underline group"
              >
                <span>Buka di Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </ContactInfoRow>

            {/* Phone & WhatsApp */}
            <ContactInfoRow icon={Phone} title="WhatsApp & Telepon Resmi">
              <p className="font-medium text-slate-600">{settings.phone} (Telepon)</p>
              {settings.whatsapp && (
                <p className="text-emerald-600 font-medium mt-0.5">+{cleanWhatsappNumber} (WhatsApp)</p>
              )}
            </ContactInfoRow>

            {/* Email */}
            <ContactInfoRow icon={Mail} title="Email Pelayanan & Rujukan">
              <p className="text-slate-600">{settings.email}</p>
            </ContactInfoRow>

            {/* Operational Hours */}
            {settings.operational_hours && (
              <ContactInfoRow icon={Clock} title="Jam Operasional Klinik">
                <p className="whitespace-pre-line leading-relaxed">{settings.operational_hours}</p>
              </ContactInfoRow>
            )}
          </div>

          {/* WhatsApp Direct Action Banner */}
          <WhatsAppBanner whatsappUrl={whatsappUrl} />
        </div>

        {/* Right Column: Inquiry Form */}
        <ContactInquiryForm />
      </div>

      {/* Interactive Location Map */}
      <LocationMapSection
        googleMapsUrl={googleMapsUrl}
        embedMapUrl={embedMapUrl}
      />
    </div>
  );
};
