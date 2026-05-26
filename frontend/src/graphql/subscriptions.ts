import { gql } from "../__generated__/gql";

export const MESSAGE_SENT = gql(`
  subscription MessageSent {
    messageSent {
      id
      chatId
      isNotification
      isDeleted
      sender {
        id
        username
        name
        about
        avatar
        is24HourClock
        isDarkMode
      }
      content
      createdAt
      updatedAt
    }
  }
`);

export const MESSAGE_EDITED = gql(`
  subscription MessageEdited {
    messageEdited {
      id
      chatId
      isNotification
      isDeleted
      sender {
        id
        username
        name
        about
        avatar
        is24HourClock
        isDarkMode
      }
      content
      createdAt
      updatedAt
    }
  }
`);

export const MESSAGE_DELETED = gql(`
  subscription MessageDeleted {
    messageDeleted {
      id
      chatId
      isNotification
      isDeleted
      sender {
        id
        username
        name
        about
        avatar
        is24HourClock
        isDarkMode
      }
      content
      createdAt
      updatedAt
    }
  }
`);

export const CHAT_ITEM_UPDATED = gql(`
  subscription ChatItemUpdated {
    chatItemUpdated {
      id
      isGroupChat
      name
      avatar
      unreadCount
      userId
      members {
        id
        userId
        username
        name
        about
        avatar
        is24HourClock
        isDarkMode
        isAdmin
        unreadCount
      }
      latestMessage {
        id
        chatId
        isNotification
        isDeleted
        sender {
          id
          username
          name
          about
          avatar
          is24HourClock
          isDarkMode
        }
        content
        createdAt
        updatedAt
      }
    }
}`);

export const CHAT_ITEM_CREATED = gql(`
  subscription ChatItemCreated {
    chatItemCreated {
      id
      isGroupChat
      name
      avatar
      unreadCount
      userId
      members {
        id
        userId
        username
        name
        about
        avatar
        is24HourClock
        isDarkMode
        isAdmin
        unreadCount
      }
      latestMessage {
        id
        chatId
        isNotification
        isDeleted
        sender {
          id
          username
          name
          about
          avatar
          is24HourClock
          isDarkMode
        }
        content
        createdAt
        updatedAt
      }
    }
}`);

export const CHAT_ITEM_DELETED = gql(`
  subscription ChatItemDeleted {
    chatItemDeleted
}`);

export const CHAT_ITEM_LEFT = gql(`
  subscription ChatItemLeft  {
    chatItemLeft {
      chatId
      memberId
    }}`);

export const CHAT_EDITED = gql(`
  subscription ChatEdited {
    chatEdited {
      id
      isGroupChat
      name
      description
      avatar
      members {
        id
        userId
        username
        name
        about
        avatar
        is24HourClock
        isDarkMode
        isAdmin
        unreadCount
      }
      messages {
        id
        chatId
        isNotification
        isDeleted
        sender {
          id
          username
          name
          about
          avatar
          is24HourClock
          isDarkMode
        }
        content
        createdAt
        updatedAt
      }
    }
}`);
