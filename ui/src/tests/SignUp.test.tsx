import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import SignUp from "../components/SignUp";
import {
  LOGIN_TOKEN,
  invalidUsername,
  invalidPassword,
  mismatchedPasswords,
  createUserInput,
  createUserMock,
  createUserErrorMock,
  loginMock,
  mockClient,
  mockNavigate,
} from "./helpers/mocks";
import { assertErrorMessageAndDismissal } from "./helpers/funcs";
import type { MockLink } from "@apollo/client/testing";

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

const renderComponent = (mocks: MockLink.MockedResponse[] = [createUserMock]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    </MockedProvider>
  );

const assertSignUpPageLoaded = async () => {
  expect(screen.getByRole("heading", { name: "Sign Up" })).toBeDefined();
  expect(screen.getByLabelText("Username")).toBeDefined();
  expect(screen.getByLabelText("Password")).toBeDefined();
  expect(screen.getByLabelText("Confirm Password")).toBeDefined();
  expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Return to Sign In" })
  ).toBeDefined();
};

const fillSignUpForm = async (
  user: UserEvent,
  username: string,
  password: string,
  confirmPassword: string
) => {
  await user.type(screen.getByLabelText("Username"), username);
  await user.type(screen.getByLabelText("Password"), password);
  await user.type(screen.getByLabelText("Confirm Password"), confirmPassword);
};

describe("<SignUp />", () => {
  test("renders component", () => {
    renderComponent();
    assertSignUpPageLoaded();
  });

  test("displays error if inputs field are empty", async () => {
    const user = userEvent.setup();
    renderComponent();
    assertSignUpPageLoaded();

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await assertErrorMessageAndDismissal("Please fill all fields.");
  });

  test("displays error if username is too short", async () => {
    const user = userEvent.setup();

    renderComponent();
    assertSignUpPageLoaded();

    const { username, password, confirmPassword } = invalidUsername;

    await fillSignUpForm(user, username, password, confirmPassword);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await assertErrorMessageAndDismissal(
      "Username must be at least 3 characters long"
    );
  });

  test("displays error if password is too short", async () => {
    const user = userEvent.setup();

    renderComponent();
    assertSignUpPageLoaded();

    const { username, password, confirmPassword } = invalidPassword;

    await fillSignUpForm(user, username, password, confirmPassword);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await assertErrorMessageAndDismissal(
      "Password must be at least 6 characters long"
    );
  });

  test("displays error if passwords do not match", async () => {
    const user = userEvent.setup();

    renderComponent();
    assertSignUpPageLoaded();

    const { username, password, confirmPassword } = mismatchedPasswords;

    await fillSignUpForm(user, username, password, confirmPassword);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await assertErrorMessageAndDismissal("Passwords do not match");
  });

  test("displays error if username already exists", async () => {
    const user = userEvent.setup();

    renderComponent([createUserErrorMock]);
    assertSignUpPageLoaded();

    const { username, password, confirmPassword } = createUserInput;

    await fillSignUpForm(user, username, password, confirmPassword);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await assertErrorMessageAndDismissal("Username already exists");
  });

  test("signs up user successfully", async () => {
    const user = userEvent.setup();

    renderComponent([createUserMock, loginMock]);
    assertSignUpPageLoaded();

    const { username, password, confirmPassword } = createUserInput;

    await fillSignUpForm(user, username, password, confirmPassword);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith("token", LOGIN_TOKEN);
    });

    expect(mockClient.resetStore).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  test("navigates to sign in page on return to sign in button click", async () => {
    const user = userEvent.setup();

    renderComponent();
    assertSignUpPageLoaded();

    await user.click(screen.getByRole("button", { name: "Return to Sign In" }));
    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });
});
