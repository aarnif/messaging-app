import { gql } from "../__generated__/gql";

export const MESSAGE_SENT = gql(`
  subscription MessageSent {
    messageSent {
      id
      chatId
      isNotification
      sender {
        id
        username
        name
        about
        avatar
        is24HourClock
      }
      content
      createdAt
    }
  }
`);

export const USER_CHAT_UPDATED = gql(`
  subscription UserChatUpdated {
    userChatUpdated {
      id
      type
      name
      avatar
      unreadCount
      userId
      members {
        id
        username
        name
        about
        avatar
        is24HourClock
        role
        unreadCount
      }
      latestMessage {
        id
        chatId
        isNotification
        sender {
          id
          username
          name
          about
          avatar
          is24HourClock
        }
        content
        createdAt
      }
    }
}`);

export const USER_CHAT_CREATED = gql(`
  subscription UserChatCreated {
    userChatCreated {
      id
      type
      name
      avatar
      unreadCount
      userId
      members {
        id
        username
        name
        about
        avatar
        is24HourClock
        role
        unreadCount
      }
      latestMessage {
        id
        chatId
        isNotification
        sender {
          id
          username
          name
          about
          avatar
          is24HourClock
        }
        content
        createdAt
      }
    }
}`);

export const USER_CHAT_DELETED = gql(`
  subscription UserChatDeleted {
    userChatDeleted
}`);

export const USER_CHAT_LEFT = gql(`
  subscription UserChatLeft  {
    userChatLeft {
      chatId
      memberId
    }
}`);
