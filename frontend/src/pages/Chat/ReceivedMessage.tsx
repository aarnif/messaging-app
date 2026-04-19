import { motion } from "framer-motion";
import { FaBan } from "react-icons/fa";
import type { Message, User } from "../../__generated__/graphql";
import Avatar from "../../components/ui/Avatar";
import { checkIfMessageIsSingleEmoji, formatDisplayDate } from "../../helpers";

const ReceivedMessage = ({
  currentUser,
  message,
  latestAddedMessageId,
}: {
  currentUser: User;
  message: Message;
  latestAddedMessageId: string | null;
}) => {
  const isLatestMessage = message.id === latestAddedMessageId;
  const isSingleEmoji = checkIfMessageIsSingleEmoji(message.content);
  const isEdited =
    message.updatedAt !== message.createdAt && !message.isDeleted;

  return (
    <div className="flex flex-col items-start">
      <motion.div
        layout
        data-testid="received-message"
        className={`relative ml-8 flex max-w-62.5 min-w-25 flex-col rounded-lg bg-slate-200 px-2 pt-2 sm:max-w-150 dark:bg-slate-700 ${isLatestMessage && "animate-pop-in"}`}
      >
        <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-50">
          {message.sender.name}
        </h3>
        <p
          className={`font-normal wrap-break-word text-slate-800 ${isSingleEmoji ? "text-center text-2xl" : "text-xs"} dark:text-slate-100`}
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
            <p className="my-1 text-[10px] text-end text-slate-700 dark:text-slate-200">
              Edited
            </p>
          )}

          <p className="my-1 text-[10px] text-end text-slate-700 dark:text-slate-200">
            {formatDisplayDate(message?.createdAt, currentUser.is24HourClock)}
          </p>
        </div>
        <div className="absolute bottom-0 -left-2 border-r-16 border-r-slate-200 border-t-16 border-t-transparent dark:border-r-slate-700"></div>
      </motion.div>

      <div className="relative right-3 w-full">
        <Avatar
          name={message.sender.name}
          size="small"
          avatar={message.sender.avatar}
          isLatestMessage={isLatestMessage}
        />
      </div>
    </div>
  );
};

export default ReceivedMessage;
