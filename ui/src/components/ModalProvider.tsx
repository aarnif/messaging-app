import type { ReactNode } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ModalContext from "../contexts/ModalContext";

const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const modal = () => {
    setIsOpen(true);
  };

  return (
    <ModalContext.Provider value={modal}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-testid="overlay"
            key={"Overlay"}
            className="fixed inset-0 flex items-center justify-center bg-black/50"
            onClick={() => setIsOpen(false)}
            initial={{ x: "100vw", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100vw", opacity: 0, transition: { delay: 0.4 } }}
            transition={{ type: "tween" }}
          >
            <motion.div
              data-testid="notification-modal"
              className="flex flex-col items-center gap-4 rounded-xl bg-white px-2 py-4 dark:bg-slate-800"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.4 } }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.4, type: "tween" }}
            ></motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

export default ModalProvider;
