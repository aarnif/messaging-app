const Button = ({
  testId,
  type,
  variant,
  text,
  disabled = false,
  onClick,
}: {
  testId?: string;
  type: "submit" | "reset" | "button" | undefined;
  variant:
    | "primary"
    | "secondary"
    | "tertiary"
    | "cancel"
    | "alert"
    | "delete"
    | "danger"
    | "success";
  text: string;
  disabled?: boolean;
  onClick?:
    | ((event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>)
    | (() => void | Promise<void>);
}) => {
  const baseStyles = `max-w-124 w-full px-6 py-3.5 text-base font-bold rounded-lg shadow-[0px_2px] transition focus:outline-none
    ${disabled ? "cursor-not-allowed" : "cursor-pointer active:shadow-[0px_0px] active:translate-y-[2px]"}`;

  const variantStyles = {
    primary:
      "border-2 text-white shadow-green-900 bg-green-600 dark:bg-green-500 border-green-600 dark:border-green-500 \
      hover:bg-green-700 dark:hover:bg-green-600 hover:border-green-700 dark:hover:border-green-600 focus:bg-green-700 \
      focus: dark: bg- green - 600 focus: border-green - 700 focus: dark: border - green - 600",
    secondary:
      "border-2 text-green-600 shadow-green-900 dark:text-green-500 border-green-600 dark:border-green-500 \
      hover:text-green-700 dark:hover:text-green-600 hover:border-green-700 dark:hover:border-green-600 \
      focus: border - green - 700 focus: dark: border- green - 600",
    tertiary:
      "bg-slate-300 dark:bg-slate-900 text-sm shadow-slate-400 dark:shadow-slate-950 text-slate-800 \
      dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-300",
    cancel: "text-sm shadow-none text-slate-700 hover:text-slate-900",
    alert:
      "bg-yellow-200 text-sm shadow-yellow-300 text-yellow-800 hover:text-yellow-900",
    delete:
      "bg-slate-300 dark:bg-slate-900 text-sm shadow-slate-400 dark:shadow-slate-950 text-red-600 \
      dark:text-red-500 hover:text-red-700 dark:hover:text-red-600",
    danger: "bg-red-200 text-sm shadow-red-300 text-red-800 hover:text-red-900",
    success:
      "bg-green-200 text-sm shadow-green-300 text-green-800 hover:text-green-900",
    disabled:
      "bg-slate-200 dark:bg-slate-900 text-sm text-slate-300 dark:text-slate-500 shadow-slate-300 dark:shadow-slate-950",
  };

  return (
    <button
      data-testid={testId}
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
