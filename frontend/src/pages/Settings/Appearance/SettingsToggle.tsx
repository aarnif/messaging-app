import { FaCheck } from "react-icons/fa6";
import { MdClose } from "react-icons/md";

const SettingsToggle = ({
  label,
  buttonTestId,
  isActive,
  onClick,
}: {
  label: string;
  buttonTestId: string;
  isActive: boolean;
  onClick: () => void;
  activeColor?: string;
  inactiveColor?: string;
}) => {
  return (
    <div className="flex w-full items-center justify-between rounded-lg bg-slate-200 px-4 py-2 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {label}
      </p>

      <button
        onClick={onClick}
        data-testid={buttonTestId}
        className="cursor-pointer"
      >
        <div
          className={`flex h-8 w-16 rounded-full ${isActive ? "bg-green-500" : "bg-slate-400"}`}
        >
          <div
            className={`m-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 transition-all ${isActive ? "translate-x-8" : "translate-x-0"}`}
          >
            {isActive ? (
              <FaCheck
                className="h-3.5 w-3.5 fill-current text-slate-700"
                data-testid="check-mark"
              />
            ) : (
              <MdClose
                className="h-3.5 w-3.5 fill-current text-slate-700"
                data-testid="close-mark"
              />
            )}
          </div>
        </div>
      </button>
    </div>
  );
};

export default SettingsToggle;
