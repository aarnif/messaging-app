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
import { MemoryRouter } from "react-router";
import {
  currentUserChatAdminMock,
  allChatsByUserEmpty,
  allChatsByUser,
  userChatsMock,
  contactsWithoutPrivateChats,
  contactsWithoutPrivateChatsEmpty,
  allContactsByUser,
  userContactsMock,
  NewPrivateChatDetails,
  NewGroupChatDetails,
  mockNavigate,
  allContactsByUserEmpty,
  isBlockedByUserTrue,
  isBlockedByUserFalse,
} from "./helpers/mocks";
import Chats from "../components/Chats";
import { formatDisplayDate, truncateText } from "../helpers";
import type { MockLink } from "@apollo/client/testing";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const contact1username = userContactsMock[0].contactDetails.username;
const contact2username = userContactsMock[1].contactDetails.username;

const renderComponent = (mocks: MockLink.MockedResponse[] = [allChatsByUser]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <Chats currentUser={currentUserChatAdminMock} />
      </MemoryRouter>
    </MockedProvider>
  );

const openNewChatDropDownMenu = async (user: UserEvent) => {
  await waitFor(async () => {
    expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
  });

  await user.click(screen.getByRole("button"));

  await waitFor(async () => {
    expect(screen.getByText("New Private Chat")).toBeDefined();
    expect(screen.getByText("New Group Chat")).toBeDefined();
  });
};

const openNewChatModal = async (user: UserEvent, type: string) => {
  await openNewChatDropDownMenu(user);
  await user.click(screen.getByRole("button", { name: type }));

  expect(screen.getByText(type)).toBeDefined();
  expect(
    screen.getByPlaceholderText("Search by name or username...")
  ).toBeDefined();
};

const assertContactsDisplayed = (contacts = userContactsMock) => {
  contacts.forEach((contact) => {
    const { name, username, about } = contact.contactDetails;
    expect(screen.getByText(name)).toBeDefined();
    expect(screen.getByText(`@${username}`)).toBeDefined();
    expect(screen.getByText(about)).toBeDefined();
  });
};

const selectContacts = async (user: UserEvent, usernames: string[]) => {
  for (const username of usernames) {
    await user.click(screen.getByText(`@${username}`));
  }
};

const assertContactsSelected = (usernames: string[]) => {
  const selectedContacts = screen.getAllByTestId("selected");

  usernames.forEach((username, index) => {
    expect(selectedContacts[index]).toBeDefined();
    expect(
      within(selectedContacts[index]).getByText(`@${username}`)
    ).toBeDefined();
  });
};

describe("<Chats />", () => {
  describe("renders component with chat lists", () => {
    test("renders chat list header header", async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
        expect(
          screen.getByPlaceholderText("Search by title or description...")
        ).toBeDefined();
      });
    });

    test("displays no chats found if user has none", async () => {
      renderComponent([allChatsByUserEmpty]);

      await waitFor(() => {
        expect(screen.getByText("No chats found.")).toBeDefined();
      });
    });

    test("displays all users chats", async () => {
      renderComponent();

      await waitFor(() => {
        userChatsMock.forEach((chat) => {
          const { name, messages } = chat;
          const latestMessage = messages[0];

          expect(screen.getByText(name)).toBeDefined();
          expect(
            screen.getByText(new RegExp(`${latestMessage.sender.name}:`))
          ).toBeDefined();
          const formattedDate = formatDisplayDate(latestMessage.createdAt);
          if (formattedDate) {
            expect(screen.getByText(formattedDate)).toBeDefined();
          }
          expect(
            screen.getByText(truncateText(latestMessage.content))
          ).toBeDefined();
        });
      });
    });
  });

  describe("clicking new chat dropdown", () => {
    test("shows new chat dropdown when new chat button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();

      await openNewChatDropDownMenu(user);
    });

    test("closes new chat dropdown when clicking outside", async () => {
      const user = userEvent.setup();
      renderComponent();

      await openNewChatDropDownMenu(user);

      await user.click(screen.getByTestId("overlay"));

      await waitFor(() => {
        expect(screen.queryByText("New Private Chat")).toBeNull();
        expect(screen.queryByText("New Group Chat")).toBeNull();
      });
    });
  });

  describe("creating a private chat", () => {
    test("shows new private chat modal when new private chat button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent([allChatsByUser, contactsWithoutPrivateChats]);

      await openNewChatModal(user, "New Private Chat");

      await waitFor(async () => {
        expect(screen.queryByText("New Group Chat")).toBeNull();
        assertContactsDisplayed();
      });
    });

    test("closes new private chat modal when close button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent([allChatsByUser, contactsWithoutPrivateChats]);

      await openNewChatModal(user, "New Private Chat");

      await user.click(screen.getByTestId("close-modal-button"));

      await waitFor(async () => {
        expect(screen.queryByText("New Private Chat")).toBeNull();
      });
    });

    test("show no contacts if user has none", async () => {
      const user = userEvent.setup();
      renderComponent([allChatsByUser, contactsWithoutPrivateChatsEmpty]);

      await openNewChatModal(user, "New Private Chat");

      await waitFor(async () => {
        expect(screen.getByText("No contacts found")).toBeDefined();
      });
    });

    test("displays error if contact is not selected", async () => {
      const user = userEvent.setup();
      renderComponent([allChatsByUser, contactsWithoutPrivateChats]);

      await openNewChatModal(user, "New Private Chat");

      await waitFor(async () => {
        assertContactsDisplayed();
      });

      await user.click(screen.getByTestId("create-chat-button"));

      await waitFor(() => {
        expect(
          screen.getByText("Please select a contact to create a chat with")
        ).toBeDefined();
      });

      await waitForElementToBeRemoved(
        () =>
          screen.queryByText("Please select a contact to create a chat with"),
        { timeout: 3500 }
      );
    });

    test("displays error if contact has blocked the user", async () => {
      const user = userEvent.setup();
      renderComponent([
        allChatsByUser,
        contactsWithoutPrivateChats,
        isBlockedByUserTrue,
      ]);

      await openNewChatModal(user, "New Private Chat");

      await waitFor(async () => {
        expect(screen.queryByText("New Group Chat")).toBeNull();
        assertContactsDisplayed();
      });

      await selectContacts(user, [contact1username]);

      await waitFor(async () => {
        assertContactsSelected([contact1username]);
      });

      await user.click(screen.getByTestId("create-chat-button"));

      await waitFor(() => {
        expect(screen.getByText("Contact has blocked you.")).toBeDefined();
      });

      await waitForElementToBeRemoved(
        () => screen.queryByText("Contact has blocked you."),
        { timeout: 3500 }
      );
    });

    test("selects contact when contact button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent([allChatsByUser, contactsWithoutPrivateChats]);

      await openNewChatModal(user, "New Private Chat");

      await waitFor(async () => {
        expect(screen.queryByText("New Group Chat")).toBeNull();
        assertContactsDisplayed();
      });

      await selectContacts(user, [contact1username]);

      await waitFor(async () => {
        assertContactsSelected([contact1username]);
      });
    });

    test("saves new private chat info and navigates to chat preview when new chat button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent([
        allChatsByUser,
        contactsWithoutPrivateChats,
        isBlockedByUserFalse,
      ]);

      await openNewChatModal(user, "New Private Chat");

      await waitFor(async () => {
        expect(screen.queryByText("New Group Chat")).toBeNull();
        assertContactsDisplayed();
      });

      await selectContacts(user, [contact1username]);

      await waitFor(async () => {
        assertContactsSelected([contact1username]);
      });

      await user.click(screen.getByTestId("create-chat-button"));

      await waitFor(async () => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          "new-chat-info",
          JSON.stringify(NewPrivateChatDetails)
        );
        expect(mockNavigate).toHaveBeenCalledWith("/chats/new");
        expect(screen.queryByText("New Private Chat")).toBeNull();
      });
    });
  });

  describe("creating a group chat", () => {
    test("shows new group chat modal when new group chat button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent([allChatsByUser, allContactsByUser]);

      await openNewChatModal(user, "New Group Chat");

      await waitFor(async () => {
        expect(screen.queryByText("New Private Chat")).toBeNull();
        assertContactsDisplayed();
      });
    });

    test("closes new group chat modal when close button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent([allChatsByUser, allContactsByUser]);

      await openNewChatModal(user, "New Group Chat");

      await waitFor(async () => {
        expect(screen.getByText("New Group Chat")).toBeDefined();
        assertContactsDisplayed();
      });

      await user.click(screen.getByTestId("close-modal-button"));

      await waitFor(async () => {
        expect(screen.queryByText("New Group Chat")).toBeNull();
      });
    });

    test("show no contacts if user has none", async () => {
      const user = userEvent.setup();
      renderComponent([allChatsByUser, allContactsByUserEmpty]);

      await openNewChatModal(user, "New Group Chat");

      await waitFor(async () => {
        expect(screen.getByText("No contacts found")).toBeDefined();
      });
    });

    test("selects contact when contact button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent([allChatsByUser, allContactsByUser]);

      await openNewChatModal(user, "New Group Chat");

      await waitFor(async () => {
        expect(screen.queryByText("New Private Chat")).toBeNull();
        assertContactsDisplayed();
      });

      await selectContacts(user, [contact1username, contact2username]);

      await waitFor(async () => {
        assertContactsSelected([contact1username]);
      });
    });

    test("displays error if chat name is not given", async () => {
      const user = userEvent.setup();
      renderComponent([allChatsByUser, allContactsByUser]);

      await openNewChatModal(user, "New Group Chat");

      await waitFor(async () => {
        expect(screen.queryByText("New Private Chat")).toBeNull();
        assertContactsDisplayed();
      });

      await user.click(screen.getByTestId("create-chat-button"));

      await waitFor(() => {
        expect(
          screen.getByText("Chat name must be at least three characters long")
        ).toBeDefined();
      });

      await waitForElementToBeRemoved(
        () =>
          screen.queryByText(
            "Chat name must be at least three characters long"
          ),
        { timeout: 3500 }
      );
    });

    test("displays error if not at least two contacts has been selected", async () => {
      const user = userEvent.setup();
      renderComponent([allChatsByUser, allContactsByUser]);

      await openNewChatModal(user, "New Group Chat");

      await waitFor(async () => {
        expect(screen.queryByText("New Private Chat")).toBeNull();
        assertContactsDisplayed();
      });

      await user.type(screen.getByLabelText("Name"), "Group Chat");

      await user.click(screen.getByTestId("create-chat-button"));

      await waitFor(() => {
        expect(
          screen.getByText("Chat must have at least two members")
        ).toBeDefined();
      });

      await waitForElementToBeRemoved(
        () => screen.queryByText("Chat must have at least two members"),
        { timeout: 3500 }
      );
    });

    test("saves new group chat info and navigates to chat preview when new chat button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent([allChatsByUser, allContactsByUser]);

      await openNewChatModal(user, "New Group Chat");

      await waitFor(async () => {
        expect(screen.queryByText("New Private Chat")).toBeNull();
        assertContactsDisplayed();
      });

      await selectContacts(user, [contact1username, contact2username]);

      await waitFor(async () => {
        assertContactsSelected([contact1username]);
      });

      await user.type(screen.getByLabelText("Name"), NewGroupChatDetails.name);

      await user.click(screen.getByTestId("create-chat-button"));

      await waitFor(async () => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          "new-chat-info",
          JSON.stringify(NewGroupChatDetails)
        );
        expect(mockNavigate).toHaveBeenCalledWith("/chats/new");
        expect(screen.queryByText("New Group Chat")).toBeNull();
      });
    });
  });
});
