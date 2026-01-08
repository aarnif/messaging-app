import { ALL_CHATS_BY_USER, FIND_CHAT_BY_ID, ME } from "../graphql/queries";
import {
  USER_CHAT_UPDATED,
  USER_CHAT_CREATED,
  USER_CHAT_DELETED,
  USER_CHAT_LEFT,
} from "../graphql/subscriptions";
import {
  useApolloClient,
  useQuery,
  useSubscription,
} from "@apollo/client/react";
import { NavLink, Outlet, useLocation, useMatch } from "react-router";
import Spinner from "../ui/Spinner";
import MenuHeader from "../ui/MenuHeader";
import type { User, UserChat } from "../__generated__/graphql";
import type { InputField } from "../types";
import { formatDisplayDate, truncateText } from "../helpers";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import NewChatDropDownBox from "./NewChatDropDown";
import NewChatModal from "./NewChatModal";
import {
  isValidChatForUser,
  updateUserChatsCache,
  getChatName,
} from "../helpers";

const MotionNavLink = motion.create(NavLink);

const ChatItem = ({
  currentUser,
  chat,
}: {
  currentUser: User | undefined | null;
  chat: UserChat;
}) => {
  const { id, latestMessage, unreadCount } = chat;

  const { sender, content, createdAt } = latestMessage;
  const messagePreview = content ? truncateText(content) : "";

  const formattedTime = formatDisplayDate(
    createdAt,
    currentUser?.is24HourClock
  );

  return (
    <div data-testid={`chat-item-${id}`} className="flex gap-4 p-2">
      <img
        className="h-12 w-12 rounded-full"
        src="https://i.ibb.co/bRb0SYw/chat-placeholder.png"
      />
      <div className="flex w-full flex-col gap-1 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
            {getChatName(chat, currentUser?.id ?? "")}
          </h2>
          {formattedTime && (
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {formattedTime}
            </p>
          )}
        </div>
        <div className="flex justify-between">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {sender?.name}:{" "}
            <span className="font-normal">{messagePreview}</span>
          </p>
          {unreadCount > 0 && (
            <span
              data-testid="unread-messages-badge"
              className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white dark:bg-green-500"
            >
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ListMenu = ({
  currentUser,
  searchWord,
  meLoading,
  setIsNewChatDropdownOpen,
}: {
  currentUser: User | undefined | null;
  searchWord: InputField;
  meLoading: boolean;
  setIsNewChatDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const client = useApolloClient();
  const match = useMatch("/chats/:id");

  const { data, loading } = useQuery(ALL_CHATS_BY_USER, {
    variables: {
      search: searchWord.value,
    },
    skip: !currentUser,
  });

  const [recentlyUpdatedChatId, setRecentlyUpdatedChatId] = useState<
    string | null
  >(null);

  useSubscription(USER_CHAT_UPDATED, {
    fetchPolicy: "no-cache",
    skip: !currentUser,
    onData: ({ data }) => {
      console.log("Use CHAT_UPDATED-subscription:");
      const updatedChat = data.data?.userChatUpdated;

      if (!isValidChatForUser(updatedChat, currentUser)) {
        return;
      }

      const isViewingChat = match?.params.id === updatedChat.id;
      setRecentlyUpdatedChatId(updatedChat.id);

      updateUserChatsCache(client.cache, searchWord.value, (chats) =>
        chats.map((chat) =>
          chat.id === updatedChat.id
            ? {
                ...updatedChat,
                unreadCount: isViewingChat ? 0 : updatedChat.unreadCount,
                name: getChatName(updatedChat, currentUser!.id),
              }
            : chat
        )
      );
    },
  });

  useSubscription(USER_CHAT_CREATED, {
    skip: !currentUser,
    onData: ({ data }) => {
      console.log("Use USER_CHAT_CREATED-subscription:");
      const createdChat = data.data?.userChatCreated;

      if (!isValidChatForUser(createdChat, currentUser)) {
        return;
      }

      setRecentlyUpdatedChatId(createdChat.id);

      updateUserChatsCache(client.cache, searchWord.value, (chats) => [
        ...chats,
        { ...createdChat, name: getChatName(createdChat, currentUser!.id) },
      ]);
    },
  });

  useSubscription(USER_CHAT_DELETED, {
    skip: !currentUser,
    onData: ({ data }) => {
      const deletedChatId = data.data?.userChatDeleted;

      if (deletedChatId) {
        client.cache.evict({
          id: client.cache.identify({
            __typename: "UserChat",
            id: deletedChatId,
          }),
        });
        client.cache.gc();
      }
    },
  });

  useSubscription(USER_CHAT_LEFT, {
    skip: !currentUser,
    onData: ({ data }) => {
      console.log("Use USER_CHAT_LEFT-subscription:");
      const leftGroupChatDetails = data.data?.userChatLeft;

      if (leftGroupChatDetails && currentUser) {
        const { chatId, memberId } = leftGroupChatDetails;

        if (currentUser.id !== memberId) {
          client.cache.updateQuery(
            {
              query: FIND_CHAT_BY_ID,
              variables: { id: chatId },
            },
            (existingData) => {
              if (!existingData?.findChatById) {
                return existingData;
              }

              return {
                findChatById: {
                  ...existingData.findChatById,
                  members: existingData.findChatById.members.filter(
                    (member) => member.id !== memberId
                  ),
                },
              };
            }
          );
        }
      }
    },
  });

  const location = useLocation();
  const showListOnMobile = location.pathname === "/";

  const chats = data?.allChatsByUser;
  const hasChats = chats && chats.length > 0;

  return (
    <div
      className={`flex w-full flex-col border-r border-slate-200 bg-white sm:max-w-90 dark:border-slate-700 dark:bg-slate-800 ${
        showListOnMobile ? "" : "hidden sm:flex"
      }`}
    >
      <MenuHeader
        title="Chats"
        searchWord={searchWord}
        buttonTestId="create-new-chat"
        callback={() => setIsNewChatDropdownOpen(true)}
      />
      {meLoading || loading ? (
        <div className="mt-8">
          <Spinner />
        </div>
      ) : hasChats ? (
        <div className="flex h-0 grow flex-col gap-2 overflow-y-auto p-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {chats.map((chat) => (
              <MotionNavLink
                key={chat.id}
                to={`/chats/${chat.id}`}
                className={({ isActive }) =>
                  isActive
                    ? "rounded-lg bg-slate-200 transition-colors dark:bg-slate-700"
                    : `rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${recentlyUpdatedChatId === chat.id && "bg-slate-200 dark:bg-slate-700"}`
                }
                layout
                onLayoutAnimationComplete={() => setRecentlyUpdatedChatId(null)}
                transition={{
                  duration: 0.5,
                }}
              >
                <ChatItem currentUser={currentUser} chat={chat} />
              </MotionNavLink>
            ))}
          </AnimatePresence>
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

const Chats = ({ searchWord }: { searchWord: InputField }) => {
  const { data, loading: meLoading } = useQuery(ME);
  const currentUser = data?.me;

  const [isNewChatDropdownOpen, setIsNewChatDropdownOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatModalType, setNewChatModalType] = useState<
    "private" | "group" | null
  >(null);

  const handleOpenNewChatModal = (event: React.BaseSyntheticEvent) => {
    const clickedButtonText = event.target.textContent;

    if (clickedButtonText === "New Private Chat") {
      setNewChatModalType("private");
    } else {
      setNewChatModalType("group");
    }
    setIsNewChatModalOpen(true);
  };

  return (
    <div className="flex grow">
      <ListMenu
        currentUser={currentUser}
        searchWord={searchWord}
        meLoading={meLoading}
        setIsNewChatDropdownOpen={setIsNewChatDropdownOpen}
      />
      {meLoading ? (
        <div className="flex grow items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <Outlet context={{ currentUser, searchWord }} />
      )}
      <AnimatePresence>
        {isNewChatDropdownOpen && (
          <NewChatDropDownBox
            setIsNewChatDropdownOpen={setIsNewChatDropdownOpen}
            handleOpenNewChatModal={handleOpenNewChatModal}
          />
        )}
        {isNewChatModalOpen && currentUser && (
          <NewChatModal
            currentUser={currentUser}
            newChatModalType={newChatModalType}
            setIsNewChatModalOpen={setIsNewChatModalOpen}
            setNewChatModalType={setNewChatModalType}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chats;
