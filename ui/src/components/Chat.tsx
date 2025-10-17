import { useMatch, useNavigate } from "react-router";
import { useQuery } from "@apollo/client/react";
import { FIND_CHAT_BY_ID } from "../graphql/queries";
import { truncateText } from "../helpers";
import Spinner from "../ui/Spinner";
import { IoChevronBack } from "react-icons/io5";
import type { Chat, User } from "../__generated__/graphql";

const Header = ({
  name,
  membersString,
}: {
  name: string;
  membersString: string;
}) => {
  const navigate = useNavigate();
  return (
    <div className="relative flex items-center justify-center bg-white p-2 dark:bg-slate-800">
      <button
        data-testid="go-back"
        className="absolute left-2 cursor-pointer sm:hidden"
        onClick={() => navigate("/")}
      >
        <IoChevronBack className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 sm:h-7 sm:w-7 dark:text-slate-100 dark:hover:text-slate-300" />
      </button>
      <button
        className="flex cursor-pointer items-center justify-center gap-3"
        onClick={() => console.log("Chat info clicked!")}
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
            {truncateText(membersString, 36)}
          </p>
        </div>
      </button>
    </div>
  );
};

const ChatNotFound = () => (
  <div className="flex flex-grow flex-col justify-center">
    <p className="text-center font-bold text-red-600">Chat not found.</p>
    <p className="text-center font-bold text-red-600">
      It may have been deleted or the link is incorrect.
    </p>
  </div>
);

const ChatContent = ({
  currentUser,
  chat,
}: {
  currentUser: User;
  chat: Chat | null | undefined;
}) => {
  if (!chat) {
    return <ChatNotFound />;
  }

  const { name, members } = chat;

  const membersString = members
    ?.map((member) =>
      member?.username === currentUser.username ? "You" : member?.name
    )
    .join(", ");

  return <Header name={name ?? ""} membersString={membersString ?? ""} />;
};

const Chat = ({ currentUser }: { currentUser: User }) => {
  const match = useMatch("/chats/:id")?.params;
  const { data, loading } = useQuery(FIND_CHAT_BY_ID, {
    variables: {
      id: match?.id ?? "",
    },
  });

  return (
    <div className="flex flex-grow flex-col">
      {loading ? (
        <div className="flex flex-grow items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <ChatContent currentUser={currentUser} chat={data?.findChatById} />
      )}
    </div>
  );
};

export default Chat;
