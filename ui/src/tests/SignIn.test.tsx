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
import SignIn from "../components/SignIn";
import {
  LOGIN_TOKEN,
  loginInput,
  invalidLoginPassword,
  loginMock,
  loginErrorMock,
  mockClient,
  mockNavigate,
} from "./helpers/mocks";

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
        <SignIn />
      </MemoryRouter>
    </MockedProvider>
  );

describe("<SignIn />", () => {
  test("renders component", () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: "Sign In" })).toBeDefined();
    expect(screen.getByLabelText("Username")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
  });

  test("displays error if inputs field are empty", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    const errorMessage = await screen.findByText("Please fill all fields.");
    expect(errorMessage).toBeDefined();

    await waitForElementToBeRemoved(
      () => screen.queryByText("Please fill all fields."),
      { timeout: 3500 }
    );
  });

  test("displays error if wrong credentials", async () => {
    const user = userEvent.setup();

    const { username } = loginInput;

    renderComponent([loginErrorMock]);

    await user.type(screen.getByLabelText("Username"), username);
    await user.type(screen.getByLabelText("Password"), invalidLoginPassword);
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid username or password")).toBeDefined();
    });

    await waitForElementToBeRemoved(
      () => screen.queryByText("Invalid username or password"),
      { timeout: 3500 }
    );
  });

  test("signs in user successfully", async () => {
    const user = userEvent.setup();

    const { username, password } = loginInput;

    renderComponent();
    await user.type(screen.getByLabelText("Username"), username);
    await user.type(screen.getByLabelText("Password"), password);
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

    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });
});
