import type { ModalOptions } from "../types";
import type { ReactNode } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaExclamation } from "react-icons/fa6";
import ModalContext from "../contexts/ModalContext";
import Button from "../ui/Button";

const ModalContent = ({
  options,
  handleCloseModal,
}: {
  options: ModalOptions;
  handleCloseModal: () => void;
}) => {
  const { type, title, message, close, confirm, callback } = options;

  const handleConfirm = async () => {
    if (callback) {
      callback();
    }
    handleCloseModal();
  };

  const getVariantStyles = (type: ModalOptions["type"]) => {
    switch (type) {
      case "alert":
        return {
          background: "bg-yellow-50",
          outerCircle: "bg-yellow-300",
          innerCircle: "bg-yellow-100 border-yellow-400",
          icon: "text-yellow-900",
          title: "text-yellow-900",
          message: "text-yellow-700",
        };
      case "danger":
        return {
          background: "bg-red-50",
          outerCircle: "bg-red-300",
          innerCircle: "bg-red-100 border-red-400",
          icon: "text-red-900",
          title: "text-red-900",
          message: "text-red-700",
        };
      case "success":
      default:
        return {
          background: "bg-green-50",
          outerCircle: "bg-green-300",
          innerCircle: "bg-green-100 border-green-400",
          icon: "text-green-900",
          title: "text-green-900",
          message: "text-green-700",
        };
    }
  };

  const hasConfirmOption = confirm && callback;

  const styles = getVariantStyles(type);
  return (
    <motion.div
      data-testid="notification-modal"
      className={`m-4 flex w-full flex-col items-center gap-4 rounded-xl p-4 sm:max-w-100 ${styles.background}`}
      onClick={(e) => e.stopPropagation()}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.4 } }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ duration: 0.4, type: "tween" }}
    >
      <div data-testid={`${type}-modal`} className="flex w-full flex-col gap-6">
        <div className="flex items-center justify-start gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${styles.outerCircle}`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${styles.innerCircle}`}
            >
              <FaExclamation
                className={`h-[1.1rem] w-[1.1rem] fill-current ${styles.icon}`}
              />
            </div>
          </div>
          <h2 className={`font-oswald text-xl font-semibold ${styles.title}`}>
            {title}
          </h2>
        </div>
        <p className={`w-full text-base whitespace-pre-line ${styles.message}`}>
          {message}
        </p>
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant={hasConfirmOption ? "cancel" : type}
            text={close}
            onClick={handleCloseModal}
          />
          {hasConfirmOption && (
            <Button
              type="button"
              variant={type}
              text={confirm}
              onClick={handleConfirm}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ModalOptions>({
    type: "alert",
    title: "Alert",
    message: "Message",
    close: "cancel",
    confirm: "confirm",
    callback: () => {},
  });
  const [isOpen, setIsOpen] = useState(false);

  const modal = (options: ModalOptions) => {
    setOptions(options);
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
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
            onClick={handleCloseModal}
            initial={{ x: "100vw", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100vw", opacity: 0, transition: { delay: 0.4 } }}
            transition={{ type: "tween" }}
          >
            <ModalContent
              options={options}
              handleCloseModal={handleCloseModal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

export default ModalProvider;
