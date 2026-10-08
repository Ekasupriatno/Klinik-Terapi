import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Search, Shield, Trash2, Eye, Filter, Loader2, Calendar } from 'lucide-react';

export const AdminAuditLogsTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;

      const res = await adminService.getAuditLogs(params);
      const list = res.data?.data || res.data || [];
      setLogs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus log aktivitas ini?')) return;
    try {
      await adminService.deleteAuditLog(id);
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus log.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Log Audit & Keamanan Sistem</h3>
          <p className="text-xs text-slate-500">Rekam jejak setiap aksi pengguna, login, perubahan booking, dan pembaruan rekam medis.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Filter Aksi (create, update...)"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs w-36"
          />
          <input
            type="text"
            placeholder="Filter Entitas (Booking, User...)"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs w-36"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Memuat log aktivitas...</div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center text-slate-400">Belum ada catatan log aktivitas tersimpan.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Entitas Terkait</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Waktu Kejadian</th>
                <th className="py-3 px-4 text-right">Rincian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div>{log.user?.name || 'Sistem / Anonim'}</div>
                    <div className="text-[11px] text-slate-400 font-normal">{log.user?.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {log.entity} {log.entity_id ? `#${log.entity_id}` : ''}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {log.created_at ? new Date(log.created_at).toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setDetailModal(log)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100"
                        title="Lihat Data Payload"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(log.id)}
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

      {/* Payload Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Rincian Data Log Audit</h3>
              <button onClick={() => setDetailModal(null)} className="text-slate-400">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Aksi:</span> <span className="font-bold font-mono">{detailModal.action}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Entitas:</span> <span className="font-semibold">{detailModal.entity} #{detailModal.entity_id}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">User Agent:</span> <span className="text-slate-600 truncate max-w-xs">{detailModal.user_agent || '-'}</span></div>

              <div className="pt-2">
                <span className="text-slate-400 block mb-1">Payload / Snapshot Data (JSON):</span>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-60">
                  {typeof detailModal.payload === 'object'
                    ? JSON.stringify(detailModal.payload, null, 2)
                    : detailModal.payload || '{}'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3">
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

export default AdminAuditLogsTab;
