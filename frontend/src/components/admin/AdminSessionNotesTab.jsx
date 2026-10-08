import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Search, Plus, Edit2, Trash2, FileText, Eye, Filter, Share2, Loader2 } from 'lucide-react';

export const AdminSessionNotesTab = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [statusFilter]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await adminService.getSessionNotes(params);
      const list = res.data?.data || res.data || [];
      setNotes(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load session notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus catatan sesi ini?')) return;
    try {
      await adminService.deleteSessionNote(id);
      fetchNotes();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus catatan sesi.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Catatan Rekam Sesi Terapi</h3>
          <p className="text-xs text-slate-500">Tinjau seluruh rekam medis dan observasi klinis yang dibuat para terapis.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="draft">Draft (Belum Final)</option>
            <option value="completed">Completed (Final)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Memuat catatan sesi...</div>
      ) : notes.length === 0 ? (
        <div className="py-12 text-center text-slate-400">Tidak ada catatan sesi ditemukan.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Pasien Anak</th>
                <th className="py-3 px-4">Terapis</th>
                <th className="py-3 px-4">Ringkasan Catatan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Bagikan ke Ortu</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {notes.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {n.booking?.child?.name || 'Pasien Buah Hati'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {n.therapist?.name || '-'}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                    {n.note}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        n.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {n.share_with_guardian ? (
                      <span className="text-brand-700 font-bold flex items-center gap-1">
                        <Share2 className="w-3 h-3" /> Ya
                      </span>
                    ) : (
                      <span className="text-slate-400">Tidak</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {n.created_at ? new Date(n.created_at).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setDetailModal(n)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Lihat Rincian"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
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

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase text-brand-600">{detailModal.status}</span>
                <h3 className="font-bold text-slate-900 text-base">
                  {detailModal.booking?.child?.name || 'Pasien Anak'}
                </h3>
              </div>
              <button onClick={() => setDetailModal(null)} className="text-slate-400">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block mb-0.5 font-bold uppercase text-[10px]">Catatan Utama:</span>
                <p className="bg-slate-50 p-2.5 rounded-xl text-slate-800">{detailModal.note}</p>
              </div>
              {detailModal.interventions && (
                <div>
                  <span className="text-slate-400 block mb-0.5 font-bold uppercase text-[10px]">Intervensi:</span>
                  <p className="bg-slate-50 p-2.5 rounded-xl text-slate-800">{detailModal.interventions}</p>
                </div>
              )}
              {detailModal.observations && (
                <div>
                  <span className="text-slate-400 block mb-0.5 font-bold uppercase text-[10px]">Observasi:</span>
                  <p className="bg-slate-50 p-2.5 rounded-xl text-slate-800">{detailModal.observations}</p>
                </div>
              )}
              {detailModal.progress && (
                <div>
                  <span className="text-slate-400 block mb-0.5 font-bold uppercase text-[10px]">Perkembangan:</span>
                  <p className="bg-slate-50 p-2.5 rounded-xl text-slate-800">{detailModal.progress}</p>
                </div>
              )}
              {detailModal.next_plan && (
                <div>
                  <span className="text-slate-400 block mb-0.5 font-bold uppercase text-[10px]">Rencana Lanjutan:</span>
                  <p className="bg-slate-50 p-2.5 rounded-xl text-slate-800">{detailModal.next_plan}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button onClick={() => setDetailModal(null)} className="py-2 px-4 rounded-xl bg-slate-100 text-xs font-bold">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSessionNotesTab;
