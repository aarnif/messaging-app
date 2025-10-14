import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import SignUp from "../components/SignUp";
import { CREATE_USER, LOGIN } from "../graphql/mutations";

const NEW_USER_DETAILS = {
  username: "user1",
  password: "password",
  confirmPassword: "password",
};

const USERNAME_TOO_SHORT = {
  ...NEW_USER_DETAILS,
  username: "us",
};

const PASSWORD_TOO_SHORT = {
  ...NEW_USER_DETAILS,
  password: "pass",
  confirmPassword: "pass",
};

const PASSWORDS_DO_NOT_MATCH = {
  ...NEW_USER_DETAILS,
  password: "password",
  confirmPassword: "passwor",
};

const createUserMock = {
  request: {
    query: CREATE_USER,
    variables: {
      input: NEW_USER_DETAILS,
    },
  },
  result: {
    data: {
      createUser: {
        id: "1",
        username: NEW_USER_DETAILS.username,
        name: NEW_USER_DETAILS.username[0] + NEW_USER_DETAILS.username.slice(1),
        about: null,
        avatar: null,
      },
    },
  },
};

const createUserErrorMock = {
  request: {
    query: CREATE_USER,
    variables: {
      input: NEW_USER_DETAILS,
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

const loginMock = {
  request: {
    query: LOGIN,
    variables: {
      input: {
        username: NEW_USER_DETAILS.username,
        password: NEW_USER_DETAILS.password,
      },
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

const mockClient = {
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

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@apollo/client/react", async () => {
  const actual = await vi.importActual("@apollo/client/react");
  return {
    ...actual,
    useApolloClient: () => mockClient,
  };
});

Object.defineProperty(global, "localStorage", { value: localStorage });

const renderComponent = (mocks = [createUserMock]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    </MockedProvider>
  );

describe("<SignUp />", () => {
  test("renders component", () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: "Sign Up" })).toBeDefined();
    expect(screen.getByLabelText("Username")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
    expect(screen.getByLabelText("Confirm Password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Return to Sign In" })
    ).toBeDefined();
  });

  test("displays error if inputs field are empty", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    const errorMessage = await screen.findByText("Please fill all fields.");
    expect(errorMessage).toBeDefined();

    await waitForElementToBeRemoved(
      () => screen.queryByText("Please fill all fields."),
      { timeout: 3500 }
    );
  });

  test("displays error if username is too short", async () => {
    const user = userEvent.setup();

    const { username, password, confirmPassword } = USERNAME_TOO_SHORT;

    renderComponent();

    await user.type(screen.getByLabelText("Username"), username);
    await user.type(screen.getByLabelText("Password"), password);
    await user.type(screen.getByLabelText("Confirm Password"), confirmPassword);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(
        screen.getByText("Username must be at least 3 characters long")
      ).toBeDefined();
    });

    await waitForElementToBeRemoved(
      () => screen.queryByText("Username must be at least 3 characters long"),
      { timeout: 3500 }
    );
  });

  test("displays error if password is too short", async () => {
    const user = userEvent.setup();

    const { username, password, confirmPassword } = PASSWORD_TOO_SHORT;

    renderComponent();

    await user.type(screen.getByLabelText("Username"), username);
    await user.type(screen.getByLabelText("Password"), password);
    await user.type(screen.getByLabelText("Confirm Password"), confirmPassword);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 6 characters long")
      ).toBeDefined();
    });

    await waitForElementToBeRemoved(
      () => screen.queryByText("Password must be at least 6 characters long"),
      { timeout: 3500 }
    );
  });

  test("displays error if passwords do not match", async () => {
    const user = userEvent.setup();

    const { username, password, confirmPassword } = PASSWORDS_DO_NOT_MATCH;

    renderComponent();

    await user.type(screen.getByLabelText("Username"), username);
    await user.type(screen.getByLabelText("Password"), password);
    await user.type(screen.getByLabelText("Confirm Password"), confirmPassword);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeDefined();
    });

    await waitForElementToBeRemoved(
      () => screen.queryByText("Passwords do not match"),
      { timeout: 3500 }
    );
  });

  test("displays error if username already exists", async () => {
    const user = userEvent.setup();

    const { username, password, confirmPassword } = NEW_USER_DETAILS;

    renderComponent([createUserErrorMock]);

    await user.type(screen.getByLabelText("Username"), username);
    await user.type(screen.getByLabelText("Password"), password);
    await user.type(screen.getByLabelText("Confirm Password"), confirmPassword);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    await waitFor(() => {
      expect(screen.getByText("Username already exists")).toBeDefined();
    });

    await waitForElementToBeRemoved(
      () => screen.queryByText("Username already exists"),
      { timeout: 3500 }
    );
  });

  test("signs up user successfully", async () => {
    const user = userEvent.setup();

    const { username, password, confirmPassword } = NEW_USER_DETAILS;

    renderComponent([createUserMock, loginMock]);

    await user.type(screen.getByLabelText("Username"), username);
    await user.type(screen.getByLabelText("Password"), password);
    await user.type(screen.getByLabelText("Confirm Password"), confirmPassword);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "token",
        loginMock.result.data.login.value
      );
    });

    expect(mockClient.resetStore).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/chats");
  });
});
