import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import type { MockLink } from "@apollo/client/testing";
import { MemoryRouter } from "react-router";
import {
  mockNavigate,
  mockMatch,
  findChatByIdGroup,
  findChatByIdPrivate,
  findChatByIdNull,
  sendMessage,
  allContactsByUser,
  findContactByUserId,
  currentUserChatAdminMock,
  currentUserChatMemberMock,
  isBlockedByUserTrue,
  editChat,
  leaveChat,
  deleteChat,
  USER_ONE_DETAILS,
  GROUP_CHAT_DETAILS,
  MESSAGE_DETAILS,
} from "./mocks";
import ModalProvider from "../components/ModalProvider";
import Chat from "../components/Chat";
import { formatDisplayDate } from "../helpers";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useMatch: () => mockMatch(),
    useNavigate: () => mockNavigate,
  };
});

Element.prototype.scrollIntoView = vi.fn();

const renderComponent = (
  mocks: MockLink.MockedResponse[] = [
    findChatByIdGroup,
    findChatByIdNull,
    sendMessage,
  ],
  currentUser = currentUserChatAdminMock
) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={["/chats/1"]}>
        <ModalProvider>
          <Chat currentUser={currentUser} />
        </ModalProvider>
      </MemoryRouter>
    </MockedProvider>
  );

const openChatInfoModal = async (user: UserEvent) => {
  await waitFor(async () => {
    expect(
      screen.getByRole("heading", { name: GROUP_CHAT_DETAILS.name })
    ).toBeDefined();
  });
  await user.click(screen.getByTestId("chat-info-button"));
  await waitFor(async () => {
    expect(screen.getByRole("heading", { name: "Chat" })).toBeDefined();
    expect(screen.getByText(GROUP_CHAT_DETAILS.description)).toBeDefined();
  });
};

const sendNewMessage = async (user: UserEvent, message: string) => {
  await waitFor(async () => {
    expect(screen.getByPlaceholderText("New Message...")).toBeDefined();
  });

  if (message) {
    await user.type(screen.getByPlaceholderText("New Message..."), message);
  }

  await user.click(screen.getByTestId("send-message-button"));
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

    renderComponent([findChatByIdNull]);

    await waitFor(() => {
      expect(screen.getByText("Chat not found.")).toBeDefined();
      expect(
        screen.getByText("It may have been deleted or the link is incorrect.")
      ).toBeDefined();
    });
  });

  test("renders chat header and messages when chat exists", async () => {
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: GROUP_CHAT_DETAILS.name })
      ).toBeDefined();
      expect(
        screen.getByText(
          GROUP_CHAT_DETAILS.members
            .map((member) =>
              member.name === USER_ONE_DETAILS.name ? "You" : member.name
            )
            .join(", ")
        )
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
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      await user.click(screen.getByTestId("go-back-button"));
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  test("navigates to contact page when private chat info button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([findChatByIdPrivate, findContactByUserId]);

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
    renderComponent(
      [findChatByIdPrivate, findChatByIdNull, sendMessage, isBlockedByUserTrue],
      currentUserChatAdminMock
    );

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
        "New Message..."
      ) as HTMLInputElement;
      expect(input.value).toBe("");
    });
  });

  test("shows edit chat modal when edit chat button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([findChatByIdGroup, allContactsByUser]);

    await openChatInfoModal(user);

    await user.click(screen.getByTestId("edit-chat-button"));

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Edit Chat" })).toBeDefined();
    });
  });

  test("closes edit chat modal when close button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([findChatByIdGroup, allContactsByUser]);

    await openChatInfoModal(user);

    await user.click(screen.getByTestId("edit-chat-button"));

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Edit Chat" })).toBeDefined();
    });

    await user.click(screen.getByTestId("close-button"));

    await waitFor(
      async () => {
        expect(screen.queryByRole("heading", { name: "Edit Chat" })).toBeNull();
      },
      {
        timeout: 1500,
      }
    );
  });

  test("edit chat fails with empty name", async () => {
    const user = userEvent.setup();
    renderComponent([findChatByIdGroup, allContactsByUser]);

    await openChatInfoModal(user);

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

  test("selects contact when contact button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([findChatByIdGroup, allContactsByUser]);

    await openChatInfoModal(user);

    await user.click(screen.getByTestId("edit-chat-button"));

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Edit Chat" })).toBeDefined();
      expect(
        screen.getByPlaceholderText("Search by name or username...")
      ).toBeDefined();
    });

    const modal = screen.getByTestId("edit-chat-modal");

    const chatMember1 = GROUP_CHAT_DETAILS.members[1].username;
    const chatMember2 = GROUP_CHAT_DETAILS.members[2].username;

    const contactToBeUnSelected = within(modal).getByText(`@${chatMember1}`);

    await waitFor(
      () => {
        expect(contactToBeUnSelected).toBeDefined();
      },
      { timeout: 2000 }
    );

    await user.click(contactToBeUnSelected);

    await waitFor(async () => {
      const selectedContacts = screen.getAllByTestId("selected");
      expect(selectedContacts.length).toBe(1);
      expect(screen.getAllByText("1 contacts selected"));
      expect(selectedContacts[0]).toBeDefined();
      expect(
        within(selectedContacts[0]).getByText(`@${chatMember2}`)
      ).toBeDefined();
    });
  });

  test("edits chat name and description succesfully and closes modal", async () => {
    const user = userEvent.setup();
    renderComponent([findChatByIdGroup, allContactsByUser, editChat]);

    await openChatInfoModal(user);

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

    await waitFor(
      async () => {
        expect(screen.queryByRole("heading", { name: "Edit Chat" })).toBeNull();
      },
      { timeout: 1500 }
    );
  });

  test("hides leave chat button for admin users", async () => {
    const user = userEvent.setup();
    renderComponent([findChatByIdGroup, allContactsByUser]);

    await openChatInfoModal(user);

    expect(screen.queryByRole("button", { name: "Leave Chat" })).toBeNull();
  });

  test("leaves chat and navigates to home page when clicking leave chat button", async () => {
    const user = userEvent.setup();
    renderComponent(
      [findChatByIdGroup, allContactsByUser, leaveChat],
      currentUserChatMemberMock
    );

    await openChatInfoModal(user);

    await user.click(screen.getByRole("button", { name: "Leave Chat" }));

    await waitFor(async () => {
      expect(
        screen.getByText("Are you sure you want to leave the chat?")
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
      [findChatByIdGroup, allContactsByUser],
      currentUserChatMemberMock
    );

    await openChatInfoModal(user);

    expect(screen.queryByRole("button", { name: "Delete Chat" })).toBeNull();
  });

  test("deletes chat and navigates to home page when clicking delete chat button", async () => {
    const user = userEvent.setup();
    renderComponent([findChatByIdGroup, allContactsByUser, deleteChat]);

    await openChatInfoModal(user);

    await user.click(screen.getByRole("button", { name: "Delete Chat" }));

    await waitFor(async () => {
      expect(screen.getByText(/Delete this chat\?/i)).toBeDefined();
      expect(
        screen.getByText(
          /This will remove the chat and all messages for everyone\./i
        )
      ).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith("/chats/deleted");
    });
  });
});
