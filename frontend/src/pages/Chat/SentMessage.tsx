import { useMutation } from "@apollo/client/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaBan } from "react-icons/fa";
import type { Message, User } from "../../__generated__/graphql";
import { DELETE_MESSAGE, EDIT_MESSAGE } from "../../graphql/mutations";
import { checkIfMessageIsSingleEmoji, formatDisplayDate } from "../../helpers";
import EditMessageModal from "./EditMessageModal";
import MessageMenu from "./MessageMenu";

const SentMessage = ({
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
  const [isDeleting, setIsDeleting] = useState(false);
  const senderName = "You";
  const isLatestMessage = message.id === latestAddedMessageId;
  const isSingleEmoji = checkIfMessageIsSingleEmoji(message.content);
  const isEdited =
    message.updatedAt !== message.createdAt && !message.isDeleted;
  const editMessageLayoutId = `edit-message-${message.id}`;

  const [editMessage] = useMutation(EDIT_MESSAGE, {
    onError: (error) => {
      console.log(error);
    },
  });

  const [deleteMessage] = useMutation(DELETE_MESSAGE, {
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
      handleCancel();
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
    setIsDeleting(false);
  };

  const canOpenMessageMenu = !isEditing && !message.isDeleted;

  return (
    <div className="flex flex-col items-end">
      <AnimatePresence>
        {(isEditing || isMessageMenuOpen) && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
          />
        )}
      </AnimatePresence>
      <motion.div
        layoutId={editMessageLayoutId}
        onClick={
          canOpenMessageMenu
            ? () => setIsMessageMenuOpen(!isMessageMenuOpen)
            : undefined
        }
        data-testid="sent-message"
        className={`relative flex max-w-62.5 min-w-25 flex-col rounded-lg bg-green-300 px-2 pt-2 sm:max-w-150 ${isLatestMessage && "animate-pop-in"} ${canOpenMessageMenu && !isMessageMenuOpen && "cursor-pointer"} ${(isMessageMenuOpen || isDeleting) && "z-50 -translate-y-2 scale-105"} ${isEditing && "invisible"}`}
      >
        <h3 className="font-semibold text-xs text-slate-900">{senderName}</h3>

        <p
          className={`font-normal wrap-break-word text-slate-800 ${isSingleEmoji ? "text-center text-2xl" : "text-xs"}`}
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

        <div className={`flex ${isEdited ? "justify-between" : "justify-end"}`}>
          {isEdited && (
            <p className="my-1 text-end text-[10px] text-slate-700">Edited</p>
          )}

          <p className="my-1 text-end text-[10px] text-slate-700">
            {formatDisplayDate(message?.createdAt, currentUser.is24HourClock)}
          </p>
        </div>
        <div className="absolute bottom-0 -right-2 border-l-16 border-l-green-300 border-t-16 border-t-transparent"></div>
      </motion.div>

      {isMessageMenuOpen && (
        <div className="relative cursor-auto">
          <MessageMenu
            handleOpenEditModal={handleOpenEditModal}
            handleDeleteMessage={handleDeleteMessage}
            setIsMessageMenuOpen={setIsMessageMenuOpen}
            setIsDeleting={setIsDeleting}
          />
        </div>
      )}

      {isEditing && (
        <EditMessageModal
          layoutId={editMessageLayoutId}
          editedContent={editedContent}
          onContentChange={setEditedContent}
          onCancel={handleCancel}
          onSubmit={handleEditMessage}
        />
      )}
    </div>
  );
};

export default SentMessage;
