import { gql } from "../__generated__/gql";

export const USER_INFO = gql(`
  fragment UserInfo on User {
    id
    username
    name
    about
    avatar
    is24HourClock
    isDarkMode
  }
`);

export const CONTACT_INFO = gql(`
  fragment ContactInfo on Contact {
    id
    isBlocked
    contactDetails {
      ...UserInfo
    }
  }
`);
