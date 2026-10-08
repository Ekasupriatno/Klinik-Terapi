import React, { useState, useEffect } from 'react';
import { clinicSettingService } from '../../services/api';
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  Building2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const AdminSettingsTab = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    operational_hours: '',
  });

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await clinicSettingService.getAdminSettings();
      const data = res.data?.data || {};
      const settings = {
        name: data.name || 'Klinik Terapi & Rehabilitasi Medik',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        email: data.email || '',
        address: data.address || '',
        operational_hours: data.operational_hours || '',
      };
      setFormData(settings);
      setInitialData(settings);
    } catch (err) {
      console.error('Failed to load clinic settings:', err);
      setNotification({
        type: 'error',
        message: 'Gagal memuat pengaturan klinik. Silakan muat ulang halaman.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      setNotification({
        type: 'info',
        message: 'Form dikembalikan ke data tersimpan.',
      });
      setTimeout(() => setNotification({ type: '', message: '' }), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ type: '', message: '' });

    // Client-side quick checks
    if (!formData.phone.trim()) {
      setNotification({ type: 'error', message: 'Nomor telepon wajib diisi.' });
      return;
    }
    if (!formData.whatsapp.trim()) {
      setNotification({ type: 'error', message: 'Nomor WhatsApp wajib diisi.' });
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setNotification({ type: 'error', message: 'Email tidak valid.' });
      return;
    }
    if (!formData.address.trim()) {
      setNotification({ type: 'error', message: 'Alamat klinik wajib diisi.' });
      return;
    }

    try {
      setSaving(true);
      const res = await clinicSettingService.updateSettings(formData);
      const updated = res.data?.data || formData;
      setFormData(updated);
      setInitialData(updated);

      setNotification({
        type: 'success',
        message: 'Pengaturan kontak & profil klinik berhasil diperbarui dan telah diterapkan ke website.',
      });

      // Dispatch event to inform any other components listening for settings updates
      window.dispatchEvent(new CustomEvent('clinic-settings-updated', { detail: updated }));
    } catch (err) {
      console.error('Error saving clinic settings:', err);
      const msg = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan pengaturan.';
      setNotification({
        type: 'error',
        message: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  // Clean whatsapp number for test wa link
  const cleanWhatsappNumber = (formData.whatsapp || '').replace(/[^0-9]/g, '');

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-500">Memuat pengaturan klinik...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Notification */}
      {notification.message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold transition ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : notification.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification({ type: '', message: '' })}
            className="text-xs opacity-70 hover:opacity-100 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Informasi Kontak & Profil Klinik
                </h3>
                <p className="text-xs text-slate-500">
                  Data ini digunakan di halaman kontak, footer, dan tombol WhatsApp pasien.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Publik
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama Klinik */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Nama Resmi Fasilitas / Klinik
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Contoh: Klinik Terapi & Rehabilitasi Medik"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>

            {/* Nomor Telepon & WhatsApp in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Telepon */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Nomor Telepon Kantor / Hotline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Contoh: +62 82235123063 atau (021) 7890-1234"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
                <p className="text-[11px] text-slate-400">Ditampilkan sebagai hotline panggilan suara.</p>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Nomor WhatsApp Admin <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="Contoh: 6282235123063"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                />
                <p className="text-[11px] text-slate-400">Gunakan kode negara (62...) tanpa tanda '+' untuk link chat.</p>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Alamat Email Pelayanan & Rujukan <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Contoh: layanan@klinikterapi.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>

            {/* Alamat Fisik */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Alamat Lengkap Fasilitas Klinik <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Masukkan alamat lengkap fasilitas klinik..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>

            {/* Jam Operasional */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Jam Operasional Klinik
              </label>
              <textarea
                rows={3}
                value={formData.operational_hours}
                onChange={(e) => handleChange('operational_hours', e.target.value)}
                placeholder="Contoh: Senin - Jumat: 08:00 - 18:00 WIB&#10;Sabtu: 08:00 - 15:00 WIB&#10;Minggu & Libur: Tutup"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Perubahan
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Preview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Pratinjau Tampilan Pasien
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Real-time</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-600" />
                {formData.name || 'Nama Klinik Belum Diisi'}
              </div>

              {/* Alamat */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-700">Alamat Fasilitas</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed whitespace-pre-line">
                    {formData.address || 'Alamat klinik belum diatur.'}
                  </p>
                </div>
              </div>

              {/* Telepon */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-700">Telepon / Hotline</span>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {formData.phone || 'Nomor belum diatur'}
                  </p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-700">WhatsApp Resmi</span>
                  <p className="text-[11px] text-emerald-700 font-mono font-semibold">
                    +{cleanWhatsappNumber || 'Nomor belum diatur'}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-700">Email Pelayanan</span>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {formData.email || 'Email belum diatur'}
                  </p>
                </div>
              </div>

              {/* Jam Operasional */}
              {formData.operational_hours && (
                <div className="flex items-start gap-3 pt-2 border-t border-slate-200/70">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-700">Jam Operasional</span>
                    <p className="text-[11px] text-slate-500 whitespace-pre-line leading-relaxed">
                      {formData.operational_hours}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Test WhatsApp Button */}
            {cleanWhatsappNumber && (
              <a
                href={`https://wa.me/${cleanWhatsappNumber}?text=Halo%20Admin%20Klinik%20Terapi,%20tes%20link%20pengaturan.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <MessageSquare className="w-4 h-4" />
                Uji Coba Tautan WhatsApp
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </a>
            )}
          </div>

          {/* Info Card */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              Pencatatan Audit Otomatis
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Setiap kali admin mengubah nomor telepon, WhatsApp, email, atau alamat, sistem secara otomatis merekam histori perubahan ke dalam <strong>Audit Logs</strong> demi kepatuhan dan keamanan klinik.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
