import {
  useApolloClient,
  useQuery,
  useSubscription,
} from "@apollo/client/react";
import { AnimatePresence, motion } from "motion/react";
import { NavLink, useLocation, useMatch } from "react-router";
import { useRef } from "react";
import { useDebounce } from "use-debounce";
import { ALL_CHATS_BY_USER } from "../../graphql/queries";
import {
  USER_CHAT_CREATED,
  USER_CHAT_DELETED,
  USER_CHAT_LEFT,
  USER_CHAT_UPDATED,
} from "../../graphql/subscriptions";
import { DEBOUNCE_DELAY } from "../../constants";
import MenuHeader from "../../components/ui/MenuHeader";
import Skeleton from "../../components/ui/Skeleton";
import type { User } from "../../__generated__/graphql";
import type { InputField } from "../../types";
import {
  getChatName,
  isValidChatForUser,
  updateChatByIdCache,
  updateUserChatsCache,
} from "../../helpers";
import ChatItem from "./ChatItem";

const MotionNavLink = motion.create(NavLink);

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
  const recentlyUpdatedChatIdRef = useRef<string | null>(null);
  const client = useApolloClient();
  const match = useMatch("/chats/:id");
  const [debouncedValue] = useDebounce(searchWord.value, DEBOUNCE_DELAY);

  const { data, loading } = useQuery(ALL_CHATS_BY_USER, {
    variables: {
      search: debouncedValue,
    },
    skip: !currentUser,
  });

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
      recentlyUpdatedChatIdRef.current = updatedChat.id;

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
    fetchPolicy: "no-cache",
    skip: !currentUser,
    onData: ({ data }) => {
      console.log("Use USER_CHAT_CREATED-subscription:");
      const createdChat = data.data?.userChatCreated;

      if (!isValidChatForUser(createdChat, currentUser)) {
        return;
      }

      recentlyUpdatedChatIdRef.current = createdChat.id;

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
          updateChatByIdCache(client.cache, chatId, (chat) => ({
            ...chat,
            members: chat.members.filter((member) => member.id !== memberId),
          }));
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
        <div className="flex h-0 grow flex-col gap-2 overflow-y-auto p-2">
          {Array.from({ length: 15 }).map((_, index) => (
            <Skeleton key={index} />
          ))}
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
                    : `rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${recentlyUpdatedChatIdRef.current === chat.id && "animate-highlight-light dark:animate-highlight-dark"}`
                }
                layout
                onLayoutAnimationComplete={() =>
                  (recentlyUpdatedChatIdRef.current = null)
                }
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

export default ListMenu;
