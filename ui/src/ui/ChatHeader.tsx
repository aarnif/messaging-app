import { useNavigate } from "react-router";
import { truncateText } from "../helpers";
import { IoChevronBack } from "react-icons/io5";
import type { Maybe, User, ChatMember } from "../__generated__/graphql";

const ChatHeader = ({
  type,
  name,
  members,
  currentUser,
  callBack,
}: {
  type: string | null;
  name: string;
  members: Maybe<ChatMember>[];
  currentUser: User;
  callBack?: () => void;
}) => {
  const navigate = useNavigate();

  const membersDisplayString =
    type === "group"
      ? members
          ?.map((member) =>
            member?.username === currentUser.username ? "You" : member?.name
          )
          .join(", ")
      : type === "private"
        ? "Click here for contact details."
        : "";

  const hasCallBack = !!callBack;

  return (
    <div className="relative flex items-center justify-center bg-white p-2 dark:bg-slate-800">
      <button
        data-testid="go-back-button"
        className="absolute left-2 cursor-pointer sm:hidden"
        onClick={() => navigate("/")}
      >
        <IoChevronBack className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 sm:h-7 sm:w-7 dark:text-slate-100 dark:hover:text-slate-300" />
      </button>
      <button
        data-testid="chat-info-button"
        className={`flex items-center justify-center gap-3 ${hasCallBack && "cursor-pointer"}`}
        disabled={!hasCallBack}
        onClick={callBack}
      >
        <img
          className="h-12 w-12 rounded-full"
          src="https://i.ibb.co/bRb0SYw/chat-placeholder.png"
        />
        <div>
          <h2 className="text-left text-sm font-bold text-slate-900 dark:text-slate-50">
            {name}
          </h2>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {truncateText(membersDisplayString, 36)}
          </p>
        </div>
      </button>
    </div>
  );
};

export default ChatHeader;
