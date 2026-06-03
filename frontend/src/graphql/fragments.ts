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
