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
