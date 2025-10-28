import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { currentUserMock, mockNavigate } from "./mocks";
import Profile from "../components/Profile";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useMatch: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

const { name, username } = currentUserMock;

const renderComponent = () =>
  render(
    <MemoryRouter>
      <Profile currentUser={currentUserMock} />
    </MemoryRouter>
  );

describe("<Profile />", () => {
  test("renders content", async () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: "Profile" })).toBeDefined();
    expect(screen.getByText(name)).toBeDefined();
    expect(screen.getByText(`@${username}`)).toBeDefined();
    expect(screen.getByTestId("go-back-button")).toBeDefined();
    expect(screen.getByTestId("edit-profile-button")).toBeDefined();
  });

  test("navigates back to settings page when back button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    expect(screen.getByRole("heading", { name: "Profile" })).toBeDefined();
    expect(screen.getByText(name)).toBeDefined();
    expect(screen.getByText(`@${username}`)).toBeDefined();

    const goBackButton = screen.getByTestId("go-back-button");
    expect(goBackButton).toBeDefined();

    await user.click(goBackButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/settings");
    });
  });
});
