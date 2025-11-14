export const COUNT_DOCUMENTS = `
  query CountDocuments {
    countDocuments
  }
`;

export const CREATE_USER = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      username
      name
      about
      avatar
      is24HourClock
    }
  }
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
      id
      username
      name
      about
      avatar
      is24HourClock
    }
  }
`;

export const ADD_CONTACT = `
  mutation AddContact($id: ID!) {
    addContact(id: $id) {
      id
      isBlocked
      contactDetails {
        id
        username
        name
        about
        avatar
        is24HourClock
      }
    }
  }
`;

export const ADD_CONTACTS = `
  mutation AddContacts($ids: [ID!]!) {
    addContacts(ids: $ids) {
      id
      isBlocked
      contactDetails {
        id
        username
        name
        about
        avatar
        is24HourClock
      }
    }
  }
`;

export const REMOVE_CONTACT = `
  mutation RemoveContact($id: ID!) {
    removeContact(id: $id) {
      id
      isBlocked
      contactDetails {
        id
        username
        name
        about
        avatar
        is24HourClock
      }
    }
  }
`;

export const CREATE_CHAT = `
  mutation CreateChat($input: CreateChatInput!) {
    createChat(input: $input) {
      id
      type
      name
      description
      avatar
      members {
        id
        username
        name
        avatar
        role
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
`;

export const EDIT_CHAT = `
  mutation EditChat($input: EditChatInput!) {
    editChat(input: $input) {
      id
      type
      name
      description
      avatar
      members {
        id
        username
        name
        avatar
        role
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
`;

export const DELETE_CHAT = `
  mutation DeleteChat($id: ID!) {
    deleteChat(id: $id) {
      id
      type
      name
      description
      avatar
      members {
        id
        username
        name
        avatar
        role
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
`;

export const TOGGLE_BLOCK_CONTACT = `
  mutation ToggleBlockContact($id: ID!) {
    toggleBlockContact(id: $id) {
      id
      isBlocked
      contactDetails {
        id
        username
        name
        about
        avatar
        is24HourClock
      }
    }
  }
`;

export const SEND_MESSAGE = `
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      type
      name
      description
      avatar
      members {
        id
        username
        name
        avatar
        role
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
`;

export const LEAVE_CHAT = `
  mutation LeaveChat($id: ID!) {
    leaveChat(id: $id) {
      id
      type
      name
      description
      avatar
      members {
        id
        username
        name
        avatar
        role
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
`;

export const EDIT_PROFILE = `
  mutation EditProfile($input: EditProfileInput!) {
    editProfile(input: $input) {
      id
      username
      name
      about
      avatar
      is24HourClock
    }
  }
`;

export const FIND_USER_BY_ID = `
  query FindUserById($id: ID!) {
    findUserById(id: $id) {
      id
      username
      name
      about
      avatar
      is24HourClock
    }
  }
`;

export const FIND_CHAT_BY_ID = `
  query FindChatById($id: ID!) {
    findChatById(id: $id) {
      id
      type
      name
      description
      avatar
      members {
        id
        username
        name
        avatar
        role
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
`;

export const IS_BLOCKED_BY_USER = `
  query IsBlockedByUser($id: ID!) {
    isBlockedByUser(id: $id) 
  }
`;

export const ALL_CONTACTS_BY_USER = `
  query AllContactsByUser($search: String) {
    allContactsByUser(search: $search) {
      id
      isBlocked
      contactDetails {
        id
        username
        name
        about
        avatar
        is24HourClock
      }
    }
  }
`;

export const CONTACTS_WITHOUT_PRIVATE_CHAT = `
  query ContactsWithoutPrivateChat($search: String) {
    contactsWithoutPrivateChat(search: $search) {
      id
      isBlocked
      contactDetails {
        id
        username
        name
        about
        avatar
        is24HourClock
      }
    }
  }
`;

export const ALL_CHATS_BY_USER = `
  query AllChatsByUser($search: String) {
    allChatsByUser(search: $search) {
      id
      name
      avatar
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
`;

export const FIND_CONTACT_BY_ID = `
  query FindContactById($id: ID!) {
    findContactById(id: $id) {
      id
      isBlocked
      contactDetails {
        id
        username
        name
        about
        avatar
        is24HourClock
      }
    }
  }
`;

export const FIND_PRIVATE_CHAT_WITH_CONTACT = `
  query FindPrivateChatWithContact($id: ID!) {
    findPrivateChatWithContact(id: $id) {
      id
      type
      name
      description
      avatar
      members {
        id
        username
        name
        avatar
        about
        role
      }
    }
  }
`;

export const CHANGE_PASSWORD = `mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input) {
    id
    username
    name
    about
    avatar
    is24HourClock
  }
}`;

export const FIND_CONTACT_BY_USER_ID = `
  query FindContactByUserId($id: ID!) {
    findContactByUserId(id: $id) {
      id
      isBlocked
      contactDetails {
        id
        username
        name
        about
        avatar
        is24HourClock
      }
    }
  }
`;
