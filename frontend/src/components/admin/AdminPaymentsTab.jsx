import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Search, Plus, Edit2, Trash2, CreditCard, Eye, Filter, Loader2 } from 'lucide-react';

export const AdminPaymentsTab = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    invoice_id: '',
    amount: 250000,
    method: 'transfer',
    transaction_id: '',
    status: 'completed',
    notes: '',
  });

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const [pRes, invRes] = await Promise.all([
        adminService.getPayments(params),
        adminService.getInvoices({ status: 'unpaid' }),
      ]);

      const pList = pRes.data?.data || pRes.data || [];
      const invList = invRes.data?.data || invRes.data || [];

      setPayments(Array.isArray(pList) ? pList : []);
      setInvoices(Array.isArray(invList) ? invList : []);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setForm({
      invoice_id: invoices[0]?.id || '',
      amount: invoices[0]?.total || 250000,
      method: 'transfer',
      transaction_id: 'TRX-' + Math.floor(100000 + Math.random() * 900000),
      status: 'completed',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.createPayment(form);
      setModalOpen(false);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mencatat pembayaran.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus catatan pembayaran ini?')) return;
    try {
      await adminService.deletePayment(id);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus pembayaran.');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Manajemen Transaksi & Pembayaran</h3>
          <p className="text-xs text-slate-500">Pencatatan uang masuk, bukti transfer bank, dan metode pembayaran pasien.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Completed (Berhasil)</option>
            <option value="pending">Pending (Menunggu)</option>
            <option value="failed">Failed (Gagal)</option>
          </select>

          <button
            onClick={handleOpenAdd}
            className="py-2 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Catat Pembayaran
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Memuat transaksi pembayaran...</div>
      ) : payments.length === 0 ? (
        <div className="py-12 text-center text-slate-400">Belum ada riwayat transaksi pembayaran.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">ID Transaksi</th>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Jumlah Diterima</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {p.transaction_id || `PAY-${p.id}`}
                  </td>
                  <td className="py-3 px-4 font-mono text-brand-700 font-semibold">
                    {p.invoice?.invoice_number || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize font-semibold text-slate-700">
                      {p.method ? p.method.replace('_', ' ') : 'Transfer'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        p.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Payment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Catat Pembayaran Masuk</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pilih Tagihan Invoice *</label>
                <select
                  required
                  value={form.invoice_id}
                  onChange={(e) => {
                    const id = e.target.value;
                    const inv = invoices.find((i) => i.id.toString() === id);
                    setForm({
                      ...form,
                      invoice_id: id,
                      amount: inv ? inv.total : form.amount,
                    });
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="">-- Pilih Invoice --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} ({formatCurrency(inv.total)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-brand-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Metode Bayar *</label>
                  <select
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="transfer">Transfer Bank</option>
                    <option value="cash">Tunai (Cash di Kasir)</option>
                    <option value="credit_card">Kartu Kredit/Debit</option>
                    <option value="e_wallet">QRIS / E-Wallet</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">No. Referensi / ID Transaksi</label>
                <input
                  type="text"
                  value={form.transaction_id}
                  onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
                  placeholder="Misal: TRX-987654"
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Nama pengirim rekening atau bukti transfer..."
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsTab;
