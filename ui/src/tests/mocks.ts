import { ME } from "../graphql/queries";
import { CREATE_USER, LOGIN } from "../graphql/mutations";
import type { MockLink } from "@apollo/client/testing";
import { vi } from "vitest";

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

export const meMock: MockLink.MockedResponse = {
  request: {
    query: ME,
  },
  result: {
    data: {
      me: currentUserMock,
    },
  },
};

export const meNullMock: MockLink.MockedResponse = {
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

export const createUserMock = {
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

export const createUserErrorMock = {
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

export const loginMock = {
  request: {
    query: LOGIN,
    variables: {
      input: loginInput,
    },
  },
  result: {
    data: {
      login: {
        value: "fake-token-12345",
      },
    },
  },
};

export const loginErrorMock = {
  request: {
    query: LOGIN,
    variables: {
      input: { ...loginInput, password: "passwor" },
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
