import React from 'react';

const CreatorWorkCard = ({ title, subtitle, reads, status, tag }) => {
  return (
    <article className="group rounded-3xl border border-white/10 bg-white/10 p-5 shadow-[0_20px_45px_rgba(0,0,0,0.08)] backdrop-blur-xl transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center rounded-full bg-purple-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-purple-100 font-semibold">
            {tag}
          </span>
          <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-white/70 leading-6">{subtitle}</p>
        </div>
        <div className="rounded-3xl bg-white/10 px-4 py-2 text-sm text-white/80">{status}</div>
      </div>
      <div className="mt-5 text-xs text-white/60">{reads} reads • Updated recently</div>
    </article>
  );
};

export default CreatorWorkCard;
