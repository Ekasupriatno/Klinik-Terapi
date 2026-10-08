import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  ShieldCheck,
  Clock,
  Award,
  ArrowRight,
  Sparkles,
  Activity,
  HeartPulse,
  Users,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { clinicSettingService } from '../services/api';

export const HomePage = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('6282235123063');

  useEffect(() => {
    clinicSettingService.getPublicSettings()
      .then((res) => {
        if (res.data?.data?.whatsapp) {
          setWhatsappNumber(res.data.data.whatsapp.replace(/[^0-9]/g, ''));
        }
      })
      .catch((err) => console.error('Failed to load clinic whatsapp in HomePage:', err));
  }, []);
  const features = [
    {
      icon: Award,
      title: 'Terapis & Dokter Tersertifikasi',
      desc: 'Seluruh tenaga medis memiliki Surat Izin Praktik (SIP) resmi dan berpengalaman klinis bertahun-tahun.',
    },
    {
      icon: Clock,
      title: 'Pemesanan Slot Pasti & Akurat',
      desc: 'Sistem slot waktu digital otomatis tanpa antre berjam-jam. Datang sesuai jam yang Anda pilih.',
    },
    {
      icon: ShieldCheck,
      title: 'Peralatan Medis Modern',
      desc: 'Didukung sarana fisioterapi, akupunktur steril, dan ruang terapi privat yang higienis serta nyaman.',
    },
    {
      icon: Sparkles,
      title: 'Rencana Pemulihan Personal',
      desc: 'Setiap pasien mendapatkan asesmen komprehensif disesuaikan dengan kondisi spesifik dan tujuan pemulihan.',
    },
  ];

  const specializations = [
    {
      title: 'Fisioterapi & Olahraga',
      desc: 'Pemulihan cedera lutut, robek otot, pasca operasi fraktur, dan pemulihan gerak fungsional tubuh.',
      tag: 'Paling Populer',
    },
    {
      title: 'Terapi Tulang Belakang (Spine)',
      desc: 'Penanganan saraf kejepit (HNP), koreksi postur skoliosis, dan nyeri leher kronis tanpa operasi.',
      tag: 'Terapi Unggulan',
    },
    {
      title: 'Rehabilitasi Stroke & Saraf',
      desc: 'Latihan motorik terpandu untuk mengembalikan kemandirian berjalan, bicara, dan beraktivitas.',
      tag: 'Medik Terpadu',
    },
    {
      title: 'Akupunktur Medis & Nyeri',
      desc: 'Pereda nyeri sendi, migrain berkepanjangan, bell\'s palsy, dan insomnia dengan jarum steril.',
      tag: 'Holistik Medis',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 bg-gradient-to-b from-brand-50/60 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100/80 text-blue- text-xs sm:text-sm font-bold tracking-wide">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Pusat Rehabilitasi & Terapi Medik Terpadu</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Membantu Anak <span className="text-brand-600">Menuju</span> Potensi terbaik nya.
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Dapatkan penanganan dari dokter spesialis rehabilitasi medik dan terapis profesional berlisensi. Reservasi jadwal konsultasi online instan tanpa antre panjang.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/booking"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 group transition-all"
                >
                  <CalendarCheck className="w-5 h-5" />
                  Reservasi Jadwal Sekarang
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/doctors"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition"
                >
                  Lihat Profil Dokter
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>Jadwal Terkonfirmasi Instan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>Jaminan Privasi Pasien</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>Konsultasi Terarah</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-2 bg-gradient-to-r from-brand-400 to-emerald-400 rounded-3xl blur-2xl opacity-20 transform -rotate-1"></div>
                
                <div className="relative bg-white rounded-3xl shadow-xl border border-slate-100 p-6 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Jadwal Praktek Hari Ini</h4>
                        <p className="text-xs text-slate-500">Rumah Terapi Alabina</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      Buka Sekarang
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-brand-700">Fisioterapi & Spine</p>
                        <p className="text-sm font-bold text-slate-800">dr. Hendra Wijaya, Sp.KFR</p>
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        09:00 - 15:00
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-brand-700">Chiropractic</p>
                        <p className="text-sm font-bold text-slate-800">dr. Anita Larasati, DC</p>
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        10:00 - 16:00
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white space-y-2">
                    <p className="text-xs font-medium text-brand-200">Punya Pertanyaan Darurat?</p>
                    <p className="text-sm font-bold">Hubungi Customer Service WhatsApp kami sekarang</p>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=Halo%20Admin%20Klinik%20Terapi,%20saya%20ingin%20tanya%20jadwal`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-xl bg-white text-brand-800 text-xs font-bold hover:bg-brand-50 transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
                      Chat WhatsApp Klinik
                    </a>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Metrics Counter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-700">10.000+</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Sesi Terapi Selesai</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-700">98.5%</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Kepuasan Pasien</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-700">15+</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Dokter & Terapis Ahli</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-700">0 Menit</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Antrean Tanpa Kepastian</div>
          </div>
        </div>
      </section>

      {/* Specializations Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs sm:text-sm font-bold tracking-wider text-brand-600 uppercase">
            Layanan Terapi Unggulan
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Fokus Pada Pemulihan Sumber Masalah Anda
          </h3>
          <p className="text-slate-600 text-base">
            Kami menggabungkan terapi fisik fungsional, teknologi modern, dan penanganan medis untuk mempercepat proses penyembuhan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specializations.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100">
                  {item.tag}
                </span>
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="pt-6 mt-4 border-t border-slate-100">
                <Link
                  to="/doctors"
                  className="text-xs font-bold text-brand-600 group-hover:text-brand-700 inline-flex items-center gap-1.5"
                >
                  Pilih Spesialisasi Ini <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-brand-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-300">
              Standar Layanan Kami
            </h3>
            <h4 className="text-3xl font-extrabold tracking-tight">
              Mengapa Pasien Memilih Klinik Terapi Kami?
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h5 className="text-lg font-bold text-white">{feat.title}</h5>
                  <p className="text-sm text-slate-300 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Siap Menjalani Hari Tanpa Rasa Nyeri?
            </h3>
            <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
              Jadwalkan sesi konsultasi dan terapi pertama Anda bersama dokter spesialis kami hari ini.
            </p>
          </div>
          <Link
            to="/booking"
            className="px-8 py-4 rounded-2xl bg-white text-brand-800 font-bold text-base hover:bg-brand-50 shadow-lg transition active:scale-95 flex-shrink-0"
          >
            Pesan Jadwal Sekarang
          </Link>
        </div>
      </section>

    </div>
  );
};
