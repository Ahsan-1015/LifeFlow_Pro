import { motion } from "framer-motion";

const brands = ["Google", "Slack", "Meta", "Notion", "Spotify", "Startup Teams"];

const Trusted = () => (
  <section className="page-shell py-6 lg:py-10">
    <div className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        Trusted by growing teams worldwide
      </p>
    </div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {brands.map((brand, index) => (
        <motion.div
          key={brand}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: index * 0.06 }}
          className="soft-ring rounded-3xl bg-white/70 px-5 py-5 text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-400 transition hover:-translate-y-1 hover:text-slate-900 dark:bg-slate-900/70 dark:text-slate-500 dark:hover:text-white"
        >
          {brand}
        </motion.div>
      ))}
    </div>
  </section>
);

export default Trusted;
