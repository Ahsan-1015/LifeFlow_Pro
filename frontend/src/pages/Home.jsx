import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import CTA from "../components/CTA";
import Features from "../components/Features";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Navbar from "../components/Navbar";
import Screenshots from "../components/Screenshots";
import Testimonials from "../components/Testimonials";
import Trusted from "../components/Trusted";

const Home = () => {
  const [booting, setBooting] = useState(true);
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute("content") || "";

    document.title = "TaskFlow Pro | Modern Project Management Tool";
    if (meta) {
      meta.setAttribute(
        "content",
        "Manage projects faster with boards, tasks, collaboration, deadlines and real-time updates."
      );
    }

    const timer = window.setTimeout(() => setBooting(false), 650);
    const onScroll = () => setShowTopButton(window.scrollY > 520);

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.title = previousTitle;
      if (meta) meta.setAttribute("content", previousDescription);
    };
  }, []);

  return (
    <div className="landing-shell min-h-screen">
      {booting ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-white">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 text-3xl font-black shadow-2xl shadow-indigo-500/30">
              T
            </div>
            <p className="mt-5 font-display text-2xl font-bold">TaskFlow Pro</p>
            <div className="mx-auto mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-20 rounded-full bg-gradient-to-r from-blue-400 to-fuchsia-400"
              />
            </div>
          </motion.div>
        </div>
      ) : null}

      <Navbar />
      <main>
        <Hero />
        <Trusted />
        <Features />
        <HowItWorks />
        <Screenshots />
        <Testimonials />
        <CTA />
      </main>
      <Footer />

      {showTopButton ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-500 text-white shadow-2xl shadow-indigo-500/25 transition hover:-translate-y-1"
          aria-label="Scroll to top"
        >
          <FaArrowUp />
        </button>
      ) : null}
    </div>
  );
};

export default Home;
