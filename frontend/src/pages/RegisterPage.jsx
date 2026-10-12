import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, User, Phone, AlertCircle, ArrowRight, Stethoscope, Eye, EyeOff } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'patient',
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Validasi format nomor telepon Indonesia
  const validatePhoneNumber = (phone) => {
    if (!phone || !phone.trim()) {
      return 'Harap isi nomor telepon atau WhatsApp Anda.';
    }
    const trimmed = phone.trim();
    if (/[a-zA-Z]/.test(trimmed)) {
      return 'Nomor telepon tidak boleh mengandung huruf.';
    }
    if (/[^\d+\s-]/.test(trimmed)) {
      return 'Nomor telepon hanya boleh memuat angka (dan awalan +).';
    }
    const clean = trimmed.replace(/[\s-]/g, '');
    if (!/^(\+62|62|0)/.test(clean)) {
      return 'Nomor telepon harus diawali dengan 08, 628, atau +628.';
    }
    if (!/^(\+62|62|0)8/.test(clean)) {
      return 'Nomor seluler / WhatsApp harus diawali angka 8 setelah kode negara (contoh: 08xx atau +628xx).';
    }
    const digitsOnly = clean.replace(/^\+/, '');
    if (digitsOnly.length < 10) {
      return `Nomor telepon terlalu pendek (${digitsOnly.length} digit, minimal 10 digit).`;
    }
    if (digitsOnly.length > 15) {
      return `Nomor telepon terlalu panjang (${digitsOnly.length} digit, maksimal 15 digit).`;
    }
    if (!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(clean)) {
      return 'Format nomor telepon tidak valid. Contoh: 081234567890 atau +6281234567890';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneValidationMsg = validatePhoneNumber(formData.phone);
    if (phoneValidationMsg) {
      setPhoneError(phoneValidationMsg);
      setErrorMsg(phoneValidationMsg);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const user = await register(formData);
      navigate(user.role === 'therapist' ? '/therapist' : '/booking');
    } catch (err) {
      setErrorMsg(
        err.response?.data?.errors?.phone?.[0] ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.errors?.password?.[0] ||
        err.response?.data?.message ||
        'Pendaftaran gagal. Pastikan format data sudah benar.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-100 shadow-card space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Buat Akun Klinik
          </h1>
          <p className="text-xs text-slate-500">
            Pilih jenis akun untuk memulai
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Jenis Akun</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'patient' })}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition ${
                  formData.role === 'patient'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                }`}
              >
                <User className="h-4 w-4" />
                Pasien
              </button>
              <Link
                to="/register/doctor"
                className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-3 text-xs font-bold text-teal-800 hover:bg-teal-100 transition"
              >
                <Stethoscope className="h-4 w-4 text-teal-600" />
                Dokter Spesialis &rarr;
              </Link>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              {formData.role === 'doctor' ? 'Nama Lengkap Dokter / Terapis' : 'Nama Lengkap Pasien'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  e.target.setCustomValidity('');
                }}
                onInvalid={(e) => {
                  if (e.target.validity.valueMissing) {
                    e.target.setCustomValidity('Harap isi nama lengkap Anda.');
                  } else {
                    e.target.setCustomValidity('');
                  }
                }}
                onInput={(e) => e.target.setCustomValidity('')}
                placeholder="Budi Santoso"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  e.target.setCustomValidity('');
                }}
                onInvalid={(e) => {
                  if (e.target.validity.valueMissing) {
                    e.target.setCustomValidity('Harap isi alamat email Anda.');
                  } else if (e.target.validity.typeMismatch) {
                    e.target.setCustomValidity('Format email tidak valid (contoh: budi@gmail.com).');
                  } else {
                    e.target.setCustomValidity('');
                  }
                }}
                onInput={(e) => e.target.setCustomValidity('')}
                placeholder="budi@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Nomor WhatsApp / HP</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                required
                type="tel"
                inputMode="tel"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, phone: val });
                  e.target.setCustomValidity('');
                  if (val.trim()) {
                    setPhoneError(validatePhoneNumber(val));
                  } else {
                    setPhoneError('');
                  }
                }}
                onInvalid={(e) => {
                  const err = validatePhoneNumber(formData.phone);
                  if (err) {
                    e.target.setCustomValidity(err);
                  } else {
                    e.target.setCustomValidity('');
                  }
                }}
                onInput={(e) => {
                  e.target.setCustomValidity('');
                  if (e.target.value.trim()) {
                    setPhoneError(validatePhoneNumber(e.target.value));
                  } else {
                    setPhoneError('');
                  }
                }}
                placeholder="081234567890"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 transition ${
                  phoneError
                    ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:ring-rose-400'
                    : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-brand-500'
                }`}
              />
            </div>
            {phoneError ? (
              <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {phoneError}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-0.5">
                Format: 08xxxxxxxxxx atau +628xxxxxxxxxx (10-15 digit angka).
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Kata Sandi (min. 6 karakter, huruf besar/kecil, angka, simbol)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                required
                minLength={6}
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  e.target.setCustomValidity('');
                }}
                onInvalid={(e) => {
                  if (e.target.validity.valueMissing) {
                    e.target.setCustomValidity('Harap buat kata sandi Anda.');
                  } else if (e.target.validity.tooShort) {
                    e.target.setCustomValidity('Kata sandi minimal 6 karakter.');
                  } else {
                    e.target.setCustomValidity('');
                  }
                }}
                onInput={(e) => e.target.setCustomValidity('')}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Konfirmasi Kata Sandi</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                required
                minLength={6}
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={(e) => {
                  setFormData({ ...formData, password_confirmation: e.target.value });
                  e.target.setCustomValidity('');
                }}
                onInvalid={(e) => {
                  if (e.target.validity.valueMissing) {
                    e.target.setCustomValidity('Harap masukkan konfirmasi kata sandi.');
                  } else if (e.target.validity.tooShort) {
                    e.target.setCustomValidity('Konfirmasi kata sandi minimal 6 karakter.');
                  } else {
                    e.target.setCustomValidity('');
                  }
                }}
                onInput={(e) => e.target.setCustomValidity('')}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? 'Mendaftarkan Akun...' : `Daftar Sebagai ${formData.role === 'doctor' ? 'Dokter' : 'Pasien'}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Sudah memiliki akun?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Masuk Disini
          </Link>
        </div>

      </div>
    </div>
  );
};
