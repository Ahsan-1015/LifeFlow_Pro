import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Create Project", text: "Spin up a workspace with boards, priorities, and milestones in minutes." },
  { step: "02", title: "Invite Team Members", text: "Bring in product, design, and engineering with role-based access." },
  { step: "03", title: "Track Progress & Deliver", text: "Move work forward with visibility, deadlines, and live updates." },
];

const HowItWorks = () => (
  <section className="page-shell py-16 lg:py-24">
    <div className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300">How it works</p>
      <h2 className="section-title">Simple workflow. Powerful results.</h2>
    </div>

    <div className="relative mt-14 grid gap-6 lg:grid-cols-3">
      <div className="absolute left-1/2 top-8 hidden h-px w-[62%] -translate-x-1/2 bg-gradient-to-r from-blue-400 via-indigo-400 to-fuchsia-400 lg:block" />
      {steps.map((item, index) => (
        <motion.div
          key={item.step}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: index * 0.08 }}
          className="relative rounded-[2rem] bg-white/75 p-6 shadow-glass backdrop-blur-xl dark:bg-slate-900/70"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 font-display text-xl font-bold text-white shadow-lg shadow-indigo-500/25">
            {item.step}
          </div>
          <h3 className="font-display text-2xl font-bold">{item.title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.text}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default HowItWorks;
