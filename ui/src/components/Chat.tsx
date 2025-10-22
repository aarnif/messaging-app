import { useMatch } from "react-router";
import { useQuery } from "@apollo/client/react";
import { FIND_CHAT_BY_ID, ALL_CHATS_BY_USER } from "../graphql/queries";
import Spinner from "../ui/Spinner";
import ChatNotFound from "../ui/ChatNotFound";
import { IoChevronBack } from "react-icons/io5";
import type {
  Maybe,
  Chat,
  User,
  Message,
  ChatMember,
} from "../__generated__/graphql";
import { formatDisplayDate } from "../helpers";
import { useEffect, useRef, useState } from "react";
import useField from "../hooks/useField";
import { FaRegSmile } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { SEND_MESSAGE } from "../graphql/mutations";
import { useMutation } from "@apollo/client/react";
import { motion, AnimatePresence } from "framer-motion";
import ChatHeader from "../ui/ChatHeader";

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
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  return (
    <div className="flex h-0 flex-grow flex-col gap-4 overflow-y-auto p-4 sm:p-8">
      {messages?.map((message) => (
        <ChatMessage
          key={message?.id}
          currentUser={currentUser}
          message={message}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

const NewMessageBox = ({ id }: { id: string }) => {
  const message = useField("New Message", "text", "New Message...");
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: (error) => {
      console.log(error);
    },
    refetchQueries: [ALL_CHATS_BY_USER],
  });

  const handleSendMessage = async () => {
    if (!message.value) {
      console.log("Do not send empty message!");
      return;
    }

    await sendMessage({
      variables: {
        input: {
          id: id,
          content: message.value,
        },
      },
    });

    message.onReset();
  };

  const { name, type, value, placeholder, onChange, onReset } = message;

  return (
    <div className="flex gap-2 bg-white p-2 dark:bg-slate-800">
      <button
        className="cursor-pointer"
        onClick={() => console.log("Clicked add emoji button")}
      >
        <FaRegSmile className="h-6 w-6 fill-current text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-600" />
      </button>
      <label
        htmlFor={name}
        className="flex w-full items-center rounded-full border-[1.5px] border-slate-100 bg-slate-100 p-1 transition-all focus-within:border-purple-500 hover:border-purple-500 dark:border-slate-700 dark:bg-slate-700 focus-within:dark:border-purple-400 hover:dark:border-purple-400"
      >
        <input
          id={name}
          name={name}
          className="peer focus:bg-opacity-0 inset-0 w-full px-3 text-sm font-normal text-slate-900 placeholder:text-sm placeholder:text-slate-800 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-300"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onReset={onReset}
        />
      </label>
      <button
        data-testid="send-message-button"
        className="cursor-pointer"
        onClick={handleSendMessage}
      >
        <MdSend className="h-6 w-6 fill-current text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-600" />
      </button>
    </div>
  );
};

const ChatMemberItem = ({
  member,
  currentUser,
}: {
  member: ChatMember;
  currentUser: User;
}) => {
  const { name, username, about } = member;

  return (
    <div className="flex gap-4">
      <img
        className="h-12 w-12 rounded-full"
        src="https://i.ibb.co/bRb0SYw/chat-placeholder.png"
      />
      <div className="flex w-full flex-col gap-1 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
            {name === currentUser.name ? "You" : name}
          </h2>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
            @{username}
          </p>
        </div>
        <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
          {about}
        </p>
      </div>
    </div>
  );
};

const ChatInfoModal = ({
  currentUser,
  chat,
  setIsChatInfoOpen,
}: {
  currentUser: User;
  chat: Chat | null | undefined;
  setIsChatInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  if (!chat) {
    return null;
  }

  const { name, description, members } = chat;

  return (
    <motion.div
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      exit={{ x: "100vw" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="absolute inset-0 flex flex-grow flex-col items-center gap-4 bg-white px-2 py-4 sm:gap-8 dark:bg-slate-800"
    >
      <div className="flex w-full justify-between">
        <button
          data-testid="close-chat-info-button"
          className="cursor-pointer"
          onClick={() => setIsChatInfoOpen(false)}
        >
          <IoChevronBack className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
        <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
          Chat
        </h2>
        <button
          data-testid="edit-chat-button"
          className="cursor-pointer"
          onClick={() => console.log("Edit Group Chat clicked!")}
        >
          <FiEdit className="h-6 w-6 text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <img
          className="h-20 w-20 rounded-full"
          src="https://i.ibb.co/bRb0SYw/chat-placeholder.png"
        />
        <div className="flex flex-col items-center gap-1">
          <h4 className="font-oswald font-semibold text-slate-900 dark:text-slate-50">
            {name}
          </h4>
          <p className="text-center text-xs font-normal text-slate-700 dark:text-slate-200">
            {description}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 p-2 sm:max-w-[360px]">
        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-50">
          {members?.length} members
        </h4>
        <div className="flex flex-col gap-4">
          {members?.map((member) =>
            member ? (
              <ChatMemberItem
                key={member.id}
                member={member}
                currentUser={currentUser}
              />
            ) : null
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ChatContent = ({
  currentUser,
  chat,
  setIsChatInfoOpen,
}: {
  currentUser: User;
  chat: Chat | null | undefined;
  setIsChatInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  if (!chat) {
    return <ChatNotFound />;
  }

  const { id, name, members } = chat;

  return (
    <>
      <ChatHeader
        name={name ?? ""}
        members={members ?? []}
        currentUser={currentUser}
        callBack={() => setIsChatInfoOpen(true)}
      />
      <ChatMessages currentUser={currentUser} messages={chat.messages} />
      <NewMessageBox id={id} />
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

  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false);

  return (
    <div className="relative flex flex-grow flex-col">
      {loading ? (
        <div className="flex flex-grow items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <ChatContent
          currentUser={currentUser}
          chat={data?.findChatById}
          setIsChatInfoOpen={setIsChatInfoOpen}
        />
      )}
      <AnimatePresence>
        {isChatInfoOpen && (
          <ChatInfoModal
            currentUser={currentUser}
            chat={data?.findChatById}
            setIsChatInfoOpen={setIsChatInfoOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;
