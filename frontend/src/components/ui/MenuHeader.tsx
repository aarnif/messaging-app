import { MdAdd } from "react-icons/md";
import type { InputField } from "../../types";
import SearchBox from "./SearchBox";

const MenuHeader = ({
  title,
  searchWord,
  buttonTestId = "",
  callback = () => {},
}: {
  title: string;
  searchWord: InputField;
  buttonTestId: string;
  callback?: () => void;
}) => (
  <div className="flex w-full flex-col gap-4 p-4">
    <div className="flex items-center justify-between">
      <h1 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
        {title}
      </h1>
      <button
        type="button"
        data-testid={buttonTestId}
        onClick={callback}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-green-600 text-white hover:text-slate-200 shadow-[0px_2px] shadow-green-900 transition hover:bg-green-700 focus:outline-none active:translate-y-0.5 active:shadow-[0px_0px] dark:bg-green-500  dark:hover:bg-green-600"
      >
        <MdAdd className="h-6 w-6 fill-current" />
      </button>
    </div>
    <SearchBox searchWord={searchWord} />
  </div>
);

export default MenuHeader;
