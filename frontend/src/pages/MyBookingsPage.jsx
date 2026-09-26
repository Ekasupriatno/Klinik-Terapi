import React, { useState, useEffect } from 'react';
import { bookingService, reviewService } from '../services/api';
import { BookingStatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Calendar,
  Clock,
  User,
  Star,
  XCircle,
  PhoneCall,
  MessageSquare,
  AlertCircle,
  FileText,
  ChevronRight
} from 'lucide-react';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // all, active, completed, cancelled

  // Modal Cancel State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Modal Review State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [notification, setNotification] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getAll();
      if (res.data?.data) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancelModal = (booking) => {
    setSelectedBookingForCancel(booking);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    setCancelling(true);
    try {
      await bookingService.cancel(selectedBookingForCancel.id, cancelReason);
      setNotification({ type: 'success', message: 'Booking berhasil dibatalkan.' });
      setCancelModalOpen(false);
      fetchBookings();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Gagal membatalkan booking.',
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBookingForReview(booking);
    setRating(5);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedBookingForReview) return;
    setSubmittingReview(true);
    try {
      await reviewService.create({
        booking_id: selectedBookingForReview.id,
        rating,
        comment,
      });
      setNotification({ type: 'success', message: 'Terima kasih atas ulasan dan rating Anda!' });
      setReviewModalOpen(false);
      fetchBookings();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan ulasan.',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'active') {
      return ['pending', 'confirmed', 'in_consultation'].includes(b.status);
    }
    if (filterTab === 'completed') {
      return b.status === 'completed';
    }
    if (filterTab === 'cancelled') {
      return b.status === 'cancelled';
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Riwayat & Jadwal Booking Saya
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pantau status reservasi konsultasi terapi dan catatan medis hasil pemeriksaan Anda.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {notification.message && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between transition ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification({ type: '', message: '' })}
            className="text-xs font-bold underline ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'active', label: 'Mendatang & Aktif' },
          { id: 'completed', label: 'Selesai' },
          { id: 'cancelled', label: 'Dibatalkan' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filterTab === tab.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse p-6" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Reservasi</h3>
          <p className="text-xs text-slate-500">
            Anda belum memiliki jadwal reservasi di kategori ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card hover:border-slate-200 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-extrabold text-brand-700 bg-brand-50 px-3 py-1 rounded-xl border border-brand-100">
                    {b.booking_code}
                  </span>
                  <BookingStatusBadge status={b.status} />
                </div>
                <span className="text-xs text-slate-400">
                  Diajukan: {b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : '-'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Doctor info */}
                <div className="md:col-span-6 flex items-center gap-4">
                  <img
                    src={b.doctor?.image_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}
                    alt={b.doctor?.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                      {b.doctor?.specialization?.name}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">
                      {b.doctor?.name}
                    </h4>
                    <p className="text-xs text-slate-500">{b.doctor?.title}</p>
                  </div>
                </div>

                {/* Schedule info */}
                <div className="md:col-span-6 space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <Calendar className="w-4 h-4 text-brand-600" />
                    <span>{b.formatted_date || b.appointment_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <span>{b.time_range} WIB</span>
                  </div>
                </div>
              </div>

              {/* Keluhan & Catatan Dokter */}
              <div className="pt-2 text-xs text-slate-600 space-y-1.5">
                <p>
                  <strong className="text-slate-800">Keluhan:</strong> {b.patient_complaint}
                </p>
                {b.doctor_notes && (
                  <div className="p-3 rounded-xl bg-brand-50/70 border border-brand-100 text-brand-900 mt-2">
                    <strong>Catatan Dokter / Hasil Terapi:</strong> {b.doctor_notes}
                  </div>
                )}
                {b.cancel_reason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 mt-2">
                    <strong>Alasan Pembatalan:</strong> {b.cancel_reason}
                  </div>
                )}
              </div>

              {/* Action buttons footer */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/6281234567890?text=Halo%20Admin%20Klinik%20Terapi,%20saya%20ingin%20menanyakan%20status%20booking%20nomor%20${encodeURIComponent(b.booking_code)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Chat WhatsApp Klinik
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {b.can_cancel && (
                    <button
                      onClick={() => handleOpenCancelModal(b)}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      Batalkan Reservasi
                    </button>
                  )}

                  {b.can_review && (
                    <button
                      onClick={() => handleOpenReviewModal(b)}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                    >
                      <Star className="w-4 h-4 fill-white" />
                      Beri Ulasan Dokter
                    </button>
                  )}

                  {b.review && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      Rating Anda: {b.review.rating}/5
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Batal Reservasi */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Konfirmasi Pembatalan Reservasi"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600">
            Apakah Anda yakin ingin membatalkan jadwal konsultasi dengan{' '}
            <strong>{selectedBookingForCancel?.doctor?.name}</strong> pada tanggal{' '}
            <strong>{selectedBookingForCancel?.appointment_date}</strong>?
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Alasan Pembatalan (Opsional):
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Contoh: Berhalangan hadir karena ada keperluan mendadak."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Kembali
            </button>
            <button
              disabled={cancelling}
              onClick={handleConfirmCancel}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition disabled:opacity-50"
            >
              {cancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Beri Ulasan */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Beri Ulasan & Rating Dokter"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Bagikan pengalaman terapi Anda bersama <strong>{selectedBookingForReview?.doctor?.name}</strong> untuk membantu pasien lain.
          </p>

          {/* Star selector */}
          <div className="flex items-center justify-center gap-2 py-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Komentar / Ulasan Anda:</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bagaimana perubahan kondisi fisik Anda setelah menjalani terapi ini?"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              disabled={submittingReview}
              onClick={handleSubmitReview}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition disabled:opacity-50"
            >
              {submittingReview ? 'Menyimpan...' : 'Kirim Ulasan'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
