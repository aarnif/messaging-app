import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { useMutation } from "@apollo/client/react";
import type { MockLink } from "@apollo/client/testing";
import { MemoryRouter, useMatch } from "react-router";
import {
  mockNavigate,
  findChatById,
  findChatByIdNull,
  sendMessage,
  USER_ONE_DETAILS,
  CHAT_DETAILS,
  MESSAGE_DETAILS,
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

const mockSendMessage = vi.fn();

vi.mock("@apollo/client/react", async () => {
  const actual = await vi.importActual("@apollo/client/react");
  return {
    ...actual,
    useMutation: vi.fn(() => [
      mockSendMessage,
      { loading: false, error: null },
    ]),
  };
});

Element.prototype.scrollIntoView = vi.fn();

const renderComponent = (
  mocks: MockLink.MockedResponse[] = [
    findChatById,
    findChatByIdNull,
    sendMessage,
  ]
) =>
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
        screen.getByRole("heading", { name: CHAT_DETAILS.name })
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
      await user.click(screen.getByTestId("go-back-button"));
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  test("shows chat info modal when chat info button is clicked", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: CHAT_DETAILS.id },
    });
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(
        screen.getByRole("heading", { name: CHAT_DETAILS.name })
      ).toBeDefined();
    });

    await user.click(screen.getByTestId("chat-info-button"));

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chat" })).toBeDefined();
      expect(screen.getByText(CHAT_DETAILS.description)).toBeDefined();
    });
  });

  test("closes chat info modal when close button is clicked", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: CHAT_DETAILS.id },
    });
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(
        screen.getByRole("heading", { name: CHAT_DETAILS.name })
      ).toBeDefined();
    });

    await user.click(screen.getByTestId("chat-info-button"));

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chat" })).toBeDefined();
      expect(screen.getByText(CHAT_DETAILS.description)).toBeDefined();
    });

    await user.click(screen.getByTestId("close-chat-info-button"));

    await waitFor(async () => {
      expect(screen.queryByRole("heading", { name: "Chat" })).toBeNull();
      expect(screen.queryByText(CHAT_DETAILS.description)).toBeNull();
    });
  });

  test("does not send message when input is empty", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: CHAT_DETAILS.id },
    });
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(screen.getByPlaceholderText("New Message...")).toBeDefined();
    });

    await user.click(screen.getByTestId("send-message-button"));

    await waitFor(() => {
      expect(mockSendMessage).not.toHaveBeenCalledWith({
        variables: {
          input: {
            id: CHAT_DETAILS.id,
            content: MESSAGE_DETAILS.content,
          },
        },
      });
    });
  });

  test("sends message successfully and resets input", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: CHAT_DETAILS.id },
    });
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(screen.getByPlaceholderText("New Message...")).toBeDefined();
    });

    const input = screen.getByPlaceholderText(
      "New Message..."
    ) as HTMLInputElement;
    await user.type(input, MESSAGE_DETAILS.content);
    await user.click(screen.getByTestId("send-message-button"));

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith({
        variables: {
          input: {
            id: CHAT_DETAILS.id,
            content: MESSAGE_DETAILS.content,
          },
        },
      });
      expect(input.value).toBe("");
    });
  });

  test("shows edit chat modal when edit chat button is clicked", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: CHAT_DETAILS.id },
    });
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(
        screen.getByRole("heading", { name: CHAT_DETAILS.name })
      ).toBeDefined();
    });

    await user.click(screen.getByTestId("chat-info-button"));

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chat" })).toBeDefined();
      expect(screen.getByText(CHAT_DETAILS.description)).toBeDefined();
    });

    await user.click(screen.getByTestId("edit-chat-button"));

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Edit Chat" })).toBeDefined();
    });
  });

  test("closes edit chat modal when close button is clicked", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: CHAT_DETAILS.id },
    });
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(
        screen.getByRole("heading", { name: CHAT_DETAILS.name })
      ).toBeDefined();
    });

    await user.click(screen.getByTestId("chat-info-button"));

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chat" })).toBeDefined();
      expect(screen.getByText(CHAT_DETAILS.description)).toBeDefined();
    });

    await user.click(screen.getByTestId("edit-chat-button"));

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Edit Chat" })).toBeDefined();
    });

    await user.click(screen.getByTestId("close-button"));

    await waitFor(async () => {
      expect(screen.queryByRole("heading", { name: "Edit Chat" })).toBeNull();
    });
  });

  test("edit chat fails with empty name", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: CHAT_DETAILS.id },
    });
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(
        screen.getByRole("heading", { name: CHAT_DETAILS.name })
      ).toBeDefined();
    });

    await user.click(screen.getByTestId("chat-info-button"));

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chat" })).toBeDefined();
      expect(screen.getByText(CHAT_DETAILS.description)).toBeDefined();
    });

    await user.click(screen.getByTestId("edit-chat-button"));

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Edit Chat" })).toBeDefined();
    });

    await user.clear(screen.getByPlaceholderText("Enter name here..."));

    await user.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(
        screen.getByText("Chat name must be at least three characters long")
      ).toBeDefined();
    });

    await waitForElementToBeRemoved(
      () =>
        screen.queryByText("Chat name must be at least three characters long"),
      { timeout: 3500 }
    );
  });

  test("edits chat name and description succesfully and closes modal", async () => {
    const mockEditChat = vi.fn();
    vi.mocked(useMutation).mockReturnValue([
      mockEditChat,
      {
        data: undefined,
        loading: false,
        error: undefined,
        called: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client: {} as any,
        reset: vi.fn(),
      },
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: CHAT_DETAILS.id },
    });
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(
        screen.getByRole("heading", { name: CHAT_DETAILS.name })
      ).toBeDefined();
    });

    await user.click(screen.getByTestId("chat-info-button"));

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chat" })).toBeDefined();
      expect(screen.getByText(CHAT_DETAILS.description)).toBeDefined();
    });

    await user.click(screen.getByTestId("edit-chat-button"));

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Edit Chat" })).toBeDefined();
    });

    const nameInput = screen.getByPlaceholderText("Enter name here...");
    const descriptionInput = screen.getByPlaceholderText(
      "Enter description here..."
    );

    await user.clear(nameInput);
    await user.clear(descriptionInput);

    await user.type(nameInput, "New Name");
    await user.type(descriptionInput, "New Description");

    await user.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(mockEditChat).toHaveBeenCalledWith({
        variables: {
          input: {
            id: CHAT_DETAILS.id,
            name: "New Name",
            description: "New Description",
            members: CHAT_DETAILS.members.map((member) => member.id),
          },
        },
      });
    });
  });
});
