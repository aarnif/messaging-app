import { ME } from "../graphql/queries";
import { CREATE_USER, LOGIN } from "../graphql/mutations";
import type { MockLink } from "@apollo/client/testing";
import type {
  MeQuery,
  MeQueryVariables,
  CreateUserMutation,
  CreateUserMutationVariables,
  LoginMutation,
  LoginMutationVariables,
} from "../__generated__/graphql";
import { vi } from "vitest";

export const LOGIN_TOKEN = "fake-token-12345";

export const NEW_USER_DETAILS = {
  id: "1",
  name: "User1",
  username: "user1",
  password: "password",
  confirmPassword: "password",
};

export const invalidUsername = {
  ...NEW_USER_DETAILS,
  username: "us",
};

export const invalidPassword = {
  ...NEW_USER_DETAILS,
  password: "pass",
  confirmPassword: "pass",
};

export const mismatchedPasswords = {
  ...NEW_USER_DETAILS,
  confirmPassword: "passwor",
};

const currentUserMock = {
  id: NEW_USER_DETAILS.id,
  username: NEW_USER_DETAILS.username,
  name: NEW_USER_DETAILS.name,
  about: null,
  avatar: null,
};

export const meMock: MockLink.MockedResponse<MeQuery, MeQueryVariables> = {
  request: {
    query: ME,
  },
  result: {
    data: {
      me: currentUserMock,
    },
  },
};

export const meNullMock: MockLink.MockedResponse<MeQuery, MeQueryVariables> = {
  request: {
    query: ME,
  },
  result: {
    data: {
      me: null,
    },
  },
};

export const createUserInput = {
  username: NEW_USER_DETAILS.username,
  password: NEW_USER_DETAILS.password,
  confirmPassword: NEW_USER_DETAILS.password,
};

export const createUserMock: MockLink.MockedResponse<
  CreateUserMutation,
  CreateUserMutationVariables
> = {
  request: {
    query: CREATE_USER,
    variables: {
      input: createUserInput,
    },
  },
  result: {
    data: {
      createUser: currentUserMock,
    },
  },
};

export const createUserErrorMock: MockLink.MockedResponse<
  CreateUserMutation,
  CreateUserMutationVariables
> = {
  request: {
    query: CREATE_USER,
    variables: {
      input: createUserInput,
    },
  },
  result: {
    errors: [
      {
        message: "Username already exists",
      },
    ],
    data: {
      createUser: null,
    },
  },
};

export const loginInput = {
  username: NEW_USER_DETAILS.username,
  password: NEW_USER_DETAILS.password,
};

export const invalidLoginPassword = loginInput.password.slice(0, -1);

export const loginMock: MockLink.MockedResponse<
  LoginMutation,
  LoginMutationVariables
> = {
  request: {
    query: LOGIN,
    variables: {
      input: loginInput,
    },
  },
  result: {
    data: {
      login: {
        value: LOGIN_TOKEN,
      },
    },
  },
};

export const loginErrorMock: MockLink.MockedResponse<
  LoginMutation,
  LoginMutationVariables
> = {
  request: {
    query: LOGIN,
    variables: {
      input: { ...loginInput, password: invalidLoginPassword },
    },
  },
  result: {
    errors: [
      {
        message: "Invalid username or password",
      },
    ],
    data: {
      login: null,
    },
  },
};

export const mockClient = {
  resetStore: vi.fn(),
  refetchQueries: vi.fn(),
  query: vi.fn(),
  cache: {
    updateQuery: vi.fn(),
    readQuery: vi.fn(),
    evict: vi.fn(),
    identify: vi.fn(),
  },
};

export const mockNavigate = vi.fn();
