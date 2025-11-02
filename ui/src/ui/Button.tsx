const Button = ({
  type,
  variant,
  text,
  disabled = false,
  onClick,
}: {
  type: "submit" | "reset" | "button" | undefined;
  variant: "primary" | "secondary" | "tertiary" | "cancel" | "alert" | "danger";
  text: string;
  disabled?: boolean;
  onClick?:
    | ((event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>)
    | (() => void | Promise<void>);
}) => {
  const baseStyles = `w-full px-6 py-3 text-base font-bold border-2 rounded-2xl shadow-[0px_2px] transition focus:outline-none ${disabled ? "cursor-default" : "cursor-pointer active:shadow-[0px_0px] active:translate-y-[2px]"}`;

  const variantStyles = {
    primary:
      "text-white shadow-green-900 bg-green-600 dark:bg-green-500 border-green-600 dark:border-green-500 \
      hover:bg-green-700 dark:hover:bg-green-600 hover:border-green-700 dark:hover:border-green-600 focus:bg-green-700 focus:dark:bg-green-600 focus:border-green-700 focus:dark:border-green-600",
    secondary:
      "text-green-600 shadow-green-900 dark:text-green-500 border-green-600 dark:border-green-500 \
      hover:text-green-700 dark:hover:text-green-600 hover:border-green-700 dark:hover:border-green-600 focus:border-green-700 focus:dark:border-green-600",
    tertiary:
      "border-1 text-sm text-slate-900 border-slate-900 dark:border-slate-50 \
      dark:text-slate-50 shadow-slate-600 hover:text-green-600 hover:border-green-600 dark:hover:text-green-500 dark:hover:border-green-500",
    cancel:
      "border-none text-sm shadow-none text-slate-700 hover:text-slate-900 active:!shadow-none active:!translate-y-0",
    alert:
      "border-1 text-sm shadow-yellow-900 text-yellow-700 border-yellow-700 dark:border-yellow-600 \
      dark:text-yellow-800 hover:text-yellow-800 hover:border-yellow-800 dark:hover:text-yellow-800 dark:hover:border-yellow-800",
    danger:
      "border-1 text-sm shadow-red-900 text-red-600 border-red-600 dark:border-red-500 \
      dark:text-red-500 hover:text-red-700 hover:border-red-700 dark:hover:text-red-600 dark:hover:border-red-600",
    disabled:
      "border-1 text-sm text-slate-500 border-slate-500 dark:border-slate-400 \
      dark:text-slate-400 shadow-slate-600",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[disabled ? "disabled" : variant]}`}
    >
      {text}
    </button>
  );
};

export default Button;
