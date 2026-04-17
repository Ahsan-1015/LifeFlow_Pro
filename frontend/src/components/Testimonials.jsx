import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

const reviews = [
  { name: "Sarah", role: "Product Manager", quote: "TaskFlow helped our team organize everything in one place." },
  { name: "David", role: "Startup Founder", quote: "Beautiful UI and super easy collaboration." },
  { name: "Emma", role: "Designer", quote: "The best lightweight project tool we used." },
];

const Testimonials = () => (
  <section id="reviews" className="page-shell py-16 lg:py-24">
    <div className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300">Testimonials</p>
      <h2 className="section-title">Loved by modern teams</h2>
    </div>

    <div className="mt-12 grid gap-5 lg:grid-cols-3">
      {reviews.map((review, index) => (
        <motion.article
          key={review.name}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ delay: index * 0.08 }}
          className="glass-panel rounded-[2rem] p-6 transition hover:-translate-y-2"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 font-display text-xl font-bold text-white">
              {review.name[0]}
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold">{review.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{review.role}</p>
            </div>
          </div>
          <div className="mt-5 flex gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <FaStar key={starIndex} />
            ))}
          </div>
          <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">"{review.quote}"</p>
        </motion.article>
      ))}
    </div>
  </section>
);

export default Testimonials;
