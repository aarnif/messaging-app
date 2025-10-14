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
