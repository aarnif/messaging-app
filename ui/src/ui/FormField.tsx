import type { InputField } from "../types";

const FormField = ({ field }: { field: InputField }) => {
  const { name, type, value, placeholder, onChange, onReset } = field;
  const isEmpty = value.length === 0;
  const labelText = name[0].toUpperCase() + name.slice(1);
  return (
    <label
      htmlFor={name}
      className={`relative flex w-full items-center rounded-xl border-[1.5px] bg-slate-100 p-2 transition-all hover:border-purple-500 dark:bg-slate-900 hover:dark:border-purple-400 ${
        !isEmpty
          ? "border-purple-500 dark:border-purple-400"
          : "border-slate-100 focus-within:border-purple-500 dark:border-slate-900 focus-within:dark:border-purple-400"
      }`}
    >
      <input
        id={name}
        name={name}
        className="peer focus:bg-opacity-0 inset-0 w-full px-2 text-sm font-normal text-slate-900 placeholder:text-sm placeholder:text-slate-700 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-300"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onReset={onReset}
      />
      <p
        className={`absolute right-0 left-3 bg-slate-100 px-1 text-sm font-medium transition-all peer-focus:right-auto peer-focus:text-xs/3 hover:cursor-text ${
          !isEmpty
            ? "right-auto -translate-y-6.5 bg-white text-xs/3 font-normal text-purple-500 dark:bg-slate-800 dark:text-purple-400"
            : "text-slate-900 peer-focus:-translate-y-6.5 peer-focus:bg-white peer-focus:text-xs/3 peer-focus:font-normal peer-focus:text-purple-500 dark:bg-slate-900 dark:text-slate-100 peer-focus:dark:bg-slate-800 peer-focus:dark:text-purple-400"
        }`}
      >
        {labelText}
      </p>
    </label>
  );
};

export default FormField;
