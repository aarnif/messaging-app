import { format, isToday, isThisWeek } from "date-fns";
import type { ApolloCache } from "@apollo/client";
import emojiRegex from "emoji-regex";
import type { UserChat, User, Chat } from "./__generated__/graphql";
import { ALL_CHATS_BY_USER, FIND_CHAT_BY_ID } from "./graphql/queries";

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

export const isValidChatForUser = (
  chat: UserChat | undefined | null,
  currentUser: User | undefined | null
): chat is UserChat => {
  if (!chat || !currentUser || chat.userId !== currentUser.id) {
    console.log("Skipping cache update");
    return false;
  }
  return true;
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

export const updateChatByIdCache = (
  cache: ApolloCache,
  chatId: string,
  updateFn: (chat: Chat) => Chat
) => {
  cache.updateQuery(
    {
      query: FIND_CHAT_BY_ID,
      variables: { id: chatId },
    },
    (existingData) => {
      if (!existingData?.findChatById) {
        console.log("No existing chat data found in cache");
        return existingData;
      }
      return {
        findChatById: updateFn(existingData.findChatById),
      };
    }
  );
};

export const checkIfMessageIsSingleEmoji = (content: string) => {
  const regex = emojiRegex();
  let numberOfEmojis = 0;
  let numberofEmojiCharacters = 0;
  for (const match of content.matchAll(regex)) {
    const emoji = match[0];
    numberOfEmojis += 1;
    numberofEmojiCharacters += emoji.length;
  }

  return numberofEmojiCharacters === content.length && numberOfEmojis === 1;
};
