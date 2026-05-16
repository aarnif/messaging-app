import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from "@apollo/client/react";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useMatch, useOutletContext } from "react-router";
import type { User } from "../../__generated__/graphql";
import NotFound from "../../components/ui/NotFound";
import Spinner from "../../components/ui/Spinner";
import { MARK_CHAT_AS_READ } from "../../graphql/mutations";
import { ALL_CHATS_BY_USER, FIND_CHAT_BY_ID } from "../../graphql/queries";
import {
  CHAT_EDITED,
  MESSAGE_DELETED,
  MESSAGE_EDITED,
  MESSAGE_SENT,
} from "../../graphql/subscriptions";
import { updateChatByIdCache } from "../../helpers";
import type { InputField } from "../../types";
import ChatContent from "./ChatContent";
import ChatInfoDrawer from "./ChatInfoDrawer";
import EditChatModal from "./EditChatModal";

const Chat = () => {
  const latestAddedMessageIdRef = useRef<string | null>(null);
  const { currentUser, searchWord } = useOutletContext<{
    currentUser: User;
    searchWord: InputField;
  }>();

  const client = useApolloClient();
  const match = useMatch("/chats/:id")?.params;
  const { data, loading } = useQuery(FIND_CHAT_BY_ID, {
    variables: {
      id: match?.id ?? "",
    },
  });

  const [markChatAsRead] = useMutation(MARK_CHAT_AS_READ, {
    update: (cache) => {
      cache.updateQuery(
        { query: ALL_CHATS_BY_USER, variables: { search: searchWord.value } },
        (data) => {
          if (!data) {
            return data;
          }
          return {
            allChatsByUser: data.allChatsByUser.map((chat) =>
              chat.id === match?.id ? { ...chat, unreadCount: 0 } : chat,
            ),
          };
        },
      );
    },
  });

  useEffect(() => {
    if (match?.id) {
      console.log(`Marking chat ${match.id} as read`);
      markChatAsRead({
        variables: { id: match.id },
      });
    }
  }, [match?.id, markChatAsRead]);

  useSubscription(MESSAGE_SENT, {
    onData: ({ data }) => {
      console.log("Use MESSAGE_SENT-subscription:");
      const latestMessage = data.data?.messageSent;

      if (!latestMessage || latestMessage.chatId !== match?.id) {
        console.log("Message is not for this chat, skipping cache update");
        return;
      }

      latestAddedMessageIdRef.current = latestMessage.id;

      updateChatByIdCache(client.cache, match.id, (chat) => ({
        ...chat,
        messages: chat.messages.concat(latestMessage),
      }));
    },
  });

  useSubscription(MESSAGE_EDITED, {
    onData: ({ data }) => {
      console.log("Use MESSAGE_EDITED-subscription:");
      const editedMessage = data.data?.messageEdited;

      if (!editedMessage || editedMessage.chatId !== match?.id) {
        console.log("Message is not for this chat, skipping cache update");
        return;
      }

      updateChatByIdCache(client.cache, match.id, (chat) => ({
        ...chat,
        messages: chat.messages.map((message) =>
          message.id === editedMessage.id ? editedMessage : message,
        ),
      }));
    },
  });

  useSubscription(MESSAGE_DELETED, {
    onData: ({ data }) => {
      console.log("Use MESSAGE_DELETED-subscription:");
      const deletedMessage = data.data?.messageDeleted;

      if (!deletedMessage || deletedMessage.chatId !== match?.id) {
        console.log("Message is not for this chat, skipping cache update");
        return;
      }

      updateChatByIdCache(client.cache, match.id, (chat) => ({
        ...chat,
        messages: chat.messages.map((message) =>
          message.id === deletedMessage.id ? deletedMessage : message,
        ),
      }));
    },
  });

  useSubscription(CHAT_EDITED, {
    onData: ({ data }) => {
      console.log("Use CHAT_EDITED-subscription:");
      const updatedChat = data.data?.chatEdited;

      if (!updatedChat || updatedChat.id !== match?.id) {
        console.log("Chat update is not for this chat, skipping cache update");
        return;
      }

      updateChatByIdCache(client.cache, match.id, () => updatedChat);
    },
  });

  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false);
  const [isEditChatOpen, setIsEditChatOpen] = useState(false);

  useEffect(() => {
    setIsChatInfoOpen(false);
  }, [match?.id]);

  return (
    <div className="relative flex grow flex-col overflow-hidden sm:overflow-visible">
      {loading ? (
        <div className="flex grow items-center justify-center">
          <Spinner />
        </div>
      ) : !data ? (
        <NotFound entity="Chat" />
      ) : (
        <>
          <ChatContent
            currentUser={currentUser}
            chat={data.findChatById}
            setIsChatInfoOpen={setIsChatInfoOpen}
            latestAddedMessageId={latestAddedMessageIdRef.current}
          />
          <AnimatePresence>
            {isChatInfoOpen && (
              <ChatInfoDrawer
                key={"chat-info"}
                currentUser={currentUser}
                chat={data.findChatById}
                setIsChatInfoOpen={setIsChatInfoOpen}
                setIsEditChatOpen={setIsEditChatOpen}
              />
            )}

            {isEditChatOpen && (
              <EditChatModal
                key={"edit-chat"}
                chat={data.findChatById}
                setIsEditChatOpen={setIsEditChatOpen}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default Chat;
