import type { User } from "../../__generated__/graphql";
import Avatar from "./Avatar";

const UserCard = ({
  user,
  displayName,
  borderVariant = "none",
}: {
  user: User;
  displayName?: string;
  borderVariant?: "none" | "bottom";
}) => {
  const { id, name, username, about, avatar } = user;

  return (
    <div data-testid={`user-${id}`} className="flex grow gap-4">
      <Avatar name={name} size="medium" avatar={avatar} />
      <div
        className={`flex w-full flex-col gap-1 ${borderVariant === "bottom" && "border-b border-slate-200 dark:border-slate-700"}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
            {displayName ?? name}
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
  );
};

export default UserCard;
