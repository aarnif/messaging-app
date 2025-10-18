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
