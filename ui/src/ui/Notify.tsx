import { MdClose } from "react-icons/md";
import { motion } from "motion/react";

const Notify = ({
  message,
  closeMessage,
}: {
  message: string;
  closeMessage: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 30 }}
    transition={{ duration: 0.3 }}
    className="text-md flex w-full items-center justify-between rounded-lg border-2 border-red-600 bg-red-100 px-4 py-2 dark:border-red-400 dark:bg-red-950"
  >
    <p className="font-semibold text-red-600 dark:text-red-400">{message}</p>
    <button
      data-testid="close-notify-message"
      type="button"
      onClick={closeMessage}
      className="cursor-pointer"
    >
      <MdClose className="h-5 w-5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600" />
    </button>
  </motion.div>
);

export default Notify;
