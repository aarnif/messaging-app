import useField from "../hooks/useField";
import { ALL_CHATS_BY_USER } from "../graphql/queries";
import { FaSearch } from "react-icons/fa";
import { MdOpenInNew } from "react-icons/md";
import { useQuery } from "@apollo/client/react";
import { NavLink } from "react-router";
import type { InputField } from "../types";
import type { UserChat } from "../__generated__/graphql";

const MenuHeader = ({ searchWord }: { searchWord: InputField }) => {
  const { name, type, value, placeholder, onChange, onReset } = searchWord;
  return (
    <div className="flex w-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
          Chats
        </h1>
        <button
          onClick={() => console.log("New chat clicked!")}
          className="cursor-pointer"
        >
          <MdOpenInNew className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
      </div>
      <label
        htmlFor={name}
        className="flex w-full items-center rounded-full border-[1.5px] border-slate-100 bg-slate-100 p-2 transition-all focus-within:border-purple-500 hover:border-purple-500 dark:border-slate-700 dark:bg-slate-700 focus-within:dark:border-purple-400 hover:dark:border-purple-400"
      >
        <FaSearch className="h-4 w-4 fill-current text-slate-800 dark:text-slate-300" />
        <input
          id={name}
          name={name}
          className="peer focus:bg-opacity-0 inset-0 w-full px-3 font-normal text-slate-900 placeholder:text-slate-800 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-300"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onReset={onReset}
        />
      </label>
    </div>
  );
};

const ChatItem = ({ chat }: { chat: UserChat }) => {
  const { id, name, messages } = chat;
  const latestMessage = messages?.[messages.length - 1];

  if (!latestMessage) {
    return null;
  }

  const { sender, content, createdAt } = latestMessage;
  const messagePreview = content ? `${content.slice(0, 24)}...` : "";

  return (
    <NavLink
      to={`/chats/${id}`}
      className="rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
    >
      <div className="flex gap-4 p-2">
        <img
          className="h-12 w-12 rounded-full"
          src="https://i.ibb.co/bRb0SYw/chat-placeholder.png"
        />
        <div className="flex w-full flex-col gap-1 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
              {name}
            </h2>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {createdAt}
            </p>
          </div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {sender?.name}:{" "}
            <span className="font-normal">{messagePreview}</span>
          </p>
        </div>
      </div>
    </NavLink>
  );
};

const ListMenu = () => {
  const searchWord = useField(
    "search-chats",
    "text",
    "Search by title or description..."
  );

  const { data, loading } = useQuery(ALL_CHATS_BY_USER, {
    variables: {
      search: searchWord.value,
    },
  });

  const chats = data?.allChatsByUser;
  const hasChats = chats && chats.length > 0;

  return (
    <div className="flex flex-grow flex-col bg-white sm:max-w-[360px] dark:bg-slate-800">
      <MenuHeader searchWord={searchWord} />
      {loading ? null : hasChats ? (
        <div className="flex flex-col gap-2 p-2">
          {chats.map((chat) => chat && <ChatItem key={chat.id} chat={chat} />)}
        </div>
      ) : (
        <div className="px-4 py-2">
          <h2 className="font-bold text-slate-700 dark:text-slate-200">
            No chats found.
          </h2>
        </div>
      )}
    </div>
  );
};

const Chats = () => (
  <div className="flex flex-grow">
    <ListMenu />
    <div className="hidden flex-grow items-center justify-center sm:flex">
      <p className="rounded-xl bg-slate-200 p-2 font-semibold text-slate-800 dark:bg-slate-700 dark:text-slate-100">
        Select Chat to Start Messaging.
      </p>
    </div>
  </div>
);

export default Chats;
