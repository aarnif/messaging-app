import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { IoChevronForward } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import useResponsiveWidth from "../../hooks/useResponsiveWidth";

const ModalLayout = ({
  title,
  children,
  onCancel,
  onConfirm,
  autoHeight = false,
}: {
  title: string;
  children: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  autoHeight?: boolean;
}) => {
  const width = useResponsiveWidth();
  const isMobileScreen = width <= 640;
  const heightClass = autoHeight ? "sm:h-auto" : "sm:h-full";

  return (
    <motion.div
      data-testid="modal-layout"
      className={`flex h-[90vh] grow flex-col items-center gap-4 rounded-t-lg rounded-b-none bg-white px-2 py-4 ${heightClass} sm:max-h-125 sm:max-w-125 sm:rounded-lg dark:bg-slate-800`}
      onClick={(e) => e.stopPropagation()}
      initial={{
        y: isMobileScreen ? "100vh" : -50,
        opacity: isMobileScreen ? 1 : 0,
      }}
      animate={{ y: 0, opacity: 1, transition: { type: "tween", delay: 0.4 } }}
      exit={{
        y: isMobileScreen ? "100vh" : -50,
        opacity: isMobileScreen ? 1 : 0,
      }}
      transition={{ type: "tween" }}
    >
      <div className="flex w-full justify-between">
        <button
          data-testid="close-button"
          className="cursor-pointer"
          onClick={onCancel}
        >
          <MdClose className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
        <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
          {title}
        </h2>
        <button
          data-testid={"confirm-button"}
          className="cursor-pointer"
          onClick={onConfirm}
        >
          <IoChevronForward className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
      </div>
      {children}
    </motion.div>
  );
};

export default ModalLayout;
