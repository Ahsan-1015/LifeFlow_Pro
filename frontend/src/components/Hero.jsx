import { motion } from "framer-motion";
import { FaArrowRight, FaPlay, FaRegChartBar, FaRegClock, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";

const metrics = [
  { label: "Delivery Speed", value: "+34%" },
  { label: "Team Alignment", value: "98%" },
  { label: "Active Boards", value: "124" },
];

const Hero = () => (
  <section id="home" className="hero-grid relative">
    <div className="page-shell grid items-center gap-14 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
      <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <div className="soft-ring inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-indigo-700 dark:bg-slate-900/80 dark:text-indigo-200">
          <span className="rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 px-2 py-0.5 text-xs text-white">#1</span>
          Smart Project Management Tool
        </div>
        <h1 className="mt-7 max-w-3xl font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          Manage Projects Faster <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">With Your Team</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          Modern task boards, live updates, deadlines, team collaboration, and productivity insights in one platform.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link to="/register" className="gradient-button group text-base">
            Start Free
            <FaArrowRight className="ml-2 transition group-hover:translate-x-1" />
          </Link>
          <a href="#screenshots" className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 font-semibold text-slate-700 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100">
            <FaPlay className="mr-2 text-sm" />
            Watch Demo
          </a>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">No credit card required</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {metrics.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
              className="glass-panel rounded-[2rem] p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-3 font-display text-3xl font-bold">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 26 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="glass-panel relative mx-auto max-w-2xl rounded-[2rem] p-4 shadow-2xl shadow-indigo-500/15"
        >
          <div className="rounded-[1.75rem] bg-slate-950 p-4 text-white">
            <div className="grid gap-4 lg:grid-cols-[82px_1fr]">
              <aside className="rounded-[1.5rem] bg-white/5 p-3">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-fuchsia-500 font-black">T</div>
                <div className="space-y-3">
                  {["Overview", "Projects", "Calendar", "Team"].map((item) => (
                    <div key={item} className={`rounded-xl px-3 py-2 text-xs ${item === "Projects" ? "bg-white/12" : "text-white/65"}`}>
                      {item}
                    </div>
                  ))}
                </div>
              </aside>

              <div className="space-y-4 rounded-[1.5rem] bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Monday overview</p>
                    <h3 className="mt-1 font-display text-2xl font-bold">Campaign Launch Sprint</h3>
                  </div>
                  <div className="rounded-2xl bg-emerald-400/15 px-4 py-2 text-sm font-semibold text-emerald-300">On Track</div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.5rem] bg-white/6 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Weekly Progress</p>
                      <FaRegChartBar className="text-blue-300" />
                    </div>
                    <div className="mt-5 flex h-32 items-end gap-3">
                      {[42, 70, 56, 88, 74, 96, 84].map((height, index) => (
                        <div key={height + index} className="flex-1 rounded-t-2xl bg-gradient-to-t from-blue-500 via-indigo-500 to-fuchsia-500" style={{ height: `${height}%` }} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] bg-white/6 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                          <FaUsers />
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Team Sync</p>
                          <p className="font-semibold">8 members active</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] bg-white/6 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300">
                          <FaRegClock />
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Next deadline</p>
                          <p className="font-semibold">Homepage QA in 2 days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { title: "Wireframe Review", status: "Review", accent: "from-amber-400 to-orange-500" },
                    { title: "API Integration", status: "In Progress", accent: "from-blue-500 to-indigo-500" },
                    { title: "Launch Checklist", status: "Done", accent: "from-emerald-400 to-teal-500" },
                  ].map((task) => (
                    <div key={task.title} className="rounded-[1.5rem] bg-white/7 p-4 transition hover:-translate-y-1">
                      <div className={`mb-3 h-1.5 rounded-full bg-gradient-to-r ${task.accent}`} />
                      <p className="font-semibold">{task.title}</p>
                      <p className="mt-2 text-sm text-white/60">{task.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="absolute -left-6 top-10 hidden rounded-[1.75rem] border border-white/40 bg-white/70 p-4 shadow-xl backdrop-blur lg:block dark:border-white/10 dark:bg-slate-900/70">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Team Energy</p>
          <p className="mt-2 font-display text-3xl font-bold">94%</p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default Hero;
