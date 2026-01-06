import type { InputField } from "../types";

const FormField = ({
  field,
  inputBgColor,
}: {
  field: InputField;
  inputBgColor?: string;
}) => {
  const { name, type, value, placeholder, onChange, onReset } = field;
  const isEmpty = value.length === 0;
  const labelText = name[0].toUpperCase() + name.slice(1);

  const defaultColors =
    "bg-slate-100 border-slate-100 dark:bg-slate-900 dark:border-slate-900";
  const colors = inputBgColor || defaultColors;

  return (
    <label htmlFor={name} className="relative">
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onReset={onReset}
        className={`peer w-full rounded-lg border-2 ${colors} px-4 pt-6 pb-2 font-medium text-slate-900 transition-all duration-200 placeholder:text-sm placeholder:text-slate-600 placeholder:opacity-0 dark:text-slate-50 dark:placeholder:text-slate-400 ${isEmpty ? "focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none focus:placeholder:opacity-100 dark:focus:border-purple-400 dark:focus:ring-purple-400/20" : "border-purple-500 ring-2 ring-purple-500/20 outline-none placeholder:opacity-100 dark:border-purple-400 dark:ring-purple-400/20"}`}
      />
      <p
        className={`pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-medium transition-all duration-200 ${isEmpty ? "text-slate-600 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-sm peer-focus:text-purple-500 dark:text-slate-400 dark:peer-focus:text-purple-400" : "top-2 translate-y-0 text-sm text-purple-500 dark:text-purple-400"}`}
      >
        {labelText}
      </p>
    </label>
  );
};

export default FormField;
