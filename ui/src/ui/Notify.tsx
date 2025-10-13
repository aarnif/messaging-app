import { BsExclamationCircleFill } from "react-icons/bs";
import { motion } from "motion/react";

const Notify = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 30 }}
    transition={{ duration: 0.3 }}
    className="flex items-center justify-between w-full px-4 py-2 border-2 border-red-600 text-md rounded-xl bg-slate-100 dark:border-red-400 dark:bg-slate-900"
  >
    <p className="font-semibold text-red-600 dark:text-red-400">{message}</p>
    <BsExclamationCircleFill className="w-6 h-6 text-red-600 dark:text-red-400" />
  </motion.div>
);

export default Notify;
