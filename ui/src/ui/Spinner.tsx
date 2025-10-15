import { FaRegCircle } from "react-icons/fa6";
import { AiOutlineLoading } from "react-icons/ai";

const Spinner = () => {
  return (
    <div className="relative flex items-center justify-center">
      <FaRegCircle className="absolute h-8 w-8 fill-current text-slate-300 dark:text-slate-600" />
      <AiOutlineLoading className="absolute h-8 w-8 animate-spin fill-current text-slate-500 dark:text-slate-400" />
    </div>
  );
};

export default Spinner;
