import React from 'react';

export const DoctorCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse flex flex-col md:flex-row gap-6">
    <div className="w-28 h-28 md:w-32 md:h-32 bg-slate-200 rounded-2xl flex-shrink-0 mx-auto md:mx-0" />
    <div className="flex-1 space-y-3">
      <div className="h-5 bg-slate-200 rounded-md w-3/4" />
      <div className="h-4 bg-slate-100 rounded-md w-1/2" />
      <div className="h-3 bg-slate-100 rounded-md w-full" />
      <div className="h-3 bg-slate-100 rounded-md w-5/6" />
      <div className="flex gap-4 pt-2">
        <div className="h-8 bg-slate-200 rounded-xl w-28" />
        <div className="h-8 bg-slate-200 rounded-xl w-32" />
      </div>
    </div>
  </div>
);

export const SlotGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-12 bg-slate-100 rounded-xl border border-slate-200/60" />
    ))}
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse border-b border-slate-100">
    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
    <td className="p-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
    <td className="p-4"><div className="h-4 bg-slate-100 rounded w-28" /></td>
    <td className="p-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
    <td className="p-4"><div className="h-6 bg-slate-200 rounded-full w-24" /></td>
    <td className="p-4"><div className="h-8 bg-slate-200 rounded-lg w-16" /></td>
  </tr>
);
