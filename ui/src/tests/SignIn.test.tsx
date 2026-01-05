import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import SignIn from "../components/SignIn";
import {
  LOGIN_TOKEN,
  loginInput,
  invalidLoginPassword,
  loginMock,
  loginErrorMock,
  mockClient,
  mockNavigate,
  mockSetToken,
} from "./helpers/mocks";
import { assertErrorMessageAndDismissal } from "./helpers/funcs";

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

const renderComponent = (mocks = [loginMock]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <SignIn setToken={mockSetToken} />
      </MemoryRouter>
    </MockedProvider>
  );

const assertSignInPageLoaded = async () => {
  expect(screen.getByRole("heading", { name: "Messaging App" })).toBeDefined();
  expect(
    screen.getByText(
      "Add contacts, create private or group chats, and send text messages. Stay connected with the people that matter most."
    )
  ).toBeDefined();
  expect(screen.getByLabelText("Username")).toBeDefined();
  expect(screen.getByLabelText("Password")).toBeDefined();
  expect(screen.getByRole("button", { name: "Sign In" })).toBeDefined();
  expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
};

const fillSignInForm = async (
  user: UserEvent,
  username: string,
  password: string
) => {
  await user.type(screen.getByLabelText("Username"), username);
  await user.type(screen.getByLabelText("Password"), password);
};

describe("<SignIn />", () => {
  test("renders component", () => {
    renderComponent();
    assertSignInPageLoaded();
  });

  test("displays error if inputs field are empty", async () => {
    const user = userEvent.setup();
    renderComponent();
    assertSignInPageLoaded();

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await assertErrorMessageAndDismissal("Please fill all fields.");
  });

  test("displays error if wrong credentials", async () => {
    const user = userEvent.setup();

    renderComponent([loginErrorMock]);
    assertSignInPageLoaded();

    const { username } = loginInput;

    await fillSignInForm(user, username, invalidLoginPassword);
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await assertErrorMessageAndDismissal("Invalid username or password");
  });

  test("signs in user successfully", async () => {
    const user = userEvent.setup();

    renderComponent();
    assertSignInPageLoaded();

    const { username, password } = loginInput;

    await fillSignInForm(user, username, password);
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith("token", LOGIN_TOKEN);
    });

    expect(mockClient.resetStore).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("navigates to signup page on sign up button click", async () => {
    const user = userEvent.setup();

    renderComponent();
    assertSignInPageLoaded();

    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });
});
