import type { Message } from "../../__generated__/graphql";

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

export default NotificationMessage;
