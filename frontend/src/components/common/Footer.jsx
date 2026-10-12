import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';
import { clinicSettingService } from '../../services/api';

export const Footer = () => {
  const [settings, setSettings] = useState({
    name: 'Klinik Terapi & Rehabilitasi Medik',
    phone: '+62 82235123063',
    whatsapp: '6282235123063',
    email: 'layanan@klinikterapi.com',
    address: 'Jl. HMS Mintareja Sarjana Hukum No.Ruko A-28, Baros, Kec. Cimahi Tengah, Kota Cimahi, Jawa Barat 40521',
    operational_hours: 'Senin - Sabtu: 08:00 - 18:00 WIB\nMinggu: Tutup',
  });

  useEffect(() => {
    clinicSettingService.getPublicSettings()
      .then((res) => {
        if (res.data?.data) {
          setSettings((prev) => ({ ...prev, ...res.data.data }));
        }
      })
      .catch((err) => console.error('Failed to load clinic settings in Footer:', err));

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
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand logo */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group select-none">
              <div className="h-11 w-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md shadow-black/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
                <img
                  src="/Alabina_Logo.webp"
                  alt="Logo Rumah Terapi Alabina"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight block leading-tight group-hover:text-brand-300 transition-colors">
                  Rumah Terapi <span className="text-brand-400">Alabina</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-400 block tracking-wide">
                  Klinik Tumbuh Kembang
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pusat layanan terapi dan rehabilitasi medik terpercaya. Mengoptimalkan setiap fase pemulihan dan kesehatan pasien melalui pendekatan klinis profesional.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-medium">
              <Heart className="w-4 h-4 fill-brand-400 text-brand-400 shrink-0" />
              <span>Prioritas utama kami adalah kesehatan dan kemajuan pasien.</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
              <a
                href="https://www.instagram.com/rumahterapi_alabina"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-400 transition flex items-center gap-1"
              >
                <span>IG: @rumahterapi_alabina</span>
              </a>
              <span className="text-slate-600">•</span>
              <a
                href="https://www.tiktok.com/@rumahterapi.alabina"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-400 transition flex items-center gap-1"
              >
                <span>TikTok: @rumahterapi.alabina</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base">Navigasi Cepat</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-400 transition">Beranda</Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-brand-400 transition">Daftar Dokter Terapi</Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-brand-400 transition">Reservasi Jadwal Konsultasi</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-400 transition">Lokasi & Kontak Klinik</Link>
              </li>
            </ul>
          </div>

          {/* Layanan Terapi */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base">Layanan Spesialisasi</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Terapi Okupasi & Sensori Integrasi</li>
              <li>Terapi Wicara & Bahasa</li>
              <li>Orthopedagog (Pendidikan Khusus)</li>
              <li>Konseling Individu & Pasangan</li>
              <li>Psikotes & Asesmen Tumbuh Kembang</li>
              <li>Brain Assessment & Gelombang Suara</li>
            </ul>
          </div>

          {/* Kontak & Jam Operasional */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base">Kontak & Operasional</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || 'Klinik Terapi')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:text-brand-300 transition group"
                title="Buka lokasi di Google Maps"
              >
                <MapPin className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="whitespace-pre-line group-hover:underline underline-offset-2">{settings.address}</span>
              </a>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-400 flex-shrink-0" />
                <span>
                  {settings.phone}
                  {settings.whatsapp && (
                    <> / +{cleanWhatsappNumber} (WA)</>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-400 flex-shrink-0" />
                <span>{settings.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{settings.operational_hours}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} {settings.name}. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
};
