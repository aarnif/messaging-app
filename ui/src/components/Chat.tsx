import { useMatch, useNavigate, useOutletContext } from "react-router";
import {
  useApolloClient,
  useQuery,
  useLazyQuery,
  useSubscription,
} from "@apollo/client/react";
import {
  FIND_CHAT_BY_ID,
  ALL_CHATS_BY_USER,
  ALL_CONTACTS_BY_USER,
  IS_BLOCKED_BY_USER,
  FIND_CONTACT_BY_USER_ID,
} from "../graphql/queries";
import { useDebounce } from "use-debounce";
import { MESSAGE_SENT } from "../graphql/subscriptions";
import Spinner from "../ui/Spinner";
import NotFound from "../ui/NotFound";
import {
  IoChevronBack,
  IoChevronForward,
  IoChevronDown,
  IoCheckmark,
} from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { DEBOUNCE_DELAY } from "../constants";
import type { InputField, UserContact } from "../types";
import type {
  Chat as ChatType,
  User,
  Message,
  ChatMember,
  IsBlockedByUserQuery,
  Exact,
} from "../__generated__/graphql";
import { updateChatByIdCache, formatDisplayDate } from "../helpers";
import { useEffect, useRef, useState } from "react";
import useResponsiveWidth from "../hooks/useResponsiveWidth";
import useField from "../hooks/useField";
import useNotifyMessage from "../hooks/useNotifyMessage";
import useModal from "../hooks/useModal";
import { FiEdit } from "react-icons/fi";
import {
  SEND_MESSAGE,
  EDIT_CHAT,
  LEAVE_CHAT,
  DELETE_CHAT,
  MARK_CHAT_AS_READ,
} from "../graphql/mutations";
import { useMutation } from "@apollo/client/react";
import { motion, AnimatePresence } from "framer-motion";
import ChatHeader from "../ui/ChatHeader";
import MessageBox from "../ui/MessageBox";
import Notify from "../ui/Notify";
import FormField from "../ui/FormField";
import SearchBox from "../ui/SearchBox";
import SelectContactsList from "../ui/SelectContactsList";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import { checkIfMessageIsSingleEmoji } from "../helpers";

const MessageMenu = ({
  handleOpenEditModal,
}: {
  handleOpenEditModal: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer rounded-lg bg-slate-200 p-1 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500"
      >
        <IoChevronDown className="h-3.5 w-3.5 text-slate-700 dark:text-slate-100" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 w-32 rounded-lg bg-slate-200 shadow-lg dark:bg-slate-700">
            <button
              onClick={() => {
                handleOpenEditModal();
                setIsOpen(false);
              }}
              className="w-full cursor-pointer rounded-lg px-4 py-2 text-left text-xs font-semibold text-slate-900 hover:bg-slate-300 dark:text-slate-50 dark:hover:bg-slate-600"
            >
              Edit
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const ChatMessage = ({
  currentUser,
  message,
  latestAddedMessageId,
}: {
  currentUser: User;
  message: Message;
  latestAddedMessageId: string | null;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const isCurrentUser = message.sender.id === currentUser.id;
  const senderName = isCurrentUser ? "You" : message.sender.name;
  const isLatestMessage = message.id === latestAddedMessageId;
  const isSingleEmoji = checkIfMessageIsSingleEmoji(message.content);

  const handleOpenEditModal = () => {
    console.log("Open edit modal for message:", message.id);
    setIsEditing(true);
  };

  return (
    <div
      className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
    >
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsEditing(false)}
          />
        )}
      </AnimatePresence>
      <motion.div
        layout
        data-testid={isCurrentUser ? "current-user-message" : "contact-message"}
        className={`group flex max-w-62.5 min-w-25 flex-col rounded-lg px-2 pt-2 sm:max-w-150 ${
          isCurrentUser ? "bg-green-300" : "ml-8 bg-slate-200 dark:bg-slate-700"
        } ${isLatestMessage && "animate-pop-in"} ${isEditing ? "fixed top-1/2 left-1/2 z-50 w-64 -translate-x-1/2 -translate-y-1/2 sm:w-96" : "relative"}`}
      >
        {isCurrentUser && !isEditing && (
          <div className="invisible absolute top-1 right-1 group-hover:visible">
            <MessageMenu handleOpenEditModal={handleOpenEditModal} />
          </div>
        )}
        <h3
          className={`font-semibold ${isEditing ? "text-sm" : "text-xs"} ${
            isCurrentUser
              ? "text-slate-900"
              : "text-slate-900 dark:text-slate-50"
          }`}
        >
          {senderName}
        </h3>
        {isEditing ? (
          <div className="flex flex-col gap-2 py-1">
            <textarea
              className="w-full resize-none rounded text-sm font-normal text-slate-800 outline-none"
              rows={3}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-slate-700 transition-colors hover:bg-green-400"
                onClick={() => setIsEditing(false)}
              >
                <MdClose className="h-4 w-4 text-slate-800" />
              </button>
              <button
                type="button"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-slate-700 transition-colors hover:bg-green-400"
                onClick={() => setIsEditing(false)}
              >
                <IoCheckmark className="h-5 w-5 text-slate-800" />
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`font-normal wrap-break-word text-slate-800 ${isCurrentUser ? "text-slate-800" : "text-slate-800 dark:text-slate-100"} ${isSingleEmoji ? "text-center text-2xl" : "text-xs"}`}
          >
            {message.content}
          </p>
        )}
        <p
          className={`my-1 text-end ${isEditing ? "text-xs" : "text-[10px]"} ${
            isCurrentUser
              ? "text-slate-700"
              : "text-slate-700 dark:text-slate-200"
          }`}
        >
          {formatDisplayDate(message?.createdAt, currentUser.is24HourClock)}
        </p>
        <div
          className={`absolute bottom-0 border-t-16 border-t-transparent ${isCurrentUser ? "-right-2 border-l-16 border-l-green-300" : "-left-2 border-r-16 border-r-slate-200 dark:border-r-slate-700"}`}
        ></div>
      </motion.div>

      {!isCurrentUser && (
        <div className="relative right-3 w-full">
          <Avatar
            name={message.sender.name}
            size="small"
            avatar={message.sender.avatar}
            isLatestMessage={isLatestMessage}
          />
        </div>
      )}
    </div>
  );
};

const NotificationMessage = ({ message }: { message: Message }) => {
  return (
    <div className="flex flex-col items-center">
      <div
        data-testid={"notification-message"}
        className="relative flex max-w-62.5 min-w-25 flex-col rounded-lg bg-slate-200 p-2 sm:sm:max-w-150 dark:bg-slate-700"
      >
        <p className="text-xs font-medium wrap-break-word text-slate-800 dark:text-slate-100">
          {message.content}
        </p>
      </div>
    </div>
  );
};

const ChatMessages = ({
  currentUser,
  messages,
  latestAddedMessageId,
}: {
  currentUser: User;
  messages: Message[];
  latestAddedMessageId: string | null;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  return (
    <div className="flex h-0 grow flex-col gap-4 overflow-y-auto p-4 sm:p-8">
      {messages.map((message) =>
        message.isNotification ? (
          <NotificationMessage key={message.id} message={message} />
        ) : (
          <ChatMessage
            key={message.id}
            currentUser={currentUser}
            message={message}
            latestAddedMessageId={latestAddedMessageId}
          />
        )
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

const NewMessageBox = ({
  id,
  userId,
  checkIsBlocked,
}: {
  id: string;
  userId: string | null;
  checkIsBlocked: useLazyQuery.ExecFunction<
    IsBlockedByUserQuery,
    Exact<{ id: string }>
  >;
}) => {
  const modal = useModal();
  const message = useField("New Message", "text", "New Message...");
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: (error) => {
      console.log(error);
    },
  });

  const handleSendMessage = async () => {
    if (!message.value) {
      console.log("Do not send empty message!");
      return;
    }

    if (userId) {
      const isBlockedByContact = await checkIsBlocked({
        variables: {
          id: userId,
        },
      });

      if (isBlockedByContact.data?.isBlockedByUser) {
        modal({
          type: "danger",
          title: "Blocked",
          message: "Contact has blocked you.",
          close: "Close",
        });
        return;
      }
    }

    await sendMessage({
      variables: {
        input: {
          id: id,
          content: message.value,
          isNotification: false,
        },
      },
    });

    message.onReset();
  };

  return <MessageBox message={message} callback={handleSendMessage} />;
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
        <div className="flex justify-between">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {about}
          </p>
          {member.role === "admin" && (
            <p className="text-xs font-medium text-slate-900 dark:text-slate-50">
              Admin
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatInfoModal = ({
  currentUser,
  chat,
  setIsChatInfoOpen,
  setIsEditChatOpen,
}: {
  currentUser: User;
  chat: ChatType;
  setIsChatInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const modal = useModal();
  const navigate = useNavigate();
  const { id, name, description, members } = chat;

  const [leaveChat] = useMutation(LEAVE_CHAT, {
    onError: (error) => {
      console.log(error);
    },
    refetchQueries: [ALL_CHATS_BY_USER],
  });

  const [deleteChat] = useMutation(DELETE_CHAT, {
    onError: (error) => {
      console.log(error);
    },
    refetchQueries: [ALL_CHATS_BY_USER],
  });

  const handleLeaveChat = async () => {
    const data = await leaveChat({
      variables: { id },
    });

    if (data?.data?.leaveChat) {
      navigate("/chats/left");
    }
  };

  const handleDeleteChat = async () => {
    const data = await deleteChat({
      variables: { id },
    });

    if (data?.data?.deleteChat) {
      navigate("/chats/deleted");
    }
  };

  const isAdmin =
    currentUser.id === members?.find((member) => member.role === "admin")?.id;

  return (
    <motion.div
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      exit={{ x: "100vw" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="absolute inset-0 flex grow flex-col items-center gap-4 overflow-y-auto bg-white px-2 py-4 sm:gap-8 dark:bg-slate-800"
    >
      <div
        className={`flex w-full items-center ${!isAdmin ? "relative justify-center" : "justify-between"}`}
      >
        <button
          data-testid="close-chat-info-button"
          className={`cursor-pointer ${!isAdmin && "absolute left-0"}`}
          onClick={() => setIsChatInfoOpen(false)}
        >
          <IoChevronBack className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
        </button>
        <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
          Chat
        </h2>
        {isAdmin && (
          <button
            data-testid="edit-chat-button"
            className="cursor-pointer"
            onClick={() => setIsEditChatOpen(true)}
          >
            <FiEdit className="h-6 w-6 text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
          </button>
        )}
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <img
          className="h-20 w-20 rounded-full"
          src="https://i.ibb.co/bRb0SYw/chat-placeholder.png"
        />
        <div className="flex flex-col items-center gap-1">
          <h4
            data-testid="chat-info-name"
            className="font-oswald font-semibold text-slate-900 dark:text-slate-50"
          >
            {name}
          </h4>
          <p className="text-center text-xs font-normal text-slate-700 dark:text-slate-200">
            {description}
          </p>
        </div>
      </div>

      <div className="flex w-full grow flex-col gap-2 p-2 sm:max-w-90">
        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-50">
          {members?.length} members
        </h4>
        <div className="flex flex-col gap-4">
          {members?.map((member) => (
            <ChatMemberItem
              key={member.id}
              member={member}
              currentUser={currentUser}
            />
          ))}
        </div>
      </div>

      {!isAdmin ? (
        <Button
          type="button"
          variant="delete"
          text="Leave Chat"
          onClick={() =>
            modal({
              type: "alert",
              title: "Leave Chat?",
              message: "Are you sure you want to leave the chat?",
              close: "Cancel",
              confirm: "Leave",
              callback: handleLeaveChat,
            })
          }
        />
      ) : (
        <Button
          type="button"
          variant="delete"
          text="Delete Chat"
          onClick={() =>
            modal({
              type: "danger",
              title: "Delete Chat?",
              message:
                "Delete this chat?\nThis will remove the chat and all messages for everyone.",
              close: "Cancel",
              confirm: "Delete",
              callback: handleDeleteChat,
            })
          }
        />
      )}
    </motion.div>
  );
};

const EditChatModal = ({
  chat,
  setIsEditChatOpen,
}: {
  chat: ChatType;
  setIsEditChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const width = useResponsiveWidth();
  const isMobileScreen = width <= 640;
  const { message, showMessage, closeMessage } = useNotifyMessage();
  const searchWord = useField(
    "search-contacts",
    "text",
    "Search by name or username..."
  );
  const [debouncedSearch] = useDebounce(searchWord.value, DEBOUNCE_DELAY);

  const name = useField("name", "text", "Enter name here...", chat?.name ?? "");
  const description = useField(
    "description",
    "text",
    "Enter description here...",
    chat?.description ?? ""
  );

  const { data } = useQuery(ALL_CONTACTS_BY_USER, {
    variables: {
      search: debouncedSearch,
    },
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set([...chat.members.map((member) => member.id)])
  );
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const selectedContacts = contacts.filter((contact) => contact.isSelected);

  const [editChat] = useMutation(EDIT_CHAT, {
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    if (data) {
      setContacts(
        data?.allContactsByUser?.map((contact) => ({
          ...contact,
          isSelected: selectedIds.has(contact.contactDetails.id),
        }))
      );
    }
  }, [data, selectedIds]);

  const handleEditChat = async () => {
    if (name.value.length < 3) {
      showMessage("Chat name must be at least three characters long");
      return;
    }

    await editChat({
      variables: {
        input: {
          id: chat.id,
          name: name.value,
          description: description.value ?? null,
          members: selectedContacts.map((contact) => contact.contactDetails.id),
        },
      },
    });
    setIsEditChatOpen(false);
  };

  return (
    <motion.div
      data-testid="overlay"
      key={"Overlay"}
      className="fixed inset-0 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={() => setIsEditChatOpen(false)}
      initial={{ x: "100vw", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100vw", opacity: 0, transition: { delay: 0.4 } }}
      transition={{ type: "tween" }}
    >
      <motion.div
        data-testid="edit-chat-modal"
        className="flex h-[90vh] grow flex-col items-center gap-4 rounded-t-lg rounded-b-none bg-white px-2 py-4 sm:h-full sm:max-h-125 sm:max-w-125 sm:rounded-lg dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
        initial={{
          y: isMobileScreen ? "100vh" : -50,
          opacity: isMobileScreen ? 1 : 0,
        }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.4 } }}
        exit={{
          y: isMobileScreen ? "100vh" : -50,
          opacity: isMobileScreen ? 1 : 0,
        }}
        transition={{ type: "tween" }}
      >
        <div className="flex w-full justify-between">
          <button
            data-testid="close-button"
            className="cursor-pointer"
            onClick={() => setIsEditChatOpen(false)}
          >
            <MdClose className="h-6 w-6 fill-current text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
          </button>
          <h2 className="font-oswald text-2xl font-medium text-slate-900 dark:text-slate-50">
            Edit Chat
          </h2>
          <button
            data-testid="submit-button"
            className="cursor-pointer"
            onClick={handleEditChat}
          >
            <IoChevronForward className="h-6 w-6 text-slate-700 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-300" />
          </button>
        </div>
        <AnimatePresence>
          {message && <Notify message={message} closeMessage={closeMessage} />}
        </AnimatePresence>
        <SearchBox searchWord={searchWord} />
        <SelectContactsList
          contacts={contacts}
          setSelectedIds={setSelectedIds}
        />
        <div className="flex w-full flex-col gap-4">
          <FormField field={name} />
          <FormField field={description} />
        </div>
        <p className="-my-1.5 w-full text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
          {selectedContacts.length} contacts selected
        </p>
      </motion.div>
    </motion.div>
  );
};

const ChatContent = ({
  currentUser,
  chat,
  setIsChatInfoOpen,
  latestAddedMessageId,
}: {
  currentUser: User;
  chat: ChatType;
  setIsChatInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
  latestAddedMessageId: string | null;
}) => {
  const navigate = useNavigate();
  const [checkIsBlocked] = useLazyQuery(IS_BLOCKED_BY_USER, {
    fetchPolicy: "network-only",
  });
  const [findContactByUserId] = useLazyQuery(FIND_CONTACT_BY_USER_ID, {
    fetchPolicy: "network-only",
  });

  const { id, type, name, members, messages } = chat;

  const otherChatMember =
    type === "private"
      ? members.find((member) => member.id !== currentUser.id)
      : null;

  const handleCallBack = async () => {
    if (type === "group") {
      setIsChatInfoOpen(true);
      return;
    }

    const data = await findContactByUserId({
      variables: {
        id: otherChatMember?.id ?? "",
      },
    });

    const contact = data?.data?.findContactByUserId;

    if (contact) {
      navigate(`/contacts/${contact.id}`);
    }
  };

  return (
    <>
      <ChatHeader
        type={type}
        name={name ?? ""}
        members={members ?? []}
        currentUser={currentUser}
        callBack={handleCallBack}
      />
      <ChatMessages
        currentUser={currentUser}
        messages={messages}
        latestAddedMessageId={latestAddedMessageId}
      />
      <NewMessageBox
        id={id}
        userId={otherChatMember ? otherChatMember.id : null}
        checkIsBlocked={checkIsBlocked}
      />
    </>
  );
};

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
