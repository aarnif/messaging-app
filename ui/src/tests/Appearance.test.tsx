import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Appearance from "../components/Appearance";
import { mockNavigate, windowMockContent } from "./mocks";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useMatch: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

Object.defineProperty(window, "matchMedia", windowMockContent);

const renderComponent = () =>
  render(
    <MemoryRouter>
      <Appearance />
    </MemoryRouter>
  );

describe("<Appearance />", () => {
  test("renders page", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Appearance" })).toBeDefined();
      expect(screen.getByTestId("toggle-dark-mode")).toBeDefined();
    });
  });

  test("navigates to settings page when back button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Appearance" })).toBeDefined();
      expect(screen.getByTestId("toggle-dark-mode")).toBeDefined();
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
    });

    await user.click(screen.getByTestId("toggle-dark-mode"));

    await waitFor(() => {
      expect(screen.getByTestId("close-mark")).toBeDefined();
    });

    await user.click(screen.getByTestId("toggle-dark-mode"));

    await waitFor(() => {
      expect(screen.getByTestId("check-mark")).toBeDefined();
    });
  });
});
