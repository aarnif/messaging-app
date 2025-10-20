const Button = ({
  type,
  variant,
  text,
  disabled = false,
  onClick,
}: {
  type: "submit" | "reset" | "button" | undefined;
  variant: "primary" | "secondary" | "tertiary";
  text: string;
  disabled?: boolean;
  onClick?:
    | ((event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>)
    | (() => void | Promise<void>);
}) => {
  const baseStyles =
    "w-full px-6 py-3 text-base font-bold border-2 rounded-2xl shadow-[0px_2px] active:shadow-[0px_0px] active:translate-y-[2px] transition cursor-pointer focus:outline-none";

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
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {text}
    </button>
  );
};

export default Button;
