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
