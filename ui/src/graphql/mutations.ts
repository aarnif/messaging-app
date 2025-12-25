import { gql } from "../__generated__/gql";

export const LOGIN = gql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      value
    }
  }
`);

export const CREATE_USER = gql(`
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
`);

export const SEND_MESSAGE =
  gql(`mutation SendMessage($input: SendMessageInput!) {
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
      sender {
        id
        username
        name
        about
        avatar
      }
      content
      createdAt
    }
  }
}`);

export const CREATE_CHAT = gql(`mutation CreateChat($input: CreateChatInput!) {
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
      sender {
        id
        username
        name
        about
        avatar
      }
      content
      createdAt
    }
  }
}`);

export const EDIT_CHAT = gql(`mutation EditChat($input: EditChatInput!) {
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
      sender {
        id
        username
        name
        about
        avatar
      }
      content
      createdAt
    }
  }
}`);

export const LEAVE_CHAT = gql(`mutation LeaveChat($id: ID!) {
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
      sender {
        id
        username
        name
        about
        avatar
      }
      content
      createdAt
    }
  }
}`);

export const DELETE_CHAT = gql(`mutation DeleteChat($id: ID!) {
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
      sender {
        id
        username
        name
        about
        avatar
      }
      content
      createdAt
    }
  }
}`);

export const TOGGLE_BLOCK_CONTACT = gql(`mutation ToggleBlockContact($id: ID!) {
  toggleBlockContact(id: $id) {
    id
    isBlocked
    contactDetails {
      id
      username
      name
      about
      avatar
    }
  }
}`);

export const REMOVE_CONTACT = gql(`mutation RemoveContact($id: ID!) {
  removeContact(id: $id) {
    id
    isBlocked
    contactDetails {
      id
      username
      name
      about
      avatar
    }
  }
}`);

export const ADD_CONTACTS = gql(`mutation AddContacts($ids: [ID!]!) {
  addContacts(ids: $ids) {
    id
    isBlocked
    contactDetails {
      id
      username
      name
      about
      avatar
    }
  }
}`);

export const EDIT_PROFILE =
  gql(`mutation EditProfile($input: EditProfileInput!) {
  editProfile(input: $input) {
    id
    username
    name
    about
    avatar
    is24HourClock
  }
}
`);

export const CHANGE_PASSWORD =
  gql(`mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input) {
    id
    username
    name
    about
    avatar
    is24HourClock
  }
}`);

export const MARK_CHAT_AS_READ = gql(`
  mutation MarkChatAsRead($id: ID!) {
    markChatAsRead(id: $id)
  }
`);
