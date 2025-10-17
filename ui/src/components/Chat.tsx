import { useMatch } from "react-router";
import { useQuery } from "@apollo/client/react";
import { FIND_CHAT_BY_ID } from "../graphql/queries";
import { truncateText } from "../helpers";
import Spinner from "../ui/Spinner";

const Header = ({
  name,
  membersString,
}: {
  name: string;
  membersString: string;
}) => {
  return (
    <div className="flex items-center justify-center bg-white p-2 dark:bg-slate-800">
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

const Chat = () => {
  const match = useMatch("/chats/:id")?.params;
  const { data, loading } = useQuery(FIND_CHAT_BY_ID, {
    variables: {
      id: match?.id ?? "",
    },
  });

  const chat = data?.findChatById;

  if (!chat) {
    return <p>Chat not found!</p>;
  }

  const { name, members } = chat;

  const membersString = members
    ?.map((member) => (member?.username === "test" ? "You" : member?.name))
    .join(", ");

  return (
    <div className="flex flex-grow flex-col">
      {loading ? (
        <div className="flex flex-grow items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <Header name={name ?? ""} membersString={membersString ?? ""} />
      )}
    </div>
  );
};

export default Chat;
