import useField from "../hooks/useField";
import { FaSearch } from "react-icons/fa";
import { MdOpenInNew } from "react-icons/md";

const MenuHeader = () => {
  const searchWord = useField(
    "search-chats",
    "text",
    "Search by title or description..."
  );
  const { name, type, value, placeholder, onChange, onReset } = searchWord;
  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
          Chats
        </h1>
        <button
          onClick={() => console.log("New chat clicked!")}
          className="cursor-pointer"
        >
          <MdOpenInNew className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
      </div>
      <label
        htmlFor={name}
        className="flex w-full items-center rounded-full border-[1.5px] border-slate-100 bg-slate-100 p-2 transition-all focus-within:border-purple-500 hover:border-purple-500 dark:border-slate-700 dark:bg-slate-700 focus-within:dark:border-purple-400 hover:dark:border-purple-400"
      >
        <FaSearch className="h-4 w-4 fill-current text-slate-800 dark:text-slate-300" />
        <input
          id={name}
          name={name}
          className="peer focus:bg-opacity-0 inset-0 w-full px-3 font-normal text-slate-900 placeholder:text-slate-800 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-300"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onReset={onReset}
        />
      </label>
    </div>
  );
};

const ListMenu = () => (
  <div className="flex flex-grow bg-white sm:max-w-[360px] dark:bg-slate-800">
    <MenuHeader />
  </div>
);

const Chats = () => {
  return (
    <div className="flex flex-grow">
      <ListMenu />
      <div className="hidden flex-grow items-center justify-center sm:flex">
        <p className="rounded-xl bg-slate-200 p-2 font-semibold text-slate-800 dark:bg-slate-700 dark:text-slate-100">
          Select Chat to Start Messaging.
        </p>
      </div>
    </div>
  );
};

export default Chats;
