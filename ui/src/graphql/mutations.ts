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
