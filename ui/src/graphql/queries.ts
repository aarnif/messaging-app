import { gql } from "../__generated__/gql";

export const ME = gql(`
  query Me {
    me {
      id
      username
      name
      about
      avatar
    }
  }
`);

export const ALL_CHATS_BY_USER = gql(`query AllChatsByUser($search: String) {
  allChatsByUser(search: $search) {
    id
    name
    avatar
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

export const ALL_CONTACTS_BY_USER =
  gql(`query AllContactsByUser($search: String) {
  allContactsByUser(search: $search) {
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

export const FIND_CHAT_BY_ID = gql(`query FindChatById($id: ID!) {
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
      about
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
