import { useEffect, useRef } from "react";
import type { Message, User } from "../../__generated__/graphql";
import NotificationMessage from "./NotificationMessage";
import ReceivedMessage from "./ReceivedMessage";
import SentMessage from "./SentMessage";

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
      {messages.map((message) => {
        if (message.isNotification) {
          return <NotificationMessage key={message.id} message={message} />;
        }

        const isSentMessage = message.sender.id === currentUser.id;

        return isSentMessage ? (
          <SentMessage
            key={message.id}
            currentUser={currentUser}
            message={message}
            latestAddedMessageId={latestAddedMessageId}
          />
        ) : (
          <ReceivedMessage
            key={message.id}
            currentUser={currentUser}
            message={message}
            latestAddedMessageId={latestAddedMessageId}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
