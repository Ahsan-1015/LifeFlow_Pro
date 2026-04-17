import { FcGoogle } from "react-icons/fc";

const GoogleAuthButton = ({ onClick, loading, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 font-semibold text-slate-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
  >
    <FcGoogle size={22} />
    {loading ? "Please wait..." : label}
  </button>
);

export default GoogleAuthButton;
