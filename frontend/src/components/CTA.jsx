import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CTA = () => (
  <section id="pricing" className="page-shell py-16 lg:py-24">
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      className="overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-600 px-6 py-12 text-white shadow-2xl shadow-indigo-500/25 sm:px-10 lg:px-14"
    >
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Ready to Organize Your Team?</p>
        <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Start free today and manage projects smarter.</h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-white/80">
          Replace scattered tasks, missed deadlines, and context switching with one high-trust workspace your team actually enjoys using.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link to="/register" className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:-translate-y-0.5">
            Get Started Free
          </Link>
          <a href="#home" className="inline-flex items-center justify-center rounded-2xl border border-white/25 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
            Book Demo
          </a>
        </div>
      </div>
    </motion.div>
  </section>
);

export default CTA;
