import { useMatch, useNavigate } from "react-router";
import { useQuery } from "@apollo/client/react";
import { FIND_CHAT_BY_ID } from "../graphql/queries";
import { truncateText } from "../helpers";
import Spinner from "../ui/Spinner";
import { IoChevronBack } from "react-icons/io5";
import type { Maybe, Chat, User, Message } from "../__generated__/graphql";
import { formatDisplayDate } from "../helpers";

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

const ChatMessage = ({
  currentUser,
  message,
}: {
  currentUser: User;
  message: Maybe<Message>;
}) => {
  const isCurrentUser = message?.sender?.id === currentUser.id;
  const senderName = isCurrentUser ? "You" : message?.sender?.name;

  return (
    <div
      className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
    >
      <div
        data-testid={isCurrentUser ? "current-user-message" : "contact-message"}
        className={`relative flex max-w-[250px] min-w-[100px] flex-col rounded-xl px-2 pt-2 sm:max-w-[600px] ${
          isCurrentUser ? "bg-green-300" : "ml-8 bg-slate-200 dark:bg-slate-700"
        }`}
      >
        <h3
          className={`text-xs font-semibold ${
            isCurrentUser
              ? "text-slate-900"
              : "text-slate-900 dark:text-slate-50"
          }`}
        >
          {senderName}
        </h3>
        <p
          className={`text-xs font-normal break-words text-slate-800 ${isCurrentUser ? "text-slate-800" : "text-slate-800 dark:text-slate-100"}`}
        >
          {message?.content}
        </p>
        <p
          className={`my-1 text-end text-[10px] ${
            isCurrentUser
              ? "text-slate-700"
              : "text-slate-700 dark:text-slate-200"
          }`}
        >
          {formatDisplayDate(message?.createdAt)}
        </p>
        <div
          className={`absolute bottom-0 border-t-[16px] border-t-transparent ${isCurrentUser ? "-right-2 border-l-[16px] border-l-green-300" : "-left-2 border-r-[16px] border-r-slate-200 dark:border-r-slate-700"}`}
        ></div>
      </div>

      {!isCurrentUser && (
        <img
          src="https://i.ibb.co/vJDhmJJ/profile-placeholder.png"
          alt="sender-thumbnail"
          className="relative right-[12px] h-10 w-10 rounded-full"
        />
      )}
    </div>
  );
};

const ChatMessages = ({
  currentUser,
  messages,
}: {
  currentUser: User;
  messages: Maybe<Maybe<Message>[]> | undefined;
}) => (
  <div className="flex h-0 flex-grow flex-col gap-4 overflow-y-auto p-4 sm:p-8">
    {messages?.map((message) => (
      <ChatMessage
        key={message?.id}
        currentUser={currentUser}
        message={message}
      />
    ))}
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

  return (
    <>
      <Header name={name ?? ""} membersString={membersString ?? ""} />
      <ChatMessages currentUser={currentUser} messages={chat.messages} />
    </>
  );
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
