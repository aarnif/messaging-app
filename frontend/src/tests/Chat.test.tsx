import type { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, test, vi } from "vitest";
import ModalProvider from "../components/ModalProvider";
import { formatDisplayDate } from "../helpers";
import Chat from "../pages/Chat";
import {
  assertErrorMessageAndDismissal,
  sendNewMessage,
} from "./helpers/funcs";
import {
  allChatsByUser,
  allContactsByUser,
  currentUserChatAdminMock,
  currentUserChatMemberMock,
  deleteChat,
  deleteMessage,
  editChat,
  editMessage,
  findChatByIdGroup,
  findChatByIdGroupWithEditedMessage,
  findChatByIdGroupWithNotification,
  findChatByIdNull,
  findChatByIdPrivate,
  findContactByUserId,
  GROUP_CHAT_DETAILS,
  isBlockedByUserTrue,
  leaveChat,
  markChatAsRead,
  MESSAGE_DETAILS,
  messageDeletedSubscription,
  messageEditedSubscription,
  messageSentSubscription,
  mockChatsSearchWord,
  mockMatch,
  mockNavigate,
  mockUseOutletContext,
  sendMessage,
  USER_ONE_DETAILS,
} from "./helpers/mocks";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useMatch: () => mockMatch(),
    useNavigate: () => mockNavigate,
    useOutletContext: () => mockUseOutletContext(),
  };
});

Element.prototype.scrollIntoView = vi.fn();

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

const renderComponent = (
  mocks: MockLink.MockedResponse[] = [
    findChatByIdGroup,
    findChatByIdNull,
    allChatsByUser,
    sendMessage,
    markChatAsRead,
    messageSentSubscription,
    messageEditedSubscription,
    messageDeletedSubscription,
  ],
  currentUser = currentUserChatAdminMock,
) => {
  mockUseOutletContext.mockReturnValue({
    currentUser,
    searchWord: mockChatsSearchWord,
  });

  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={["/chats/1"]}>
        <ModalProvider>
          <Chat />
        </ModalProvider>
      </MemoryRouter>
    </MockedProvider>,
  );
};

const openChatInfoModal = async (user: UserEvent) => {
  await waitFor(async () => {
    expect(
      screen.getByRole("heading", { name: GROUP_CHAT_DETAILS.name }),
    ).toBeDefined();
  });
  await user.click(screen.getByTestId("chat-info-button"));
  await waitFor(async () => {
    expect(screen.getByRole("heading", { name: "Chat" })).toBeDefined();
    expect(screen.getByText(GROUP_CHAT_DETAILS.description)).toBeDefined();
  });
};

const openEditChatModal = async (user: UserEvent) => {
  await user.click(screen.getByTestId("edit-chat-button"));
  await waitFor(async () => {
    expect(screen.getByRole("heading", { name: "Edit Chat" })).toBeDefined();
  });
};

const openMessageEditMode = async (user: UserEvent) => {
  await waitFor(() => {
    expect(
      screen.getByRole("heading", { name: GROUP_CHAT_DETAILS.name }),
    ).toBeDefined();
  });
  const [firstMessageMenuButton] = screen.getAllByTestId("sent-message");
  await user.click(firstMessageMenuButton);
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Edit" })).toBeDefined();
  });
  await user.click(screen.getByRole("button", { name: "Edit" }));
  await waitFor(() => {
    expect(screen.getByTestId("edit-message-input")).toBeDefined();
  });
};

const openMessageDeleteConfirmation = async (user: UserEvent) => {
  await waitFor(() => {
    expect(
      screen.getByRole("heading", { name: GROUP_CHAT_DETAILS.name }),
    ).toBeDefined();
  });
  const [firstMessageMenuButton] = screen.getAllByTestId("sent-message");
  await user.click(firstMessageMenuButton);
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Delete" })).toBeDefined();
  });
  await user.click(screen.getByRole("button", { name: "Delete" }));
};

describe("<Chat />", () => {
  beforeEach(() => {
    mockMatch.mockReturnValue({
      params: {
        id: "1",
      },
    });
  });

  test("shows loading spinner during data fetch", () => {
    renderComponent();
    expect(screen.getByTestId("spinner")).toBeDefined();
  });

  test("shows chat not found message for invalid chat ID", async () => {
    mockMatch.mockReturnValue({
      params: {
        id: "",
      },
    });

    renderComponent([
      findChatByIdNull,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
    ]);

    await waitFor(() => {
      expect(screen.getByText("Chat not found.")).toBeDefined();
      expect(
        screen.getByText("It may have been deleted or the link is incorrect."),
      ).toBeDefined();
    });
  });

  test("renders chat header and messages when chat exists", async () => {
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: GROUP_CHAT_DETAILS.name }),
      ).toBeDefined();
      expect(
        screen.getByText(
          GROUP_CHAT_DETAILS.members
            .map((member) =>
              member.name === USER_ONE_DETAILS.name ? "You" : member.name,
            )
            .join(", "),
        ),
      ).toBeDefined();
      GROUP_CHAT_DETAILS.messages.forEach((message) => {
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
    renderComponent();
    await waitFor(() => {
      const currentUserMessages = screen.queryAllByTestId("sent-message");
      currentUserMessages.forEach((message) => {
        expect(message.className).toContain("bg-green-300");
      });
      const contactMessages = screen.queryAllByTestId("received-message");
      contactMessages.forEach((message) => {
        expect(message.className).toContain("bg-slate-200 dark:bg-slate-700");
      });
    });
  });

  test("renders notification messages correctly", async () => {
    renderComponent([
      findChatByIdGroupWithNotification,
      findChatByIdNull,
      allChatsByUser,
      sendMessage,
      markChatAsRead,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
    ]);

    await waitFor(() => {
      expect(screen.getByTestId("notification-message")).toBeDefined();
      expect(
        screen.getByText(`${USER_ONE_DETAILS.name} created the group`),
      ).toBeDefined();
    });
  });

  test("navigates to chats list when back button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      await user.click(screen.getByTestId("go-back-button"));
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  test("navigates to contact page when private chat info button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([
      findChatByIdPrivate,
      findContactByUserId,
      allChatsByUser,
      markChatAsRead,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
    ]);

    await waitFor(async () => {
      await user.click(screen.getByTestId("chat-info-button"));
      expect(mockNavigate).toHaveBeenCalledWith("/contacts/1");
    });
  });

  test("shows chat info modal when group chat info button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    await openChatInfoModal(user);
  });

  test("closes chat info modal when close button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    await openChatInfoModal(user);

    await user.click(screen.getByTestId("close-chat-info-button"));

    await waitFor(async () => {
      expect(screen.queryByRole("heading", { name: "Chat" })).toBeNull();
      expect(screen.queryByText(GROUP_CHAT_DETAILS.description)).toBeNull();
    });
  });

  test("does not send message when input is empty", async () => {
    const consoleLogSpy = vi.spyOn(console, "log");

    const user = userEvent.setup();
    renderComponent();

    await sendNewMessage(user, "");

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith("Do not send empty message!");
    });
  });

  test("does not send message in private chat if contact has blocked user", async () => {
    const user = userEvent.setup();
    renderComponent([
      findChatByIdPrivate,
      findChatByIdNull,
      allChatsByUser,
      sendMessage,
      isBlockedByUserTrue,
      markChatAsRead,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
    ]);

    await sendNewMessage(user, MESSAGE_DETAILS.content);

    await waitFor(() => {
      expect(screen.getByText("Contact has blocked you.")).toBeDefined();
    });
  });

  test("sends message successfully and resets input", async () => {
    const user = userEvent.setup();
    renderComponent();

    await sendNewMessage(user, MESSAGE_DETAILS.content);

    await waitFor(() => {
      const input = screen.getByPlaceholderText(
        "New Message...",
      ) as HTMLInputElement;
      expect(input.value).toBe("");
    });
  });

  test("shows edit chat modal when edit chat button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([
      findChatByIdGroup,
      allChatsByUser,
      allContactsByUser,
      markChatAsRead,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
    ]);

    await openChatInfoModal(user);
    await openEditChatModal(user);
  });

  test("closes edit chat modal when close button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([
      findChatByIdGroup,
      allChatsByUser,
      allContactsByUser,
      markChatAsRead,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
    ]);

    await openChatInfoModal(user);
    await openEditChatModal(user);

    await user.click(screen.getByTestId("close-button"));

    await waitFor(
      async () => {
        expect(screen.queryByRole("heading", { name: "Edit Chat" })).toBeNull();
      },
      {
        timeout: 1500,
      },
    );
  });

  test("edit chat fails with empty name", async () => {
    const user = userEvent.setup();
    renderComponent([
      findChatByIdGroup,
      allChatsByUser,
      allContactsByUser,
      markChatAsRead,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
    ]);

    await openChatInfoModal(user);
    await openEditChatModal(user);

    await user.clear(screen.getByPlaceholderText("Enter name here..."));

    await user.click(screen.getByTestId("confirm-button"));

    await assertErrorMessageAndDismissal(
      "Chat name must be at least three characters long",
    );
  });

  test("selects contact when contact button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([
      findChatByIdGroup,
      allChatsByUser,
      allContactsByUser,
      markChatAsRead,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
    ]);

    await openChatInfoModal(user);
    await openEditChatModal(user);

    const modal = screen.getByTestId("modal-layout");

    const chatMember1 = GROUP_CHAT_DETAILS.members[1].username;
    const chatMember2 = GROUP_CHAT_DETAILS.members[2].username;

    await waitFor(
      () => {
        expect(within(modal).getByText(`@${chatMember1}`)).toBeDefined();
      },
      { timeout: 2000 },
    );

    await user.click(within(modal).getByText(`@${chatMember1}`));

    await waitFor(async () => {
      const selectedContacts = screen.getAllByTestId("selected");
      expect(selectedContacts.length).toBe(1);
      expect(screen.getAllByText("1 contacts selected"));
      expect(selectedContacts[0]).toBeDefined();
      expect(
        within(selectedContacts[0]).getByText(`@${chatMember2}`),
      ).toBeDefined();
    });
  });

  test("edits chat name and description succesfully and closes modal", async () => {
    const user = userEvent.setup();
    renderComponent([
      findChatByIdGroup,
      allChatsByUser,
      allContactsByUser,
      editChat,
      markChatAsRead,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
    ]);

    await openChatInfoModal(user);
    await openEditChatModal(user);

    const nameInput = screen.getByPlaceholderText("Enter name here...");
    const descriptionInput = screen.getByPlaceholderText(
      "Enter description here...",
    );

    await user.clear(nameInput);
    await user.clear(descriptionInput);

    await user.type(nameInput, "New Name");
    await user.type(descriptionInput, "New Description");

    await user.click(screen.getByTestId("confirm-button"));

    await waitFor(
      async () => {
        expect(screen.queryByRole("heading", { name: "Edit Chat" })).toBeNull();
      },
      { timeout: 2000 },
    );
  });

  test("hides leave chat button for admin users", async () => {
    const user = userEvent.setup();
    renderComponent([
      findChatByIdGroup,
      allChatsByUser,
      allContactsByUser,
      markChatAsRead,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
    ]);

    await openChatInfoModal(user);

    expect(screen.queryByRole("button", { name: "Leave Chat" })).toBeNull();
  });

  test("leaves chat and navigates to home page when clicking leave chat button", async () => {
    const user = userEvent.setup();
    renderComponent(
      [
        findChatByIdGroup,
        allChatsByUser,
        allContactsByUser,
        leaveChat,
        markChatAsRead,
        messageSentSubscription,
        messageEditedSubscription,
        messageDeletedSubscription,
      ],
      currentUserChatMemberMock,
    );

    await openChatInfoModal(user);

    await user.click(screen.getByRole("button", { name: "Leave Chat" }));

    await waitFor(async () => {
      expect(
        screen.getByText("Are you sure you want to leave the chat?"),
      ).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "Leave" }));

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith("/chats/left");
    });
  });

  test("hides delete chat button for non admin users", async () => {
    const user = userEvent.setup();
    renderComponent(
      [
        findChatByIdGroup,
        allChatsByUser,
        allContactsByUser,
        markChatAsRead,
        messageSentSubscription,
        messageEditedSubscription,
        messageDeletedSubscription,
      ],
      currentUserChatMemberMock,
    );

    await openChatInfoModal(user);

    expect(screen.queryByRole("button", { name: "Delete Chat" })).toBeNull();
  });

  test("deletes chat and navigates to home page when clicking delete chat button", async () => {
    const user = userEvent.setup();
    renderComponent([
      findChatByIdGroup,
      allChatsByUser,
      allContactsByUser,
      deleteChat,
      markChatAsRead,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
    ]);

    await openChatInfoModal(user);

    await user.click(screen.getByRole("button", { name: "Delete Chat" }));

    await waitFor(async () => {
      expect(screen.getByText(/Delete this chat\?/i)).toBeDefined();
      expect(
        screen.getByText(
          /This will remove the chat and all messages for everyone\./i,
        ),
      ).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith("/chats/deleted");
    });
  });

  test("can open edit mode for own message", async () => {
    const user = userEvent.setup();
    renderComponent();
    await openMessageEditMode(user);
  });

  test("closes edit mode when cancel button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();
    await openMessageEditMode(user);
    await user.click(screen.getByTestId("cancel-edit-message-button"));
    await waitFor(() => {
      expect(screen.queryByTestId("edit-message-input")).toBeNull();
    });
  });

  test("closes edit mode without sending when edited message is empty", async () => {
    const user = userEvent.setup();
    renderComponent();

    const originalContent = GROUP_CHAT_DETAILS.messages.find(
      (message) => message.sender.name === USER_ONE_DETAILS.name,
    )!.content;

    await openMessageEditMode(user);
    await user.clear(screen.getByTestId("edit-message-input"));

    await user.click(screen.getByTestId("submit-edit-message-button"));

    await waitFor(() => {
      expect(screen.queryByTestId("edit-message-input")).toBeNull();
      expect(screen.getByText(originalContent)).toBeDefined();
    });
  });

  test("edits message successfully and and closes edit mode", async () => {
    const user = userEvent.setup();
    renderComponent([
      findChatByIdGroup,
      findChatByIdNull,
      allChatsByUser,
      sendMessage,
      markChatAsRead,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
      editMessage,
    ]);

    await openMessageEditMode(user);

    await user.clear(screen.getByTestId("edit-message-input"));
    await user.type(screen.getByTestId("edit-message-input"), "Edited message");

    await user.click(screen.getByTestId("submit-edit-message-button"));

    await waitFor(() => {
      expect(screen.queryByTestId("edit-message-input")).toBeNull();
    });
  });

  test("can open delete confirmation modal for own message", async () => {
    const user = userEvent.setup();
    renderComponent();
    await openMessageDeleteConfirmation(user);
    await waitFor(() => {
      expect(
        screen.getByText("Are you sure you want to delete the message?"),
      ).toBeDefined();
    });
  });

  test("closes delete confirmation modal when cancel button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();
    await openMessageDeleteConfirmation(user);
    await waitFor(() => {
      expect(
        screen.getByText("Are you sure you want to delete the message?"),
      ).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Are you sure you want to delete the message?"),
      ).toBeNull();
    });
  });

  test("deletes message successfully and closes confirmation modal", async () => {
    const user = userEvent.setup();
    renderComponent([
      findChatByIdGroup,
      findChatByIdNull,
      allChatsByUser,
      sendMessage,
      markChatAsRead,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
      deleteMessage,
    ]);

    await openMessageDeleteConfirmation(user);
    await waitFor(() => {
      expect(
        screen.getByText("Are you sure you want to delete the message?"),
      ).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Are you sure you want to delete the message?"),
      ).toBeNull();
    });
  });

  test("displays Edited badge when message is edited and not deleted", async () => {
    renderComponent([
      findChatByIdGroupWithEditedMessage,
      findChatByIdNull,
      allChatsByUser,
      markChatAsRead,
      messageSentSubscription,
      messageEditedSubscription,
      messageDeletedSubscription,
    ]);

    await waitFor(() => {
      expect(screen.getByText("Edited")).toBeDefined();
    });
  });

  test("opens emoji picker when emoji button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText("New Message...")).toBeDefined();
    });

    const emojiButton = screen.getByTestId("add-emoji-button");
    await user.click(emojiButton);

    await waitFor(() => {
      expect(screen.getByTestId("emoji-picker")).toBeDefined();
    });
  });

  test("closes emoji picker when emoji button is clicked again", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText("New Message...")).toBeDefined();
    });

    const emojiButton = screen.getByTestId("add-emoji-button");
    await user.click(emojiButton);

    await waitFor(() => {
      expect(screen.getByTestId("emoji-picker")).toBeDefined();
    });

    await user.click(emojiButton);

    await waitFor(() => {
      expect(screen.queryByTestId("emoji-picker")).toBeNull();
    });
  });
});
