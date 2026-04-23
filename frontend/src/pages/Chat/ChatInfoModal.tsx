import { useMutation } from "@apollo/client/react";
import { motion } from "framer-motion";
import { FiEdit } from "react-icons/fi";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router";
import type {
  ChatMember,
  Chat as ChatType,
  User,
} from "../../__generated__/graphql";
import Button from "../../components/ui/Button";
import { DELETE_CHAT, LEAVE_CHAT } from "../../graphql/mutations";
import { ALL_CHATS_BY_USER } from "../../graphql/queries";
import useModal from "../../hooks/useModal";

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
              onConfirm: handleLeaveChat,
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
              onConfirm: handleDeleteChat,
            })
          }
        />
      )}
    </motion.div>
  );
};

export default ChatInfoModal;
