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
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="inline-block bg-white px-3.5 py-2 rounded-2xl shadow-sm hover:opacity-95 transition">
              <img src="/logo.png" alt="alabina" className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pusat layanan terapi dan rehabilitasi fisik profesional terpercaya. Mengembalikan mobilitas dan kualitas hidup Anda melalui pendekatan medis modern.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400">
              <Heart className="w-4 h-4 fill-brand-400 text-brand-400" />
              <span>Prioritas utama kami adalah kesembuhan Anda.</span>
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
              <li>Fisioterapi & Cedera Olahraga</li>
              <li>Terapi Saraf Kejepit & Tulang Belakang</li>
              <li>Rehabilitasi Pasca Stroke</li>
              <li>Terapi Wicara & Bahasa</li>
              <li>Akupunktur Medis & Nyeri Kronis</li>
            </ul>
          </div>

          {/* Kontak & Jam Operasional */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base">Kontak & Operasional</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{settings.address}</span>
              </div>
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
