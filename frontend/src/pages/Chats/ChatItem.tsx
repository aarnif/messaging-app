import type { User, UserChat } from "../../__generated__/graphql";
import { formatDisplayDate, getChatName, truncateText } from "../../helpers";

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
    currentUser?.is24HourClock,
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

export default ChatItem;
