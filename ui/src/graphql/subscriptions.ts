import { gql } from "../__generated__/gql";

export const MESSAGE_SENT = gql(`
  subscription MessageSent {
    messageSent {
      id
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
`);

export const USER_CHAT_UPDATED = gql(`
  subscription UserChatUpdated {
    userChatUpdated {
      id
      name
      avatar
      latestMessage {
        id
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
