import { useMatch, useNavigate } from "react-router";
import { useQuery, useLazyQuery } from "@apollo/client/react";
import {
  FIND_CHAT_BY_ID,
  ALL_CHATS_BY_USER,
  ALL_CONTACTS_BY_USER,
  IS_BLOCKED_BY_USER,
  FIND_CONTACT_BY_USER_ID,
} from "../graphql/queries";
import Spinner from "../ui/Spinner";
import NotFound from "../ui/NotFound";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import type { UserContact } from "../types";
import type {
  Maybe,
  Chat,
  User,
  Message,
  ChatMember,
  IsBlockedByUserQuery,
  Exact,
} from "../__generated__/graphql";
import { formatDisplayDate } from "../helpers";
import { useEffect, useRef, useState } from "react";
import useResponsiveWidth from "../hooks/useResponsiveWidth";
import useField from "../hooks/useField";
import useNotifyMessage from "../hooks/useNotifyMessage";
import { FiEdit } from "react-icons/fi";
import {
  SEND_MESSAGE,
  EDIT_CHAT,
  LEAVE_CHAT,
  DELETE_CHAT,
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
          {formatDisplayDate(message?.createdAt, currentUser.is24HourClock)}
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

    if (userId) {
      const isBlockedByContact = await checkIsBlocked({
        variables: {
          id: userId,
        },
      });

      if (isBlockedByContact.data?.isBlockedByUser) {
        console.log("Contact has blocked you.");
        return;
      }
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
  chat: Chat;
  setIsChatInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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
      className="absolute inset-0 flex flex-grow flex-col items-center gap-4 overflow-y-auto bg-white px-2 py-4 sm:gap-8 dark:bg-slate-800"
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
          <h4 className="font-oswald font-semibold text-slate-900 dark:text-slate-50">
            {name}
          </h4>
          <p className="text-center text-xs font-normal text-slate-700 dark:text-slate-200">
            {description}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-grow flex-col gap-2 p-2 sm:max-w-[360px]">
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
          variant="danger"
          text="Leave Chat"
          onClick={handleLeaveChat}
        />
      ) : (
        <Button
          type="button"
          variant="danger"
          text="Delete Chat"
          onClick={handleDeleteChat}
        />
      )}
    </motion.div>
  );
};

const EditChatModal = ({
  chat,
  setIsEditChatOpen,
}: {
  chat: Chat;
  setIsEditChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const width = useResponsiveWidth();
  const isMobileScreen = width <= 640;
  const { message, showMessage } = useNotifyMessage();
  const searchWord = useField(
    "search-contacts",
    "text",
    "Search by name or username..."
  );
  const name = useField("name", "text", "Enter name here...", chat?.name ?? "");
  const description = useField(
    "description",
    "text",
    "Enter description here...",
    chat?.description ?? ""
  );

  const { data } = useQuery(ALL_CONTACTS_BY_USER, {
    variables: {
      search: searchWord.value,
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
        className="flex h-[90vh] flex-grow flex-col items-center gap-4 rounded-t-xl rounded-b-none bg-white px-2 py-4 sm:h-full sm:max-h-[500px] sm:max-w-[500px] sm:rounded-xl dark:bg-slate-800"
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
          {message && <Notify message={message} />}
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
}: {
  currentUser: User;
  chat: Chat;
  setIsChatInfoOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();
  const [checkIsBlocked] = useLazyQuery(IS_BLOCKED_BY_USER, {
    fetchPolicy: "network-only",
  });
  const [findContactByUserId] = useLazyQuery(FIND_CONTACT_BY_USER_ID, {
    fetchPolicy: "network-only",
  });

  const { id, type, name, members } = chat;

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
      <ChatMessages currentUser={currentUser} messages={chat.messages} />
      <NewMessageBox
        id={id}
        userId={otherChatMember ? otherChatMember.id : null}
        checkIsBlocked={checkIsBlocked}
      />
    </>
  );
};

const Chat = ({ currentUser }: { currentUser: User }) => {
  const match = useMatch("/chats/:id")?.params;
  const { data, loading } = useQuery(FIND_CHAT_BY_ID, {
    variables: {
      id: match?.id ?? "",
    },
    fetchPolicy: "cache-and-network",
  });

  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false);
  const [isEditChatOpen, setIsEditChatOpen] = useState(false);

  useEffect(() => {
    setIsChatInfoOpen(false);
  }, [match?.id]);

  const chat = data?.findChatById;

  return (
    <div className="relative flex flex-grow flex-col">
      {loading ? (
        <div className="flex flex-grow items-center justify-center">
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
