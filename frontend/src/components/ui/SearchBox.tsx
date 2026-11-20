import { AiOutlineLoading } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import { FaRegCircle } from "react-icons/fa6";
import type { InputField } from "../../types";

const SearchBox = ({
  searchWord,
  isSearching = false,
}: {
  searchWord: InputField;
  isSearching?: boolean;
}) => {
  const { name, type, value, placeholder, onChange, onReset } = searchWord;

  return (
    <label
      htmlFor={name}
      className="flex w-full items-center rounded-full border-[1.5px] border-slate-100 bg-slate-100 p-2 transition-all focus-within:border-purple-500 hover:border-purple-500 dark:border-slate-700 dark:bg-slate-700 focus-within:dark:border-purple-400 hover:dark:border-purple-400"
    >
      {isSearching ? (
        <span className="relative flex h-4 w-4 items-center justify-center">
          <FaRegCircle className="absolute h-4 w-4 fill-current text-slate-300 dark:text-slate-500" />
          <AiOutlineLoading className="absolute h-4 w-4 fill-current text-slate-800 motion-safe:animate-spin dark:text-slate-300" />
        </span>
      ) : (
        <FaSearch className="h-4 w-4 fill-current text-slate-800 dark:text-slate-300" />
      )}
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
