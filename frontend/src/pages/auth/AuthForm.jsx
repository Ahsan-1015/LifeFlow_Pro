import { motion } from "framer-motion";

const AuthForm = ({ title, subtitle, fields, values, onChange, onSubmit, loading, footer, error, socialSlot }) => (
  <div className="page-shell flex min-h-screen items-center justify-center">
    <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl lg:p-12"
      >
        <p className="text-sm uppercase tracking-[0.35em] text-brand-300">FlowPilot</p>
        <h1 className="mt-6 font-display text-5xl font-bold leading-tight">
          Premium project collaboration that feels alive.
        </h1>
        <p className="mt-6 max-w-xl text-base text-white/70">
          Manage projects, move work with live board updates, track deadlines, and keep your team aligned with one polished workspace.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            "Live task movement",
            "Role-based project access",
            "Comment threads & alerts",
            "Elegant dark mode",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium">
              {item}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onSubmit={onSubmit}
        noValidate
        className="glass-panel rounded-[2rem] p-8 lg:p-10"
      >
        <h2 className="font-display text-3xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>

        <div className="mt-8 space-y-5">
          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : null}
          {fields.map((field) => (
            <div key={field.name}>
              <label className="label-text">{field.label}</label>
              <input
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={onChange}
                autoComplete={
                  field.name === "email"
                    ? "email"
                    : field.name === "password"
                      ? "current-password"
                      : field.name === "name"
                        ? "name"
                        : "off"
                }
                className="input-field"
                required
              />
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className="gradient-button mt-8 w-full">
          {loading ? "Please wait..." : title}
        </button>
        {socialSlot ? (
          <>
            <div className="my-5 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>
            {socialSlot}
          </>
        ) : null}
        <div className="mt-5 text-sm text-slate-600 dark:text-slate-300">{footer}</div>
      </motion.form>
    </div>
  </div>
);

export default AuthForm;
