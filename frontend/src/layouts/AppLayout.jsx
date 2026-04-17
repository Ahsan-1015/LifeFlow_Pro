import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

const AppLayout = ({ title, description, action }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="page-shell">
      <div className="grid min-h-[calc(100vh-3rem)] gap-6 lg:h-[calc(100vh-3rem)] lg:grid-cols-[280px_1fr] lg:items-start lg:overflow-hidden">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <AnimatePresence>
          {sidebarOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/50 p-4 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <motion.div
                initial={{ x: -40 }}
                animate={{ x: 0 }}
                exit={{ x: -40 }}
                className="h-full max-w-xs overflow-hidden"
                onClick={(event) => event.stopPropagation()}
              >
                <Sidebar onNavigate={() => setSidebarOpen(false)} />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main className="premium-scroll min-w-0 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2">
          <Topbar
            title={title}
            description={description}
            action={action}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
