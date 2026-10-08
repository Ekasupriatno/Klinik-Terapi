import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, ShieldCheck, Send } from 'lucide-react';
import { clinicSettingService } from '../services/api';

export const ContactPage = () => {
  const [settings, setSettings] = useState({
    name: 'Klinik Terapi & Rehabilitasi Medik',
    phone: '+62 82235123063',
    whatsapp: '6282235123063',
    email: 'layanan@klinikterapi.com',
    address: 'Jl. HMS Mintareja Sarjana Hukum No.Ruko A-28, Baros, Kec. Cimahi Tengah, Kota Cimahi, Jawa Barat 40521',
    operational_hours: 'Senin - Jumat: 08:00 - 18:00 WIB\nSabtu: 08:00 - 15:00 WIB\nMinggu & Hari Libur Nasional: Tutup',
  });

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

  const cleanWhatsappNumber = (settings.whatsapp || '6282235123063').replace(/[^0-9]/g, '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Informasi Kontak Langsung
            </h3>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Alamat Fasilitas Terapi</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed whitespace-pre-line">
                  {settings.address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">WhatsApp & Telepon Resmi</h4>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{settings.phone} (Telepon)</p>
                {settings.whatsapp && (
                  <p className="text-xs text-emerald-600 font-medium">+{cleanWhatsappNumber} (WhatsApp)</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Email Pelayanan & Rujukan</h4>
                <p className="text-xs text-slate-500 mt-0.5">{settings.email}</p>
              </div>
            </div>

            {settings.operational_hours && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Jam Operasional Klinik</h4>
                  <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-line leading-relaxed">
                    {settings.operational_hours}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Direct Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-700 text-white space-y-3 shadow-lg shadow-emerald-600/20">
            <h4 className="text-base font-extrabold">Konsultasi Darurat / Pertanyaan Cepat?</h4>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Tim perawat dan resepsionis kami siap melayani pertanyaan seputar estimasi biaya, persiapan terapi, dan panduan rujukan dokter.
            </p>
            <a
              href={`https://wa.me/${cleanWhatsappNumber}?text=Halo%20Admin%20Klinik%20Terapi,%20saya%20ingin%20berkonsultasi%20mengenai%20layanan`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition shadow-sm"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              Buka WhatsApp Resepsionis
            </a>
          </div>
        </div>

        {/* Form Pertanyaan Pasien */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Kirim Pertanyaan atau Pesan
          </h3>

          <form onSubmit={(e) => {
            e.preventDefault();
            alert('Terima kasih! Pesan Anda telah terkirim ke customer service klinik.');
          }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Anda</label>
                <input
                  required
                  type="text"
                  placeholder="Budi Santoso"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nomor WhatsApp</label>
                <input
                  required
                  type="tel"
                  placeholder="081234567890"
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Subjek Pertanyaan</label>
              <select className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none">
                <option>Pertanyaan Umum & Jam Buka</option>
                <option>Fisioterapi & Cedera Olahraga</option>
                <option>Terapi Saraf Kejepit & Tulang Belakang</option>
                <option>Rehabilitasi Stroke</option>
                <option>Lainnya</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Pesan / Pertanyaan Anda</label>
              <textarea
                required
                rows={5}
                placeholder="Tuliskan pertanyaan atau keluhan yang ingin Anda konsultasikan..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition active:scale-95 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Kirim Pesan ke Resepsionis
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
