import { MdCheck } from "react-icons/md";
import type { User } from "../../__generated__/graphql";
import UserCard from "./UserCard";

const SelectUserButton = ({
  user,
  isSelected,
  callback,
}: {
  user: User;
  isSelected: boolean;
  callback: () => void;
}) => (
  <button
    data-testid={isSelected && "selected"}
    onClick={callback}
    className="flex gap-2 w-full cursor-pointer items-center p-2"
  >
    <UserCard user={user} />
    {isSelected ? (
      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-green-600 bg-green-600">
        <MdCheck size={20} className="text-white" />
      </div>
    ) : (
      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300"></div>
    )}
  </button>
);

export default SelectUserButton;
