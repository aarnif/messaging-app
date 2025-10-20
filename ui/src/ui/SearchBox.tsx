import { FaSearch } from "react-icons/fa";
import type { InputField } from "../types";

const SearchBox = ({ searchWord }: { searchWord: InputField }) => {
  const { name, type, value, placeholder, onChange, onReset } = searchWord;

  return (
    <label
      htmlFor={name}
      className="flex w-full items-center rounded-full border-[1.5px] border-slate-100 bg-slate-100 p-2 transition-all focus-within:border-purple-500 hover:border-purple-500 dark:border-slate-700 dark:bg-slate-700 focus-within:dark:border-purple-400 hover:dark:border-purple-400"
    >
      <FaSearch className="h-4 w-4 fill-current text-slate-800 dark:text-slate-300" />
      <input
        id={name}
        name={name}
        className="peer focus:bg-opacity-0 inset-0 w-full px-3 text-sm font-normal text-slate-900 placeholder:text-sm placeholder:text-slate-800 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-300"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onReset={onReset}
      />
    </label>
  );
};
export default SearchBox;
