import React from 'react';

const CreatorMetricCard = ({ label, value, change, icon }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl transition hover:-translate-y-1">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-white/70 font-semibold">{label}</p>
          <p className="text-3xl font-bold text-white mt-3">{value}</p>
        </div>
        <div className="text-purple-300 text-3xl">{icon}</div>
      </div>
      {change && (
        <div className="mt-4 text-sm text-emerald-300">{change} vs last week</div>
      )}
    </div>
  );
};

export default CreatorMetricCard;
