import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import Appearance from "../components/Appearance";
import {
  currentUserMock,
  editProfile24h,
  editProfile12h,
  mockNavigate,
  windowMockContent,
} from "./mocks";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useMatch: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

Object.defineProperty(window, "matchMedia", windowMockContent);

const renderComponent = (mocks = [editProfile24h]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <Appearance currentUser={currentUserMock} />
      </MemoryRouter>
    </MockedProvider>
  );

describe("<Appearance />", () => {
  test("renders page", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Appearance" })).toBeDefined();
      expect(screen.getByTestId("toggle-dark-mode")).toBeDefined();
      expect(screen.getByTestId("toggle-clock-mode")).toBeDefined();
    });
  });

  test("navigates to settings page when back button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Appearance" })).toBeDefined();
      expect(screen.getByTestId("toggle-dark-mode")).toBeDefined();
      expect(screen.getByTestId("toggle-clock-mode")).toBeDefined();
    });

    await user.click(screen.getByTestId("go-back-button"));

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith("/settings");
    });
  });

  test("toggles dark mode succesfully", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Appearance" })).toBeDefined();
      expect(screen.getByTestId("toggle-dark-mode")).toBeDefined();
      expect(screen.getByTestId("toggle-clock-mode")).toBeDefined();
    });

    const darkModeToggle = screen.getByTestId("toggle-dark-mode");

    await user.click(darkModeToggle);

    await waitFor(() => {
      expect(within(darkModeToggle).getByTestId("close-mark")).toBeDefined();
    });

    await user.click(darkModeToggle);

    await waitFor(() => {
      expect(within(darkModeToggle).getByTestId("check-mark")).toBeDefined();
    });
  });

  test("toggles clock mode succesfully", async () => {
    const user = userEvent.setup();
    renderComponent([editProfile24h, editProfile12h]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Appearance" })).toBeDefined();
      expect(screen.getByTestId("toggle-dark-mode")).toBeDefined();
      expect(screen.getByTestId("toggle-clock-mode")).toBeDefined();
    });

    const clockModeToggle = screen.getByTestId("toggle-clock-mode");

    await user.click(clockModeToggle);

    await waitFor(() => {
      expect(within(clockModeToggle).getByTestId("close-mark")).toBeDefined();
    });

    await user.click(clockModeToggle);

    await waitFor(() => {
      expect(within(clockModeToggle).getByTestId("check-mark")).toBeDefined();
    });
  });
});
