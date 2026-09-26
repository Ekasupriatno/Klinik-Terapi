import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, MapPin, Phone, Mail, Clock, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Klinik<span className="text-brand-400">Terapi</span>
              </span>
            </div>
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
                <span>Jl. Sehat Bugar Sejahtera No. 88, Jakarta Selatan</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-400 flex-shrink-0" />
                <span>+62 812-3456-7890 (WhatsApp)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-400 flex-shrink-0" />
                <span>layanan@klinikterapi.com</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>Senin - Sabtu: 08:00 - 18:00 WIB<br/>Minggu: Tutup</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Klinik Terapi & Rehabilitasi Medik. Seluruh hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
};
