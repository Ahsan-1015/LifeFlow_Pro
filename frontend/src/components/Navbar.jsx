import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { RiMoonClearLine, RiSunLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#reviews", label: "Reviews" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <>
      <motion.header
        initial={{ y: -36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-white/20 bg-white/65 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55"
      >
        <div className="page-shell flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/25">
              <span className="text-lg font-black">T</span>
            </div>
            <div>
              <p className="font-display text-lg font-bold">TaskFlow Pro</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Project Ops, Simplified</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative text-sm font-semibold text-slate-600 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              >
                {link.label}
                <span className="absolute -bottom-2 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-fuchsia-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-700 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <RiSunLine size={20} /> : <RiMoonClearLine size={20} />}
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white dark:text-slate-100 dark:hover:bg-slate-900/80">
                  Dashboard
                </Link>
                <Link to="/projects" className="gradient-button">
                  Open Workspace
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white dark:text-slate-100 dark:hover:bg-slate-900/80">
                  Login
                </Link>
                <Link to="/register" className="gradient-button">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 dark:border-slate-700 dark:bg-slate-900/80"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <RiSunLine size={19} /> : <RiMoonClearLine size={19} />}
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 dark:border-slate-700 dark:bg-slate-900/80"
              aria-label="Open menu"
            >
              <HiOutlineMenuAlt3 size={22} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-950/50 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
              className="ml-auto flex h-full w-full max-w-xs flex-col bg-white p-6 dark:bg-slate-950"
            >
              <div className="mb-8 flex items-center justify-between">
                <p className="font-display text-xl font-bold">TaskFlow Pro</p>
                <button type="button" onClick={() => setOpen(false)} className="rounded-2xl p-2">
                  <HiOutlineX size={22} />
                </button>
              </div>
              <div className="space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl bg-slate-100 px-4 py-3 font-semibold dark:bg-slate-900"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-auto space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="block rounded-2xl border border-slate-200 px-4 py-3 text-center font-semibold dark:border-slate-700">
                      Dashboard
                    </Link>
                    <Link to="/projects" onClick={() => setOpen(false)} className="gradient-button flex w-full">
                      Open Workspace
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="block rounded-2xl border border-slate-200 px-4 py-3 text-center font-semibold dark:border-slate-700">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="gradient-button flex w-full">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
