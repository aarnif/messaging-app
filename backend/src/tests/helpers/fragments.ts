export const USER_INFO = `
  fragment UserInfo on User {
    id
    username
    name
    about
    avatar
    is24HourClock
    isDarkMode
  }
`;

export const CONTACT_INFO = `
  fragment ContactInfo on Contact {
    id
    isBlocked
    contactDetails {
      ...UserInfo
    }
  }
  ${USER_INFO}
`;

export const CHAT_MEMBER_INFO = `
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
`;

export const MESSAGE_INFO = `
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
  ${USER_INFO}
`;

export const CHAT_INFO = `
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
  ${CHAT_MEMBER_INFO}
  ${MESSAGE_INFO}
`;
