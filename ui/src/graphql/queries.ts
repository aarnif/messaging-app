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

export const CONTACTS_WITHOUT_PRIVATE_CHAT =
  gql(`query ContactsWithoutPrivateChat($search: String) {
  contactsWithoutPrivateChat(search: $search) {
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

export const FIND_CONTACT_BY_ID = gql(`query FindContactById($id: ID!) {
  findContactById(id: $id) {
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

export const FIND_PRIVATE_CHAT_WITH_CONTACT =
  gql(`query FindPrivateChatWithContact($id: ID!) {
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
      about
      avatar
      role
    }
  }
}`);
