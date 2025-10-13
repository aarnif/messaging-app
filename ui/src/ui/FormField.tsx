import type { InputField } from "../types";

const FormField = ({ field }: { field: InputField }) => {
  const { name, type, value, onChange, onReset } = field;
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
        className="inset-0 w-full px-2 font-normal peer focus:bg-opacity-0 text-slate-900 focus:outline-none dark:text-slate-100"
        type={type}
        value={value}
        onChange={onChange}
        onReset={onReset}
      />
      <p
        className={`absolute bg-slate-100 px-2 font-medium transition-all peer-focus:text-sm/4 hover:cursor-text ${
          !isEmpty
            ? "-translate-y-6.5 bg-white text-sm/4 font-normal text-purple-500 dark:bg-slate-800 dark:text-purple-400"
            : "text-slate-900 peer-focus:-translate-y-6.5 peer-focus:bg-white peer-focus:text-sm/4 peer-focus:font-normal peer-focus:text-purple-500 dark:bg-slate-900 dark:text-slate-100 peer-focus:dark:bg-slate-800 peer-focus:dark:text-purple-400"
        }`}
      >
        {labelText}
      </p>
    </label>
  );
};

export default FormField;
