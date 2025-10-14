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
} from "./mocks";
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

Object.defineProperty(global, "localStorage", { value: localStorage });

const renderComponent = (mocks: MockLink.MockedResponse[] = [createUserMock]) =>
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

    const { username, password, confirmPassword } = invalidUsername;

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

    const { username, password, confirmPassword } = invalidPassword;

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

    const { username, password, confirmPassword } = mismatchedPasswords;

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

    const { username, password, confirmPassword } = createUserInput;

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

    const { username, password, confirmPassword } = createUserInput;

    renderComponent([createUserMock, loginMock]);

    await user.type(screen.getByLabelText("Username"), username);
    await user.type(screen.getByLabelText("Password"), password);
    await user.type(screen.getByLabelText("Confirm Password"), confirmPassword);
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith("token", LOGIN_TOKEN);
    });

    expect(mockClient.resetStore).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/chats");
  });
});
