import { useMutation } from "@apollo/client/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaBan } from "react-icons/fa";
import { IoCheckmark } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import type { Message, User } from "../../__generated__/graphql";
import Avatar from "../../components/ui/Avatar";
import { DELETE_MESSAGE, EDIT_MESSAGE } from "../../graphql/mutations";
import { checkIfMessageIsSingleEmoji, formatDisplayDate } from "../../helpers";
import MessageMenu from "./MessageMenu";

const ChatMessage = ({
  currentUser,
  message,
  latestAddedMessageId,
}: {
  currentUser: User;
  message: Message;
  latestAddedMessageId: string | null;
}) => {
  const [isMessageMenuOpen, setIsMessageMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const isCurrentUser = message.sender.id === currentUser.id;
  const senderName = isCurrentUser ? "You" : message.sender.name;
  const isLatestMessage = message.id === latestAddedMessageId;
  const isSingleEmoji = checkIfMessageIsSingleEmoji(message.content);
  const isEdited = message.updatedAt !== message.createdAt;

  const [editMessage] = useMutation(EDIT_MESSAGE, {
    fetchPolicy: "no-cache",
    onError: (error) => {
      console.log(error);
    },
  });

  const [deleteMessage] = useMutation(DELETE_MESSAGE, {
    fetchPolicy: "no-cache",
    onError: (error) => {
      console.log(error);
    },
  });

  const handleOpenEditModal = () => {
    console.log("Open edit modal for message:", message.id);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedContent(message.content);
    setIsMessageMenuOpen(false);
    setIsEditing(false);
  };

  const handleEditMessage = async () => {
    if (!editedContent || editedContent === message.content) {
      setEditedContent(message.content);
      setIsMessageMenuOpen(false);
      setIsEditing(false);
      return;
    }

    await editMessage({
      variables: {
        input: {
          id: message.id,
          content: editedContent,
        },
      },
    });

    setIsMessageMenuOpen(false);
    setIsEditing(false);
  };

  const handleDeleteMessage = async () => {
    await deleteMessage({
      variables: {
        id: message.id,
      },
    });
  };

  const canOpenMessageMenu = isCurrentUser && !isEditing && !message.isDeleted;

  return (
    <div
      className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
    >
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={handleCancel}
          />
        )}
      </AnimatePresence>
      <motion.div
        layout
        onClick={
          canOpenMessageMenu
            ? () => setIsMessageMenuOpen(!isMessageMenuOpen)
            : undefined
        }
        data-testid={isCurrentUser ? "current-user-message" : "contact-message"}
        className={`flex max-w-62.5 min-w-25 flex-col rounded-lg px-2 pt-2 sm:max-w-150 ${
          isCurrentUser ? "bg-green-300" : "ml-8 bg-slate-200 dark:bg-slate-700"
        } ${isLatestMessage && "animate-pop-in"} ${isEditing ? "fixed top-1/2 left-1/2 z-50 w-64 -translate-x-1/2 -translate-y-1/2 sm:w-96" : "relative"} ${canOpenMessageMenu && !isMessageMenuOpen && "cursor-pointer"} ${isMessageMenuOpen && "z-50 -translate-y-2 scale-105"}`}
      >
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
              data-testid="edit-message-input"
              className="w-full resize-none rounded text-sm font-normal text-slate-800 outline-none"
              rows={3}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                data-testid="cancel-edit-message-button"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-slate-700 transition-colors hover:bg-green-400"
                onClick={handleCancel}
              >
                <MdClose className="h-4 w-4 text-slate-800" />
              </button>
              <button
                type="button"
                data-testid="submit-edit-message-button"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-slate-700 transition-colors hover:bg-green-400"
                onClick={handleEditMessage}
              >
                <IoCheckmark className="h-5 w-5 text-slate-800" />
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`font-normal wrap-break-word text-slate-800 ${isCurrentUser ? "text-slate-800" : "text-slate-800 dark:text-slate-100"} ${isSingleEmoji ? "text-center text-2xl" : "text-xs"}`}
          >
            {message.isDeleted ? (
              <span className="flex items-center gap-0.5 font-medium text-slate-600 italic">
                <FaBan className="h-3 w-3" />
                This message was deleted.
              </span>
            ) : (
              message.content
            )}
          </p>
        )}
        <div
          className={`flex ${isEdited && !message.isDeleted ? "justify-between" : "justify-end"}`}
        >
          {isEdited && !message.isDeleted && (
            <p
              className={`my-1 text-end ${isEditing ? "text-xs" : "text-[10px]"} ${
                isCurrentUser
                  ? "text-slate-700"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            >
              Edited
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
        </div>
        <div
          className={`absolute bottom-0 border-t-16 border-t-transparent ${isCurrentUser ? "-right-2 border-l-16 border-l-green-300" : "-left-2 border-r-16 border-r-slate-200 dark:border-r-slate-700"}`}
        ></div>
      </motion.div>

      {canOpenMessageMenu && (
        <div className="relative cursor-auto">
          <MessageMenu
            handleOpenEditModal={handleOpenEditModal}
            handleDeleteMessage={handleDeleteMessage}
            isMessageMenuOpen={isMessageMenuOpen}
            setIsMessageMenuOpen={setIsMessageMenuOpen}
          />
        </div>
      )}

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

export { NotificationMessage };
export default ChatMessage;
