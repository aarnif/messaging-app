import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import type { MockLink } from "@apollo/client/testing";
import { MemoryRouter } from "react-router";
import {
  currentUserChatAdminMock,
  findContactById,
  findContactByIdNull,
  findContactByIdBlocked,
  findPrivateChatWithContact,
  findPrivateChatWithContactNull,
  mockMatch,
  mockNavigate,
  CONTACT_DETAILS,
  PRIVATE_CHAT_DETAILS,
  NewPrivateChatDetails,
  toggleBlockContactTrue,
  toggleBlockContactFalse,
  removeContact,
  isBlockedByUserTrue,
  isBlockedByUserFalse,
  isBlockedByUserNull,
} from "./mocks";
import ModalProvider from "../components/ModalProvider";
import Contact from "../components/Contact";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useMatch: () => mockMatch(),
    useNavigate: () => mockNavigate,
  };
});

const contactDetails = CONTACT_DETAILS.contactDetails;

const renderComponent = (
  mocks: MockLink.MockedResponse[] = [findContactById, isBlockedByUserFalse]
) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={["/contacts/1"]}>
        <ModalProvider>
          <Contact currentUser={currentUserChatAdminMock} />
        </ModalProvider>
      </MemoryRouter>
    </MockedProvider>
  );

const waitForPageRender = async () => {
  await waitFor(() => {
    expect(screen.getByRole("heading", { name: "Contact" })).toBeDefined();
    expect(
      screen.getByRole("heading", { name: contactDetails.name })
    ).toBeDefined();
    expect(screen.getByText(`@${contactDetails.username}`)).toBeDefined();
    expect(screen.getByText(contactDetails.about)).toBeDefined();
    expect(screen.getByRole("button", { name: "Chat" })).toBeDefined();
  });
};

const toggleBlockContact = async (user: UserEvent, action: string) => {
  await user.click(screen.getByRole("button", { name: `${action} Contact` }));

  await waitFor(async () => {
    expect(
      screen.getByText(
        `Are you sure you want to ${action.toLowerCase()} the contact?`
      )
    ).toBeDefined();
  });

  await user.click(screen.getByRole("button", { name: action }));
};

describe("<Contact />", () => {
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

  test("shows contact not found message for invalid contact ID", async () => {
    mockMatch.mockReturnValue({
      params: {
        id: "999",
      },
    });

    renderComponent([findContactByIdNull, isBlockedByUserNull]);

    await waitFor(() => {
      expect(screen.getByText("Contact not found.")).toBeDefined();
      expect(
        screen.getByText("It may have been deleted or the link is incorrect.")
      ).toBeDefined();
    });
  });

  test("renders contact info", async () => {
    renderComponent();
    await waitForPageRender();
  });

  test("chat button is disabled if contact has blocked the current user", async () => {
    renderComponent([findContactById, isBlockedByUserTrue]);
    await waitForPageRender();

    expect(screen.getByRole("button", { name: "Chat" })).toBeDisabled();
    expect(screen.getByText("Contact has blocked you."));
  });

  test("navigates to existing private chat when chat button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([
      findContactById,
      isBlockedByUserFalse,
      findPrivateChatWithContact,
    ]);
    await waitForPageRender();

    await user.click(screen.getByRole("button", { name: "Chat" }));

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/chats/${PRIVATE_CHAT_DETAILS.id}`
      );
    });
  });

  test("saves new private chat info and navigates to chat preview when chat button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([
      findContactById,
      isBlockedByUserFalse,
      findPrivateChatWithContactNull,
    ]);
    await waitForPageRender();

    await user.click(screen.getByRole("button", { name: "Chat" }));

    await waitFor(async () => {
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "new-chat-info",
        JSON.stringify(NewPrivateChatDetails)
      );
      expect(mockNavigate).toHaveBeenCalledWith("/chats/new");
    });
  });

  test("blocks contact when block contact button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([
      findContactById,
      isBlockedByUserFalse,
      toggleBlockContactTrue,
    ]);
    await waitForPageRender();

    await toggleBlockContact(user, "Block");

    await waitFor(async () => {
      expect(screen.getByText("You have blocked the contact."));
    });
  });

  test("unblocks contact when unblock contact button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([
      findContactByIdBlocked,
      isBlockedByUserFalse,
      toggleBlockContactFalse,
    ]);
    await waitForPageRender();

    await toggleBlockContact(user, "Unblock");

    await waitFor(async () => {
      expect(screen.queryByText("You have blocked the contact.")).toBeNull();
    });
  });

  test("removes contact and navigates to contacts page when remove contact button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent([findContactById, isBlockedByUserFalse, removeContact]);
    await waitForPageRender();

    await user.click(screen.getByRole("button", { name: "Remove Contact" }));

    await waitFor(async () => {
      expect(
        screen.getByText("Are you sure you want to remove the contact?")
      ).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(async () => {
      expect(mockNavigate).toHaveBeenCalledWith("/contacts/removed");
    });
  });
});
