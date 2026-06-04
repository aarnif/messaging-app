const USER_INFO = `
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

const CONTACT_INFO = `
  fragment ContactInfo on Contact {
    id
    isBlocked
    contactDetails {
      ...UserInfo
    }
  }
  ${USER_INFO}
`;

const CHAT_MEMBER_INFO = `
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

export const COUNT_DOCUMENTS = `
  query CountDocuments {
    countDocuments
  }
`;

export const CREATE_USER = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      ...UserInfo
    }
  }
  ${USER_INFO}
`;

export const LOGIN = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      value
    }
  }
`;

export const ME = `
  query Me {
    me {
      ...UserInfo
    }
  }
  ${USER_INFO}
`;

export const ADD_CONTACT = `
  mutation AddContact($id: ID!) {
    addContact(id: $id) {
      ...ContactInfo
    }
  }
  ${CONTACT_INFO}
`;

export const ADD_CONTACTS = `
  mutation AddContacts($ids: [ID!]!) {
    addContacts(ids: $ids) {
      ...ContactInfo
    }
  }
  ${CONTACT_INFO}
`;

export const REMOVE_CONTACT = `
  mutation RemoveContact($id: ID!) {
    removeContact(id: $id) {
      ...ContactInfo
    }
  }
  ${CONTACT_INFO}
`;

export const CREATE_CHAT = `
  mutation CreateChat($input: CreateChatInput!) {
    createChat(input: $input) {
      id
      isGroupChat
      name
      description
      avatar
      members {
        ...ChatMemberInfo
      }
      messages {
        id
        isNotification
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
  ${CHAT_MEMBER_INFO}
`;

export const EDIT_CHAT = `
  mutation EditChat($input: EditChatInput!) {
    editChat(input: $input) {
      id
      isGroupChat
      name
      description
      avatar
      members {
        ...ChatMemberInfo
      }
      messages {
        id
        isNotification
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
  ${CHAT_MEMBER_INFO}
`;

export const DELETE_CHAT = `
  mutation DeleteChat($id: ID!) {
    deleteChat(id: $id) {
      id
      isGroupChat
      name
      description
      avatar
      members {
        ...ChatMemberInfo
      }
      messages {
        id
        isNotification
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
  ${CHAT_MEMBER_INFO}
`;

export const TOGGLE_BLOCK_CONTACT = `
  mutation ToggleBlockContact($id: ID!) {
    toggleBlockContact(id: $id) {
      ...ContactInfo
    }
  }
  ${CONTACT_INFO}
`;

export const SEND_MESSAGE = `
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      isGroupChat
      name
      description
      avatar
      members {
        ...ChatMemberInfo
      }
      messages {
        id
        isNotification
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
  ${CHAT_MEMBER_INFO}
`;

export const EDIT_MESSAGE = `
  mutation EditMessage($input: EditMessageInput!) {
    editMessage(input: $input) {
      id
      isGroupChat
      name
      description
      avatar
      members {
        ...ChatMemberInfo
      }
      messages {
        id
        isNotification
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
  ${CHAT_MEMBER_INFO}
`;

export const DELETE_MESSAGE = `
  mutation DeleteMessage($id: ID!) {
    deleteMessage(id: $id) {
      id
      isGroupChat
      name
      description
      avatar
      members {
        ...ChatMemberInfo
      }
      messages {
        id
        isNotification
        isDeleted
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
  ${CHAT_MEMBER_INFO}
`;

export const LEAVE_CHAT = `
  mutation LeaveChat($id: ID!) {
    leaveChat(id: $id) {
      id
      isGroupChat
      name
      description
      avatar
      members {
        ...ChatMemberInfo
      }
      messages {
        id
        isNotification
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
  ${CHAT_MEMBER_INFO}
`;

export const EDIT_PROFILE = `
  mutation EditProfile($input: EditProfileInput!) {
    editProfile(input: $input) {
      ...UserInfo
    }
  }
  ${USER_INFO}
`;

export const FIND_CHAT_BY_ID = `
  query FindChatById($id: ID!) {
    findChatById(id: $id) {
      id
      isGroupChat
      name
      description
      avatar
      members {
        ...ChatMemberInfo
      }
      messages {
        id
        isNotification
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
  ${CHAT_MEMBER_INFO}
`;

export const IS_BLOCKED_BY_USER = `
  query IsBlockedByUser($id: ID!) {
    isBlockedByUser(id: $id)
  }
`;

export const ALL_CONTACTS_BY_USER = `
  query AllContactsByUser($search: String) {
    allContactsByUser(search: $search) {
      ...ContactInfo
    }
  }
  ${CONTACT_INFO}
`;

export const CONTACTS_WITHOUT_PRIVATE_CHAT = `
  query ContactsWithoutPrivateChat($search: String) {
    contactsWithoutPrivateChat(search: $search) {
      ...ContactInfo
    }
  }
  ${CONTACT_INFO}
`;

export const ALL_CHATS_BY_USER = `
  query AllChatsByUser($search: String) {
    allChatsByUser(search: $search) {
      id
      name
      isGroupChat
      avatar
      unreadCount
      members {
        ...ChatMemberInfo
      }
      latestMessage {
        id
        isNotification
        sender {
          id
          username
          name
        }
        content
        createdAt
      }
    }
  }
  ${CHAT_MEMBER_INFO}
`;

export const FIND_CONTACT_BY_ID = `
  query FindContactById($id: ID!) {
    findContactById(id: $id) {
      ...ContactInfo
    }
  }
  ${CONTACT_INFO}
`;

export const FIND_PRIVATE_CHAT_WITH_CONTACT = `
  query FindPrivateChatWithContact($id: ID!) {
    findPrivateChatWithContact(id: $id) {
      id
      isGroupChat
      name
      description
      avatar
      members {
        ...ChatMemberInfo
      }
    }
  }
  ${CHAT_MEMBER_INFO}
`;

export const CHANGE_PASSWORD = `
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      ...UserInfo
    }
  }
  ${USER_INFO}
`;

export const FIND_CONTACT_BY_USER_ID = `
  query FindContactByUserId($id: ID!) {
    findContactByUserId(id: $id) {
      ...ContactInfo
    }
  }
  ${CONTACT_INFO}
`;

export const MARK_CHAT_AS_READ = `
  mutation MarkChatAsRead($id: ID!) {
    markChatAsRead(id: $id)
  }
`;

export const NON_CONTACT_USERS = `
  query NonContactUsers($search: String) {
    nonContactUsers(search: $search) {
      ...UserInfo
    }
  }
  ${USER_INFO}
`;
