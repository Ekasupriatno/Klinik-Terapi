import React from 'react';

export const DoctorCardSkeleton = () => (
  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm animate-pulse space-y-5">
    <div className="flex items-start gap-4 sm:gap-5">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-5 bg-slate-200 rounded-md w-1/2" />
        <div className="h-4 bg-slate-100 rounded-md w-1/3" />
        <div className="h-4 bg-slate-100 rounded-md w-2/3" />
        <div className="h-4 bg-slate-100 rounded-md w-1/4" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2.5 pt-2">
      <div className="h-14 bg-slate-100 rounded-2xl w-full" />
      <div className="h-14 bg-slate-100 rounded-2xl w-full" />
      <div className="h-14 bg-slate-100 rounded-2xl w-full" />
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
