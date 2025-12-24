import { gql } from "../__generated__/gql";

export const ME = gql(`
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
`);

export const ALL_CHATS_BY_USER = gql(`query AllChatsByUser($search: String) {
  allChatsByUser(search: $search) {
    id
    type
    name
    avatar
    members {
      id
      username
      name
      about
      avatar
      is24HourClock
      unreadCount
    }
    latestMessage {
      id
      chatId
      isNotification
      sender {
        id
        username
        name
        about
        avatar
        is24HourClock
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
      is24HourClock
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
      is24HourClock
    }
    messages {
      id
      chatId
      isNotification
      sender {
        id
        username
        name
        about
        avatar
        is24HourClock
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
      is24HourClock
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
      is24HourClock
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
      is24HourClock
    }
  }
}`);

export const IS_BLOCKED_BY_USER = gql(`query IsBlockedByUser($id: ID!) {
  isBlockedByUser(id: $id)
}`);

export const NON_CONTACT_USERS = gql(`query NonContactUsers($search: String) {
  nonContactUsers(search: $search) {
    id
    username
    name
    about
    avatar
    is24HourClock
  }
}`);

export const FIND_CONTACT_BY_USER_ID =
  gql(`query FindContactByUserId($id: ID!) {
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
}`);
