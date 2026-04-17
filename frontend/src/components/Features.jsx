import { motion } from "framer-motion";
import { FaBell, FaComments, FaGripVertical, FaMoon, FaRegClock, FaUsers } from "react-icons/fa";

const features = [
  { icon: FaGripVertical, title: "Kanban Boards", text: "Drag and drop tasks visually with instant progress context." },
  { icon: FaUsers, title: "Real-time Collaboration", text: "Keep everyone aligned with live presence and synced updates." },
  { icon: FaComments, title: "Task Comments", text: "Discuss blockers, reviews, and feedback inside every task." },
  { icon: FaRegClock, title: "Deadline Tracking", text: "Never miss key dates with upcoming and overdue highlights." },
  { icon: FaBell, title: "Smart Notifications", text: "Surface what matters without drowning teams in noise." },
  { icon: FaMoon, title: "Dark Mode", text: "A polished dark workspace built for long focused sessions." },
];

const Features = () => (
  <section id="features" className="page-shell py-16 lg:py-24">
    <div className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300">Everything your team needs</p>
      <h2 className="section-title">Manage projects from idea to delivery.</h2>
      <p className="section-subtitle">Every workflow essential in one calm, elegant workspace built for fast-moving product teams.</p>
    </div>

    <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {features.map((feature, index) => (
        <motion.article
          key={feature.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ delay: index * 0.06 }}
          className="group relative overflow-hidden rounded-[2rem] border border-white/30 bg-white/75 p-6 shadow-glass backdrop-blur-xl transition duration-300 hover:-translate-y-2 dark:border-white/10 dark:bg-slate-900/70"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-indigo-500/0 to-fuchsia-500/0 opacity-0 transition duration-300 group-hover:opacity-100" />
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 transition group-hover:opacity-100" />
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 via-indigo-500/15 to-fuchsia-500/15 text-2xl text-indigo-600 dark:text-indigo-300">
              <feature.icon />
            </div>
            <h3 className="mt-6 font-display text-2xl font-bold">{feature.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{feature.text}</p>
          </div>
        </motion.article>
      ))}
    </div>
  </section>
);

export default Features;
