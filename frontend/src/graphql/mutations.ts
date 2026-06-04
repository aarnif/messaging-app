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
      ...UserInfo
    }
  }
`);

export const SEND_MESSAGE =
  gql(`mutation SendMessage($input: SendMessageInput!) {
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
      ...MessageInfo
    }
  }
}`);

export const EDIT_MESSAGE =
  gql(`mutation EditMessage($input: EditMessageInput!) {
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
      ...MessageInfo
    }
  }
}`);

export const DELETE_MESSAGE = gql(`mutation DeleteMessage($id: ID!) {
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
      ...MessageInfo
    }
  }
}`);

export const CREATE_CHAT = gql(`mutation CreateChat($input: CreateChatInput!) {
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
      ...MessageInfo
    }
  }
}`);

export const EDIT_CHAT = gql(`mutation EditChat($input: EditChatInput!) {
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
      ...MessageInfo
    }
  }
}`);

export const LEAVE_CHAT = gql(`mutation LeaveChat($id: ID!) {
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
      ...MessageInfo
    }
  }
}`);

export const DELETE_CHAT = gql(`mutation DeleteChat($id: ID!) {
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
      ...MessageInfo
    }
  }
}`);

export const TOGGLE_BLOCK_CONTACT = gql(`mutation ToggleBlockContact($id: ID!) {
  toggleBlockContact(id: $id) {
    ...ContactInfo
  }
}`);

export const REMOVE_CONTACT = gql(`mutation RemoveContact($id: ID!) {
  removeContact(id: $id) {
    ...ContactInfo
  }
}`);

export const ADD_CONTACTS = gql(`mutation AddContacts($ids: [ID!]!) {
  addContacts(ids: $ids) {
    ...ContactInfo
  }
}`);

export const EDIT_PROFILE =
  gql(`mutation EditProfile($input: EditProfileInput!) {
  editProfile(input: $input) {
    ...UserInfo
  }
}
`);

export const CHANGE_PASSWORD =
  gql(`mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input) {
    ...UserInfo
  }
}`);

export const MARK_CHAT_AS_READ = gql(`
  mutation MarkChatAsRead($id: ID!) {
    markChatAsRead(id: $id)
  }
`);
