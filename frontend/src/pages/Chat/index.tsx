import {
  useApolloClient,
  useMutation,
  useQuery,
  useSubscription,
} from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";
import { useMatch, useOutletContext } from "react-router";
import { ALL_CHATS_BY_USER, FIND_CHAT_BY_ID } from "../../graphql/queries";
import {
  MESSAGE_DELETED,
  MESSAGE_EDITED,
  MESSAGE_SENT,
} from "../../graphql/subscriptions";
import { MARK_CHAT_AS_READ } from "../../graphql/mutations";
import { updateChatByIdCache } from "../../helpers";
import Spinner from "../../components/ui/Spinner";
import NotFound from "../../components/ui/NotFound";
import { AnimatePresence } from "framer-motion";
import type { InputField } from "../../types";
import type { User } from "../../__generated__/graphql";
import ChatContent from "./ChatContent";
import ChatInfoModal from "./ChatInfoModal";
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

  const [markChatAsRead] = useMutation(MARK_CHAT_AS_READ);

  useEffect(() => {
    if (match?.id) {
      console.log(`Marking chat ${match.id} as read`);
      markChatAsRead({
        variables: { id: match.id },
        refetchQueries: [
          {
            query: ALL_CHATS_BY_USER,
            variables: { search: searchWord.value },
          },
        ],
      });
    }
  }, [match?.id, markChatAsRead, searchWord]);

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
        messages: chat?.messages.concat(latestMessage),
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
        messages: chat?.messages.map((message) =>
          message.id === editedMessage.id ? editedMessage : message
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
        messages: chat?.messages.map((message) =>
          message.id === deletedMessage.id ? deletedMessage : message
        ),
      }));
    },
  });

  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false);
  const [isEditChatOpen, setIsEditChatOpen] = useState(false);

  useEffect(() => {
    setIsChatInfoOpen(false);
  }, [match?.id]);

  const chat = data?.findChatById;

  return (
    <div className="relative flex grow flex-col">
      {loading ? (
        <div className="flex grow items-center justify-center">
          <Spinner />
        </div>
      ) : !chat ? (
        <NotFound entity="Chat" />
      ) : (
        <>
          <ChatContent
            currentUser={currentUser}
            chat={chat}
            setIsChatInfoOpen={setIsChatInfoOpen}
            latestAddedMessageId={latestAddedMessageIdRef.current}
          />
          <AnimatePresence>
            {isChatInfoOpen && (
              <ChatInfoModal
                key={"chat-info"}
                currentUser={currentUser}
                chat={chat}
                setIsChatInfoOpen={setIsChatInfoOpen}
                setIsEditChatOpen={setIsEditChatOpen}
              />
            )}

            {isEditChatOpen && (
              <EditChatModal
                key={"edit-chat"}
                chat={chat}
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
