import { AnimatePresence, motion } from "framer-motion";

const ModalShell = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          onClick={(event) => event.stopPropagation()}
          className="glass-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold">{title}</h3>
            <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-500">
              Close
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

export default ModalShell;
