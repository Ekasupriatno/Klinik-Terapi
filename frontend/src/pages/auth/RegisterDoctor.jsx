import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import {
  Stethoscope,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Award,
  Clock,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';

export const RegisterDoctor = () => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    specialization: '',
    license_number: '',
    phone: '',
    gender: 'male',
    birth_date: '',
    address: '',
    education: '',
    experience_years: '1',
    bio: '',
  });

  // Photo & Preview State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Quick Specialization options
  const specializationsList = [
    'Psikologi Anak',
    'Fisioterapi Pediatrik',
    'Terapi Wicara',
    'Terapi Okupasi',
    'Sensori Integrasi',
    'Rehabilitasi Medik (Sp.KFR)',
    'Psikiatri Anak & Remaja',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        profile_photo: ['Ukuran berkas melebihi 2MB. Silakan pilih foto dengan ukuran lebih kecil.'],
      }));
      return;
    }

    // Validate type
    const validMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        profile_photo: ['Format foto harus berupa JPG, PNG, atau WebP.'],
      }));
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setFieldErrors((prev) => ({ ...prev, profile_photo: null }));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  const validateClientSide = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = ['Nama lengkap wajib diisi.'];
    if (!formData.email.trim()) errors.email = ['Alamat email wajib diisi.'];
    if (!formData.password) errors.password = ['Kata sandi wajib diisi.'];
    else if (formData.password.length < 8) errors.password = ['Kata sandi minimal 8 karakter.'];

    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = ['Konfirmasi kata sandi tidak cocok.'];
    }

    if (!formData.specialization.trim()) errors.specialization = ['Spesialisasi wajib diisi.'];
    if (!formData.license_number.trim()) errors.license_number = ['Nomor lisensi / SIP / STR wajib diisi.'];
    if (!formData.phone.trim()) errors.phone = ['Nomor telepon wajib diisi.'];
    if (!formData.birth_date) errors.birth_date = ['Tanggal lahir wajib diisi.'];
    if (!formData.address.trim()) errors.address = ['Alamat wajib diisi.'];
    if (!formData.education.trim()) errors.education = ['Riwayat pendidikan wajib diisi.'];

    const years = parseInt(formData.experience_years, 10);
    if (isNaN(years) || years < 0) {
      errors.experience_years = ['Pengalaman kerja minimal 0 tahun.'];
    }

    if (!agreement) {
      errors.agreement = ['Anda harus menyetujui pernyataan keaslian data.'];
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    const clientErrors = validateClientSide();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      // Scroll to first error
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });

      if (photoFile) {
        payload.append('profile_photo', photoFile);
      }

      const response = await authService.registerDoctor(payload);

      // Successfully registered with pending status -> redirect to success page
      navigate('/register/doctor/success', {
        state: {
          doctorName: formData.name,
          doctorEmail: formData.email,
          licenseNumber: formData.license_number,
          message: response?.message,
        },
      });
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
        setGeneralError('Mohon periksa kembali kolom isian yang bertanda merah.');
      } else {
        setGeneralError(
          err.response?.data?.message ||
          'Terjadi kesalahan pada server saat memproses registrasi. Silakan coba kembali.'
        );
      }
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/20 to-teal-50/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-card text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-100/40 to-teal-100/10 rounded-full blur-3xl -z-0"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold tracking-wide uppercase">
              <Stethoscope className="w-4 h-4 text-brand-600" />
              Pendaftaran Praktik Medis & Terapi
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Registrasi Dokter & Terapis Spesialis
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Bergabunglah dengan tim terapis dan dokter multidisiplin Klinik Terapi. Demi menjaga standar keselamatan pasien, setiap akun akan diverifikasi oleh Admin Klinik sebelum diaktifkan.
            </p>

            {/* Verification Pipeline Notice */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3 text-left">
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Alur Verifikasi Akun:</span>
                <p className="text-amber-800 mt-0.5">
                  Setelah mengirim formulir, akun Anda akan berstatus <strong>Pending</strong>. Anda akan menerima notifikasi verifikasi via email dan dapat login setelah Admin Klinik memverifikasi nomor lisensi (SIP/SIPP/STR).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {generalError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{generalError}</div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          
          {/* ======================================================== */}
          {/* SECTION 1: INFORMASI AKUN                               */}
          {/* ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm shadow-sm">
                1
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Informasi Kredensial Akun</h2>
                <p className="text-xs text-slate-500">Kredensial utama yang akan digunakan untuk masuk ke portal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Contoh: dr. Budi Santoso, Sp.A atau Budi Santoso, M.Psi., Psikolog"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border text-sm font-medium transition focus:bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.name
                        ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-brand-500'
                    }`}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.name[0]}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Alamat Email Aktif <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="dokter@klinikterapi.com atau dokter@gmail.com"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border text-sm font-medium transition focus:bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.email
                        ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-brand-500'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.email[0]}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimal 8 karakter"
                    className={`w-full pl-12 pr-12 py-3 rounded-xl bg-slate-50 border text-sm font-medium transition focus:bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.password
                        ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.password[0]}</p>
                )}
              </div>

              {/* Password Confirmation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    placeholder="Ulangi kata sandi"
                    className={`w-full pl-12 pr-12 py-3 rounded-xl bg-slate-50 border text-sm font-medium transition focus:bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.password_confirmation
                        ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.password_confirmation && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.password_confirmation[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: INFORMASI PROFESIONAL                        */}
          {/* ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm shadow-sm">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Informasi Keahlian & Lisensi Medis</h2>
                <p className="text-xs text-slate-500">Legalitas praktik dan riwayat pendidikan profesi Anda</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Specialization */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Bidang Spesialisasi / Layanan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Award className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="Contoh: Psikologi Anak, Fisioterapi Pediatrik, Terapi Wicara"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border text-sm font-medium transition focus:bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.specialization
                        ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-brand-500'
                    }`}
                  />
                </div>
                {/* Quick suggestions pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 py-1">Pilihan Cepat:</span>
                  {specializationsList.map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => {
                        setFormData((p) => ({ ...p, specialization: spec }));
                        if (fieldErrors.specialization) {
                          setFieldErrors((p) => ({ ...p, specialization: null }));
                        }
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                      + {spec}
                    </button>
                  ))}
                </div>
                {fieldErrors.specialization && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.specialization[0]}</p>
                )}
              </div>

              {/* License Number (SIP / STR) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Nomor Lisensi Praktik (SIP / SIPP / STR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleInputChange}
                    placeholder="Contoh: SIPP-123456 atau 446/SIP/2026"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border text-sm font-medium transition focus:bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.license_number
                        ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-brand-500'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400">Nomor ini akan diverifikasi oleh Admin Klinik.</p>
                {fieldErrors.license_number && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.license_number[0]}</p>
                )}
              </div>

              {/* Experience Years */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Pengalaman Praktik (Tahun) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    max="60"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    placeholder="5"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border text-sm font-medium transition focus:bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.experience_years
                        ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-brand-500'
                    }`}
                  />
                </div>
                {fieldErrors.experience_years && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.experience_years[0]}</p>
                )}
              </div>

              {/* Education */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Latar Belakang Pendidikan Terakhir <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="Contoh: S2 Magister Psikologi Klinis Anak - Universitas Indonesia"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border text-sm font-medium transition focus:bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.education
                        ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-brand-500'
                    }`}
                  />
                </div>
                {fieldErrors.education && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.education[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: INFORMASI PRIBADI & KONTAK                   */}
          {/* ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                3
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Informasi Pribadi & Kontak</h2>
                <p className="text-xs text-slate-500">Data identitas diri dan alamat domisili praktik</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Phone / WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Nomor WhatsApp / Telepon <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Contoh: 081234567890"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border text-sm font-medium transition focus:bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.phone
                        ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-brand-500'
                    }`}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.phone[0]}</p>
                )}
              </div>

              {/* Birth Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Tanggal Lahir <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    name="birth_date"
                    max={new Date().toISOString().split('T')[0]}
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border text-sm font-medium transition focus:bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.birth_date
                        ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-brand-500'
                    }`}
                  />
                </div>
                {fieldErrors.birth_date && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.birth_date[0]}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Jenis Kelamin <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, gender: 'male' }))}
                    className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition ${
                      formData.gender === 'male'
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span>👨‍⚕️</span> Laki-laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, gender: 'female' }))}
                    className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition ${
                      formData.gender === 'female'
                        ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span>👩‍⚕️</span> Perempuan
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Alamat Praktik / Domisili Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  <textarea
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Contoh: Jl. Diponegoro No. 12, Bandung, Jawa Barat"
                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border text-sm font-medium transition focus:bg-white focus:outline-none focus:ring-2 ${
                      fieldErrors.address
                        ? 'border-rose-300 ring-rose-200 focus:ring-rose-400'
                        : 'border-slate-200 focus:ring-brand-500'
                    }`}
                  />
                </div>
                {fieldErrors.address && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.address[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 4: PROFIL, BIO & PASFOTO                        */}
          {/* ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm shadow-sm">
                4
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Profil & Foto Medis</h2>
                <p className="text-xs text-slate-500">Perkenalan singkat untuk calon pasien dan verifikasi identitas</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Bio / Ringkasan Pengalaman Klinis
                </label>
                <textarea
                  rows={3}
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Ceritakan pengalaman Anda, pendekatan terapi, atau fokus kasus yang biasa Anda tangani..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {fieldErrors.bio && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.bio[0]}</p>
                )}
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Foto Profil Resmi (Pasfoto Medis)
                </label>

                {photoPreview ? (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <img
                      src={photoPreview}
                      alt="Preview Foto Profil"
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-slate-800">{photoFile?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {photoFile ? (photoFile.size / 1024).toFixed(1) + ' KB' : ''}
                      </p>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="inline-flex items-center gap-1.5 text-xs text-rose-600 font-bold hover:text-rose-700 transition pt-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Hapus Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-slate-200 hover:border-brand-400 bg-slate-50/50 hover:bg-brand-50/20 rounded-2xl p-6 text-center cursor-pointer transition group">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-slate-400 group-hover:text-brand-600 transition">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 mt-3 group-hover:text-brand-700 transition">
                      Klik untuk memilih pasfoto atau seret berkas ke sini
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Format yang didukung: JPG, PNG, atau WebP (Maksimal 2MB)
                    </p>
                  </label>
                )}

                {fieldErrors.profile_photo && (
                  <p className="text-xs text-rose-600 font-medium">{fieldErrors.profile_photo[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* DECLARATION & SUBMIT                                    */}
          {/* ======================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card space-y-6">
            <div className="flex items-start gap-3">
              <input
                id="doctor-agreement"
                type="checkbox"
                checked={agreement}
                onChange={(e) => {
                  setAgreement(e.target.checked);
                  if (fieldErrors.agreement) {
                    setFieldErrors((p) => ({ ...p, agreement: null }));
                  }
                }}
                className="mt-1 w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
              />
              <label htmlFor="doctor-agreement" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                Saya menyatakan bahwa seluruh data yang saya isikan (termasuk nomor lisensi profesi/SIP/STR dan riwayat pendidikan) adalah <strong>sah, akurat, dan sesuai dengan dokumen resmi</strong>. Saya mengerti bahwa akun saya hanya dapat aktif setelah diverifikasi dan disetujui oleh Administrator Klinik Terapi.
              </label>
            </div>
            {fieldErrors.agreement && (
              <p className="text-xs text-rose-600 font-medium">{fieldErrors.agreement[0]}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-brand-500/25 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses Pendaftaran Dokter...</span>
                  </>
                ) : (
                  <>
                    <span>Daftarkan Akun Dokter Spesialis</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center text-xs text-slate-500">
              Sudah memiliki akun terverifikasi?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
                Masuk ke Portal Dokter
              </Link>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

export default RegisterDoctor;
