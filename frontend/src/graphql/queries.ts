import { gql } from "../__generated__/gql";

export const ME = gql(`
  query Me {
    me {
      ...UserInfo
    }
  }
`);

export const ALL_CHATS_BY_USER = gql(`query AllChatsByUser($search: String) {
  allChatsByUser(search: $search) {
    ...ChatItemInfo
  }
}`);

export const ALL_CONTACTS_BY_USER =
  gql(`query AllContactsByUser($search: String) {
  allContactsByUser(search: $search) {
    ...ContactInfo
  }
}`);

export const FIND_CHAT_BY_ID = gql(`query FindChatById($id: ID!) {
  findChatById(id: $id) {
    ...ChatInfo
  }
}`);

export const CONTACTS_WITHOUT_PRIVATE_CHAT =
  gql(`query ContactsWithoutPrivateChat($search: String) {
  contactsWithoutPrivateChat(search: $search) {
    ...ContactInfo
  }
}`);

export const FIND_CONTACT_BY_ID = gql(`query FindContactById($id: ID!) {
  findContactById(id: $id) {
    ...ContactInfo
  }
}`);

export const FIND_PRIVATE_CHAT_WITH_CONTACT =
  gql(`query FindPrivateChatWithContact($id: ID!) {
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
}`);

export const IS_BLOCKED_BY_USER = gql(`query IsBlockedByUser($id: ID!) {
  isBlockedByUser(id: $id)
}`);

export const NON_CONTACT_USERS = gql(`query NonContactUsers($search: String) {
  nonContactUsers(search: $search) {
    ...UserInfo
  }
}`);

export const FIND_CONTACT_BY_USER_ID =
  gql(`query FindContactByUserId($id: ID!) {
  findContactByUserId(id: $id) {
    ...ContactInfo
  }
}`);
