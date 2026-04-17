import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaChartPie, FaCommentDots, FaColumns } from "react-icons/fa";

const screenshots = [
  { icon: FaChartPie, title: "Dashboard Stats", text: "Executive-level metrics with progress trends and deadline awareness." },
  { icon: FaColumns, title: "Project Board", text: "A drag-and-drop workflow board that keeps delivery visible." },
  { icon: FaCalendarAlt, title: "Calendar Deadlines", text: "Timeline planning for launch windows, reviews, and due dates." },
  { icon: FaCommentDots, title: "Team Chat & Comments", text: "Contextual conversation on tasks without leaving the workflow." },
];

const Screenshots = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 650);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section id="screenshots" className="page-shell py-16 lg:py-24">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300">Screenshots</p>
        <h2 className="section-title">See TaskFlow in action</h2>
      </div>

      <div className="mt-12 hidden grid-cols-12 gap-5 lg:grid">
        {screenshots.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ delay: index * 0.08 }}
            className={`glass-panel col-span-6 overflow-hidden rounded-[2rem] p-5 ${index === 0 ? "xl:col-span-7" : ""} ${index === 1 ? "xl:col-span-5" : ""}`}
          >
            <div className="rounded-[1.75rem] bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg">
                  <item.icon />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold">{item.title}</h3>
                  <p className="text-sm text-white/60">{item.text}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, mockIndex) => (
                  <div key={mockIndex} className="rounded-2xl bg-white/6 p-4">
                    {ready ? (
                      <>
                        <div className="h-2.5 w-20 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500" />
                        <div className="mt-4 h-4 w-full rounded-full bg-white/10" />
                        <div className="mt-2 h-4 w-4/5 rounded-full bg-white/10" />
                        <div className="mt-6 flex gap-2">
                          <div className="h-8 flex-1 rounded-xl bg-white/10" />
                          <div className="h-8 w-10 rounded-xl bg-white/10" />
                        </div>
                      </>
                    ) : (
                      <div className="animate-pulse">
                        <div className="h-4 w-16 rounded-full bg-white/10" />
                        <div className="mt-4 h-16 rounded-2xl bg-white/10" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex gap-4 overflow-x-auto pb-2 lg:hidden">
        {screenshots.map((item) => (
          <div key={item.title} className="glass-panel min-w-[290px] rounded-[2rem] p-5">
            <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
              <item.icon className="text-2xl text-indigo-300" />
              <h3 className="mt-4 font-display text-2xl font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-white/65">{item.text}</p>
              <div className="mt-5 rounded-2xl bg-white/8 p-4">
                <div className="h-3 w-24 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500" />
                <div className="mt-4 h-24 rounded-2xl bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Screenshots;
