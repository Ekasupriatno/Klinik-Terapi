import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Home,
  FileCheck,
} from 'lucide-react';

export const RegisterDoctorSuccess = () => {
  const location = useLocation();
  const doctorName = location.state?.doctorName || 'Dokter';
  const doctorEmail = location.state?.doctorEmail || '';
  const licenseNumber = location.state?.licenseNumber || '';

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-brand-50/30 to-teal-50/20">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-2xl space-y-8 text-center relative overflow-hidden">
        
        {/* Soft background glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-b from-teal-100/50 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon Badge */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
          <CheckCircle2 className="w-10 h-10 animate-scale-in" />
        </div>

        {/* Title & Headline */}
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase tracking-wide">
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            Pendaftaran Berhasil Dikirim
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Registrasi Berhasil
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
            Selamat datang, <strong className="text-slate-800">{doctorName}</strong>. Akun dokter Anda telah berhasil dibuat dalam sistem Klinik Terapi.
          </p>
        </div>

        {/* Status Callout Card */}
        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-left space-y-3 relative z-10">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
            <span className="text-xs font-bold uppercase text-amber-900 tracking-wider">Status Akun:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-extrabold">
              <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              Menunggu Verifikasi Admin
            </span>
          </div>

          <div className="space-y-2 text-xs text-amber-900/90 leading-relaxed">
            <p className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                Anda akan dapat login setelah akun diverifikasi oleh <strong>Admin Klinik</strong>.
              </span>
            </p>
            <p className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                Silakan cek kotak masuk atau folder spam di email <strong>{doctorEmail || 'Anda'}</strong> untuk melakukan <strong>verifikasi email</strong>.
              </span>
            </p>
            {licenseNumber && (
              <p className="pt-1 text-[11px] text-amber-800/80">
                Nomor Lisensi yang diregister: <code className="font-mono font-bold bg-amber-100/70 px-1.5 py-0.5 rounded">{licenseNumber}</code>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2 relative z-10">
          <Link
            to="/login"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-brand-500/25 transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Kembali ke Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/"
            className="w-full py-3 px-6 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-bold text-xs sm:text-sm border border-slate-200 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Halaman Utama</span>
          </Link>
        </div>

        {/* Helpdesk Notice */}
        <p className="text-[11px] text-slate-400 relative z-10">
          Butuh bantuan mengenai pendaftaran dokter? Hubungi Sekretariat Medis di <a href="mailto:admin@klinikterapi.com" className="text-brand-600 hover:underline">admin@klinikterapi.com</a>
        </p>

      </div>
    </div>
  );
};

export default RegisterDoctorSuccess;
