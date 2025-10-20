import { MdOpenInNew } from "react-icons/md";
import type { InputField } from "../types";
import SearchBox from "./SearchBox";

const MenuHeader = ({
  title,
  searchWord,
  callback = () => {},
}: {
  title: string;
  searchWord: InputField;
  callback?: () => void;
}) => (
  <div className="flex w-full flex-col gap-4 p-4">
    <div className="flex items-center justify-between">
      <h1 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
        {title}
      </h1>
      <button onClick={callback} className="cursor-pointer">
        <MdOpenInNew className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
      </button>
    </div>
    <SearchBox searchWord={searchWord} />
  </div>
);

export default MenuHeader;
