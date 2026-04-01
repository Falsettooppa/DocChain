// Shared Tailwind class strings — import these in every component for consistency

export const tw = {
  input:
    "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",

  label:
    "block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5",

  btn:
    "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600",

  btnSecondary:
    "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 active:scale-[0.98] text-gray-200 text-sm font-medium border border-gray-700 transition-all disabled:opacity-50",

  btnDanger:
    "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600/80 hover:bg-red-600 active:scale-[0.98] text-white text-sm font-medium transition-all disabled:opacity-50",

  error:
    "flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs",

  success:
    "flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs",

  miniCard:
    "bg-gray-800/60 border border-gray-700/60 rounded-xl p-3.5 text-sm break-words",

  miniCardLabel:
    "text-[10px] font-medium text-gray-500 uppercase tracking-widest",

  miniCardValue:
    "text-gray-200 font-medium mt-0.5 truncate",

  linkBtn:
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium hover:bg-indigo-600/30 transition-colors",

  spinner: (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  ),
};
