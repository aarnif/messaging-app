import { gql } from "../__generated__/gql";

export const USER_INFO = gql(`
  fragment UserInfo on User {
    id
    username
    name
    about
    avatar
    is24HourClock
    isDarkMode
  }
`);

export const CONTACT_INFO = gql(`
  fragment ContactInfo on Contact {
    id
    isBlocked
    contactDetails {
      ...UserInfo
    }
  }
`);

export const CHAT_MEMBER_INFO = gql(`
  fragment ChatMemberInfo on ChatMember {
    id
    userId
    username
    name
    about
    avatar
    isAdmin
    is24HourClock
    isDarkMode
    unreadCount
  }
`);

export const MESSAGE_INFO = gql(`
  fragment MessageInfo on Message {
    id
    chatId
    isNotification
    isDeleted
    sender {
      ...UserInfo
    }
    content
    createdAt
    updatedAt
  }
`);

export const CHAT_ITEM_INFO = gql(`
  fragment ChatItemInfo on ChatItem {
    id
    isGroupChat
    name
    avatar
    unreadCount
    members {
      ...ChatMemberInfo
    }
    latestMessage {
      ...MessageInfo
    }
  }
`);

export const CHAT_INFO = gql(`
  fragment ChatInfo on Chat {
    id
    isGroupChat
    name
    description
    avatar
    members {
      ...ChatMemberInfo
    }
    messages {
      ...MessageInfo
    }
  }
`);
