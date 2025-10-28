import { useNavigate } from "react-router";
import { IoChevronBack } from "react-icons/io5";

const Appearance = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-grow flex-col items-center bg-white px-2 py-4 sm:gap-8 dark:bg-slate-800">
      <div className="flex w-full items-center justify-center">
        <button
          data-testid="go-back-button"
          className="absolute left-2 cursor-pointer sm:hidden"
          onClick={() => navigate("/settings")}
        >
          <IoChevronBack className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 sm:h-7 sm:w-7 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
        <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
          Appearance
        </h2>
      </div>
    </div>
  );
};

export default Appearance;
