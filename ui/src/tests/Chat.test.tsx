import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter, useMatch } from "react-router";
import {
  mockNavigate,
  findChatById,
  findChatByIdNull,
  USER_ONE_DETAILS,
  CHAT_DETAILS,
} from "./mocks";
import Chat from "../components/Chat";
import { formatDisplayDate } from "../helpers";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useMatch: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

const renderComponent = (mocks = [findChatById]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={["/chats/1"]}>
        <Chat currentUser={USER_ONE_DETAILS} />
      </MemoryRouter>
    </MockedProvider>
  );

describe("<Chat />", () => {
  test("shows loading spinner during data fetch", () => {
    renderComponent();
    expect(screen.getByTestId("spinner")).toBeDefined();
  });

  test("shows chat not found message for invalid chat ID", async () => {
    renderComponent([findChatByIdNull]);

    await waitFor(() => {
      expect(screen.getByText("Chat not found.")).toBeDefined();
      expect(
        screen.getByText("It may have been deleted or the link is incorrect.")
      ).toBeDefined();
    });
  });

  test("renders chat header and messages when chat exists", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: CHAT_DETAILS.id },
    });
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Test Chat 1" })
      ).toBeDefined();
      expect(
        screen.getByText(
          CHAT_DETAILS.members
            .map((member) =>
              member.name === USER_ONE_DETAILS.name ? "You" : member.name
            )
            .join(", ")
        )
      ).toBeDefined();
      CHAT_DETAILS.messages.forEach((message) => {
        const { sender, content, createdAt } = message;
        const { name } = sender;
        if (name === USER_ONE_DETAILS.name) {
          expect(screen.getByRole("heading", { name: "You" })).toBeDefined();
        } else {
          expect(screen.getByRole("heading", { name: name })).toBeDefined();
        }
        expect(screen.getByText(content)).toBeDefined();
        const formattedDate = formatDisplayDate(createdAt);
        if (formattedDate) {
          expect(screen.getByText(formattedDate)).toBeDefined();
        }
      });
    });
  });

  test("applies correct message styles for current user vs contacts", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: CHAT_DETAILS.id },
    });
    renderComponent();
    await waitFor(() => {
      const currentUserMessages = screen.queryAllByTestId(
        "current-user-message"
      );
      currentUserMessages.forEach((message) => {
        expect(message.className).toContain("bg-green-300");
      });
      const contactMessages = screen.queryAllByTestId("contact-message");
      contactMessages.forEach((message) => {
        expect(message.className).toContain("bg-slate-200 dark:bg-slate-700");
      });
    });
  });

  test("navigates to chats list when back button is clicked", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: CHAT_DETAILS.id },
    });
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      await user.click(screen.getByTestId("go-back"));
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
