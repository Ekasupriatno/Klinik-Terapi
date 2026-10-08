import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, User, Hospital, Sparkles, Stethoscope, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'therapist' || user.role === 'doctor') {
        navigate('/therapist');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        'Gagal masuk. Periksa kembali email dan kata sandi Anda.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-brand-50 via-white to-teal-50">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Left Side - Visual */}
          <div className="bg-gradient-to-br from-brand-600 to-teal-600 p-8 lg:p-12 flex flex-col justify-between text-white">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Hospital className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Klinik Terapi</h2>
                  <p className="text-sm text-brand-100">Rehabilitasi Medik Modern</p>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Dokter Spesialis Berpengalaman</h3>
                    <p className="text-xs text-brand-100 mt-1">Tim dokter rehabilitasi medik dengan pengalaman lebih dari 10 tahun</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Fasilitas Modern</h3>
                    <p className="text-xs text-brand-100 mt-1">Peralatan terapi canggih untuk hasil pemulihan maksimal</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Pendekatan Personal</h3>
                    <p className="text-xs text-brand-100 mt-1">Perawatan yang disesuaikan dengan kebutuhan individu</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <p className="text-xs text-brand-200">© 2024 Klinik Terapi & Rehabilitasi Medik</p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="p-8 lg:p-12">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 to-teal-50 text-brand-600 mx-auto flex items-center justify-center shadow-sm">
                  <User className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Selamat Datang Kembali
                </h1>
                <p className="text-sm text-slate-500">
                  Masuk untuk mengelola reservasi dan riwayat konsultasi Anda
                </p>
              </div>

              {/* Demo Accounts Quick Pill */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-amber-800">Akun Demo (Klik untuk mengisi cepat):</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo('admin@klinikterapi.com', 'AdminKlinik!2026')}
                    className="py-2.5 px-3 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-200 transition flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('pasien@gmail.com', 'PasienDemo!2026')}
                    className="py-2.5 px-3 bg-brand-100 text-brand-900 border border-brand-300 rounded-xl text-xs font-bold hover:bg-brand-200 transition flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Pasien
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('therapist@klinikterapi.com', 'Therapist!2026')}
                    className="py-2.5 px-3 bg-teal-100 text-teal-900 border border-teal-300 rounded-xl text-xs font-bold hover:bg-teal-200 transition flex items-center justify-center gap-2"
                  >
                    <Stethoscope className="w-4 h-4" />
                    Terapis
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 block">Alamat Email</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-slate-700 block">Kata Sandi</label>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* lupa kata sandi */}
                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      Lupa kata sandi?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Memeriksa Kredensial...' : 'Masuk ke Sistem'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center text-sm text-slate-500 pt-2 space-y-2">
                <div>
                  Belum memiliki akun pasien?{' '}
                  <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 hover:underline transition">
                    Daftar Sekarang
                  </Link>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Dokter atau Terapis baru? </span>
                  <Link to="/register/doctor" className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline transition">
                    Daftar Akun Dokter Praktik &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
