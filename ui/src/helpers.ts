import { format, isToday, isThisWeek } from "date-fns";
import type { ApolloCache } from "@apollo/client";
import type { UserChat } from "./__generated__/graphql";
import { ALL_CHATS_BY_USER } from "./graphql/queries";

export const formatDisplayDate = (
  messageTime: number,
  is24HourClock: boolean = true
): string | null => {
  if (!messageTime) {
    return null;
  }

  const date = new Date(messageTime);

  if (isToday(date)) {
    return format(date, is24HourClock ? "HH:mm" : "hh:mm a");
  }

  if (isThisWeek(date)) {
    return format(date, "EEEE");
  }

  return format(date, "dd.MM.yyyy");
};

export const truncateText = (text: string, maxLength: number = 20): string =>
  text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

export const getChatName = (chat: UserChat, currentUserId: string): string => {
  if (chat.type === "group") {
    return chat.name || "Group Chat";
  }

  const otherMember = chat.members?.find(
    (member) => member.id !== currentUserId
  );
  return otherMember?.name || "Private Chat";
};

const sortChatsByLatestMessage = (chats: UserChat[]) =>
  chats.sort((a, b) => b.latestMessage.createdAt - a.latestMessage.createdAt);

export const updateUserChatsCache = (
  cache: ApolloCache,
  searchValue: string,
  updateFn: (chats: UserChat[]) => UserChat[]
) => {
  cache.updateQuery(
    {
      query: ALL_CHATS_BY_USER,
      variables: { search: searchValue },
    },
    (existingData) => {
      if (!existingData?.allChatsByUser) {
        console.log("No existing chat data found in cache");
        return existingData;
      }
      return {
        allChatsByUser: sortChatsByLatestMessage(
          updateFn(existingData.allChatsByUser)
        ),
      };
    }
  );
};
