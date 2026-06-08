import { MdCheck } from "react-icons/md";
import type { User } from "../../__generated__/graphql";
import Avatar from "./Avatar";

const SelectUserButton = ({
  user,
  isSelected,
  callback,
}: {
  user: User;
  isSelected: boolean;
  callback: () => void;
}) => {
  const { id, name, username, about, avatar } = user;
  return (
    <button
      data-testid={isSelected && "selected"}
      onClick={callback}
      className="flex w-full cursor-pointer items-center"
    >
      <div data-testid={`user-${id}`} className="flex grow gap-4 p-2">
        <Avatar name={name} size="medium" avatar={avatar} />
        <div className="flex w-full flex-col gap-1 border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
              {name}
            </h2>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
              @{username}
            </p>
          </div>
          <p className="text-left text-xs font-medium text-slate-700 dark:text-slate-200">
            {about}
          </p>
        </div>
      </div>

      {isSelected ? (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-green-600 bg-green-600">
          <MdCheck size={20} className="text-white" />
        </div>
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300"></div>
      )}
    </button>
  );
};

export default SelectUserButton;
