import useField from "../hooks/useField";
import { ALL_CHATS_BY_USER } from "../graphql/queries";
import { useQuery } from "@apollo/client/react";
import { NavLink, Outlet } from "react-router";
import Spinner from "../ui/Spinner";
import MenuHeader from "../ui/MenuHeader";
import type { UserChat } from "../__generated__/graphql";

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
      className={({ isActive }) =>
        isActive
          ? "rounded-xl bg-slate-100 transition-colors dark:bg-slate-700"
          : "rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
      }
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
      <MenuHeader title="Chats" searchWord={searchWord} />
      {loading ? (
        <div className="mt-8">
          <Spinner />
        </div>
      ) : hasChats ? (
        <div className="flex h-0 flex-grow flex-col gap-2 overflow-y-auto p-2">
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
    <Outlet />
  </div>
);

export default Chats;
