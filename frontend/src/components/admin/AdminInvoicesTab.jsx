import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Search, Plus, Edit2, Trash2, Receipt, Eye, Filter, Loader2 } from 'lucide-react';

export const AdminInvoicesTab = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  const [form, setForm] = useState({
    subtotal: 250000,
    discount_amount: 0,
    tax_amount: 0,
    total: 250000,
    status: 'unpaid',
    due_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await adminService.getInvoices(params);
      const list = res.data?.data || res.data || [];
      setInvoices(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingInvoice(null);
    setForm({
      subtotal: 250000,
      discount_amount: 0,
      tax_amount: 0,
      total: 250000,
      status: 'unpaid',
      due_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (inv) => {
    setEditingInvoice(inv);
    setForm({
      subtotal: inv.subtotal || 0,
      discount_amount: inv.discount_amount || 0,
      tax_amount: inv.tax_amount || 0,
      total: inv.total || 0,
      status: inv.status || 'unpaid',
      due_date: inv.due_date ? inv.due_date.split('T')[0] : '',
      notes: inv.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingInvoice) {
        await adminService.updateInvoice(editingInvoice.id, form);
      } else {
        await adminService.createInvoice(form);
      }
      setModalOpen(false);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan invoice.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus tagihan invoice ini?')) return;
    try {
      await adminService.deleteInvoice(id);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus invoice.');
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
          <h3 className="text-lg font-bold text-slate-900">Manajemen Tagihan & Invoice</h3>
          <p className="text-xs text-slate-500">Kelola status pembayaran, rincian biaya, dan pencatatan tagihan sesi terapi.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchInvoices()}
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 w-44"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="unpaid">Belum Bayar (Unpaid)</option>
            <option value="pending">Menunggu (Pending)</option>
            <option value="paid">Lunas (Paid)</option>
          </select>

          <button
            onClick={handleOpenAdd}
            className="py-2 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Buat Invoice
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Memuat data invoice...</div>
      ) : invoices.length === 0 ? (
        <div className="py-12 text-center text-slate-400">Belum ada invoice ditemukan.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Pasien Anak / Wali</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-brand-700">{inv.invoice_number}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">
                      {inv.child?.name || inv.booking?.child?.name || 'Pasien Umum'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {inv.guardian?.user?.name || '-'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        inv.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : inv.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setDetailModal(inv)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Lihat Rincian"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(inv)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100"
                        title="Edit Status"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingInvoice ? 'Perbarui Status Invoice' : 'Buat Invoice Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subtotal (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.subtotal}
                    onChange={(e) => {
                      const sub = Number(e.target.value);
                      setForm({
                        ...form,
                        subtotal: sub,
                        total: sub - form.discount_amount + form.tax_amount,
                      });
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Diskon (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.discount_amount}
                    onChange={(e) => {
                      const disc = Number(e.target.value);
                      setForm({
                        ...form,
                        discount_amount: disc,
                        total: form.subtotal - disc + form.tax_amount,
                      });
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status Pembayaran</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="unpaid">Unpaid (Belum Bayar)</option>
                    <option value="pending">Pending (Menunggu)</option>
                    <option value="paid">Paid (Lunas)</option>
                    <option value="failed">Failed (Gagal)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Jatuh Tempo</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Total Tagihan (Rp)</label>
                <input
                  type="number"
                  disabled
                  value={form.total}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold text-brand-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Tagihan</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Keterangan pembayaran atau nomor rekening..."
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
                  {saving ? 'Menyimpan...' : 'Simpan Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-brand-600">{detailModal.invoice_number}</span>
                <h3 className="font-bold text-slate-900 text-base">Detail Tagihan</h3>
              </div>
              <button onClick={() => setDetailModal(null)} className="text-slate-400">✕</button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between"><span className="text-slate-400">Pasien:</span> <span className="font-bold">{detailModal.child?.name || detailModal.booking?.child?.name || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Subtotal:</span> <span>{formatCurrency(detailModal.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Diskon:</span> <span>-{formatCurrency(detailModal.discount_amount)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Pajak:</span> <span>+{formatCurrency(detailModal.tax_amount)}</span></div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-100">
                <span>Total:</span> <span className="text-brand-700">{formatCurrency(detailModal.total)}</span>
              </div>
              <div className="flex justify-between pt-1"><span className="text-slate-400">Status:</span> <span className="capitalize font-bold text-emerald-700">{detailModal.status}</span></div>
            </div>

            <div className="flex justify-end pt-3">
              <button onClick={() => setDetailModal(null)} className="py-2 px-4 rounded-xl bg-slate-100 text-xs font-bold">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoicesTab;
