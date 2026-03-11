import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import type { UserEvent } from "@testing-library/user-event";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import Appearance from "../components/Appearance";
import {
  currentUserChatAdminMock,
  editProfile24h,
  editProfile12h,
  mockNavigate,
  mockUseOutletContext,
  windowMockContent,
} from "./helpers/mocks";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useOutletContext: () => mockUseOutletContext(),
  };
});

Object.defineProperty(window, "matchMedia", windowMockContent);

const renderComponent = (mocks = [editProfile24h]) => {
  mockUseOutletContext.mockReturnValue({
    currentUser: currentUserChatAdminMock,
  });

  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <Appearance />
      </MemoryRouter>
    </MockedProvider>
  );
};

const waitForAppearancePageRender = async () => {
  await waitFor(() => {
    expect(screen.getByRole("heading", { name: "Appearance" })).toBeDefined();
    expect(screen.getByTestId("toggle-dark-mode")).toBeDefined();
    expect(screen.getByTestId("toggle-clock-mode")).toBeDefined();
  });
};

const toggleAndVerify = async (
  user: UserEvent,
  toggleTestId: string,
  expectedMark: "check-mark" | "close-mark"
) => {
  const toggle = screen.getByTestId(toggleTestId);
  await user.click(toggle);

  await waitFor(() => {
    expect(within(toggle).getByTestId(expectedMark)).toBeDefined();
  });
};

describe("<Appearance />", () => {
  test("renders page", async () => {
    renderComponent();
    await waitForAppearancePageRender();
  });

  test("navigates to settings page when back button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitForAppearancePageRender();
    await user.click(screen.getByTestId("go-back-button"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/settings");
    });
  });

  test("toggles dark mode successfully", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitForAppearancePageRender();

    await toggleAndVerify(user, "toggle-dark-mode", "close-mark");
    await toggleAndVerify(user, "toggle-dark-mode", "check-mark");
  });

  test("toggles clock mode successfully", async () => {
    const user = userEvent.setup();
    renderComponent([editProfile24h, editProfile12h]);

    await waitForAppearancePageRender();

    await toggleAndVerify(user, "toggle-clock-mode", "close-mark");
    await toggleAndVerify(user, "toggle-clock-mode", "check-mark");
  });
});
