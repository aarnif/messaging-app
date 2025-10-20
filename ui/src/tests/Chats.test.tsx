import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { describe, test, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import {
  currentUserMock,
  allChatsByUserEmpty,
  allChatsByUser,
  userChatsMock,
  allContactsByUser,
  allContactsByUserEmpty,
  userContactsMock,
  NewPrivateChatDetails,
} from "./mocks";
import Chats from "../components/Chats";
import { formatDisplayDate, truncateText } from "../helpers";

Object.defineProperty(global, "localStorage", { value: localStorage });

const renderComponent = (mocks = [allChatsByUser]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <Chats currentUser={currentUserMock} />
      </MemoryRouter>
    </MockedProvider>
  );

describe("<Chats />", () => {
  test("renders component", async () => {
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

  test("shows new chat dropdown when new chat button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    });

    await user.click(screen.getByRole("button"));

    await waitFor(async () => {
      expect(screen.getByText("New Private Chat")).toBeDefined();
      expect(screen.getByText("New Group Chat")).toBeDefined();
    });
  });

  test("closes new chat dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    });

    await user.click(screen.getByRole("button"));

    await waitFor(async () => {
      expect(screen.getByText("New Private Chat")).toBeDefined();
      expect(screen.getByText("New Group Chat")).toBeDefined();
    });

    await user.click(screen.getByTestId("overlay"));

    await waitFor(() => {
      expect(screen.queryByText("New Private Chat")).toBeNull();
      expect(screen.queryByText("New Group Chat")).toBeNull();
    });
  });

  test("shows new private chat modal when new private chat button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([allChatsByUser, allContactsByUser]);

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    });

    await user.click(screen.getByRole("button"));

    await waitFor(async () => {
      expect(screen.getByText("New Private Chat")).toBeDefined();
      expect(screen.getByText("New Group Chat")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "New Private Chat" }));

    await waitFor(async () => {
      expect(screen.getByText("New Private Chat")).toBeDefined();
      expect(
        screen.getByPlaceholderText("Search by name or username...")
      ).toBeDefined();
      expect(screen.queryByText("New Group Chat")).toBeNull();
      userContactsMock.forEach((contact) => {
        const { name, username, about } = contact.contactDetails;

        expect(screen.getByText(name)).toBeDefined();
        expect(screen.getByText(`@${username}`)).toBeDefined();
        expect(screen.getByText(about)).toBeDefined();
      });
    });
  });

  test("shows new private chat modal when new private chat button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([allChatsByUser, allContactsByUser]);

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    });

    await user.click(screen.getByRole("button"));

    await waitFor(async () => {
      expect(screen.getByText("New Private Chat")).toBeDefined();
      expect(screen.getByText("New Group Chat")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "New Private Chat" }));

    await waitFor(async () => {
      expect(screen.getByText("New Private Chat")).toBeDefined();
    });

    await user.click(screen.getByTestId("close-modal-button"));

    await waitFor(async () => {
      expect(screen.queryByText("New Private Chat")).toBeNull();
    });
  });

  test("show no contacts if user has none", async () => {
    const user = userEvent.setup();
    renderComponent([allChatsByUser, allContactsByUserEmpty]);

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    });

    await user.click(screen.getByRole("button"));

    await waitFor(async () => {
      expect(screen.getByText("New Private Chat")).toBeDefined();
      expect(screen.getByText("New Group Chat")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "New Private Chat" }));

    await waitFor(async () => {
      expect(screen.getByText("No contacts found")).toBeDefined();
    });
  });

  test("displays error if contact is not selected", async () => {
    const user = userEvent.setup();
    renderComponent([allChatsByUser, allContactsByUser]);

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    });

    await user.click(screen.getByRole("button"));

    await waitFor(async () => {
      expect(screen.getByText("New Private Chat")).toBeDefined();
      expect(screen.getByText("New Group Chat")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "New Private Chat" }));

    await waitFor(async () => {
      expect(screen.getByText("New Private Chat")).toBeDefined();
      expect(
        screen.getByPlaceholderText("Search by name or username...")
      ).toBeDefined();
      userContactsMock.forEach((contact) => {
        const { name, username, about } = contact.contactDetails;
        expect(screen.getByText(name)).toBeDefined();
        expect(screen.getByText(`@${username}`)).toBeDefined();
        expect(screen.getByText(about)).toBeDefined();
      });
    });

    await user.click(screen.getByTestId("create-chat-button"));

    await waitFor(() => {
      expect(
        screen.getByText("Please select a contact to create a chat with")
      ).toBeDefined();
    });

    await waitForElementToBeRemoved(
      () => screen.queryByText("Please select a contact to create a chat with"),
      { timeout: 3500 }
    );
  });

  test("selects contact when contact button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([allChatsByUser, allContactsByUser]);

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    });

    await user.click(screen.getByRole("button"));

    await waitFor(async () => {
      expect(screen.getByText("New Private Chat")).toBeDefined();
      expect(screen.getByText("New Group Chat")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "New Private Chat" }));

    await waitFor(async () => {
      expect(screen.getByText("New Private Chat")).toBeDefined();
      expect(
        screen.getByPlaceholderText("Search by name or username...")
      ).toBeDefined();
      expect(screen.queryByText("New Group Chat")).toBeNull();
      userContactsMock.forEach((contact) => {
        const { name, username, about } = contact.contactDetails;

        expect(screen.getByText(name)).toBeDefined();
        expect(screen.getByText(`@${username}`)).toBeDefined();
        expect(screen.getByText(about)).toBeDefined();
      });
    });

    await user.click(screen.getByText(`@user2`));

    await waitFor(async () => {
      const selectedContact = screen.getByTestId("selected");
      expect(selectedContact).toBeDefined();
      expect(within(selectedContact).getByText("@user2")).toBeDefined();
    });
  });

  test("saves new private chat info for chat preview when new chat button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([allChatsByUser, allContactsByUser]);

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    });

    await user.click(screen.getByRole("button"));

    await waitFor(async () => {
      expect(screen.getByText("New Private Chat")).toBeDefined();
      expect(screen.getByText("New Group Chat")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "New Private Chat" }));

    await waitFor(async () => {
      expect(screen.getByText("New Private Chat")).toBeDefined();
      expect(
        screen.getByPlaceholderText("Search by name or username...")
      ).toBeDefined();
      expect(screen.queryByText("New Group Chat")).toBeNull();
      userContactsMock.forEach((contact) => {
        const { name, username, about } = contact.contactDetails;

        expect(screen.getByText(name)).toBeDefined();
        expect(screen.getByText(`@${username}`)).toBeDefined();
        expect(screen.getByText(about)).toBeDefined();
      });
    });

    await user.click(screen.getByText(`@user2`));

    await waitFor(async () => {
      const selectedContact = screen.getByTestId("selected");
      expect(selectedContact).toBeDefined();
      expect(within(selectedContact).getByText("@user2")).toBeDefined();
    });

    await user.click(screen.getByTestId("create-chat-button"));

    await waitFor(async () => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "new-chat-info",
        JSON.stringify(NewPrivateChatDetails)
      );
      expect(screen.queryByText("New Private Chat")).toBeNull();
    });
  });
});
