import type { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";
import NotificationProvider from "../components/NotificationProvider";
import NewChat from "../pages/NewChat";
import { assertErrorModalAndDismissal, sendNewMessage } from "./helpers/funcs";
import {
  createChat,
  createChatError,
  currentChatItemAdminMock,
  findChatByIdGroup,
  findChatByIdNull,
  MESSAGE_DETAILS,
  mockNavigate,
  mockUseOutletContext,
  NewGroupChatDetails,
  NewPrivateChatDetails,
  sendMessage,
  USER_ONE_DETAILS,
} from "./helpers/mocks";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useOutletContext: () => mockUseOutletContext(),
  };
});

const renderComponent = (
  mocks: MockLink.MockedResponse[] = [
    findChatByIdGroup,
    findChatByIdNull,
    sendMessage,
    createChat,
  ],
) => {
  mockUseOutletContext.mockReturnValue({
    currentUser: currentChatItemAdminMock,
  });

  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <NotificationProvider>
          <NewChat />
        </NotificationProvider>
      </MemoryRouter>
    </MockedProvider>,
  );
};

describe("<NewChat />", () => {
  beforeEach(() => {
    localStorage.setItem(
      "new-chat-info",
      JSON.stringify(NewPrivateChatDetails),
    );
  });

  test("shows new private chat name and not members", async () => {
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: NewPrivateChatDetails.name }),
      ).toBeDefined();
      expect(
        screen.queryByText(
          NewPrivateChatDetails.members
            ?.map((member) =>
              member?.username === USER_ONE_DETAILS.username
                ? "You"
                : member?.name,
            )
            .join(", "),
        ),
      ).toBeNull();
    });
  });

  test("shows new group chat name and members", async () => {
    localStorage.setItem("new-chat-info", JSON.stringify(NewGroupChatDetails));
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: NewGroupChatDetails.name }),
      ).toBeDefined();
      expect(
        screen.getByText(
          NewGroupChatDetails.members
            ?.map((member) =>
              member?.username === USER_ONE_DETAILS.username
                ? "You"
                : member?.name,
            )
            .join(", "),
        ),
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

  test("does not create new chat when message input is empty", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(screen.getByPlaceholderText("New Message...")).toBeDefined();
    });

    await user.click(screen.getByTestId("send-message-button"));

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a message before sending."),
      ).toBeDefined();
    });
  });

  test("creates chat successfully and navigates to the created chat page", async () => {
    const user = userEvent.setup();
    renderComponent();

    await sendNewMessage(user, MESSAGE_DETAILS.content);

    await waitFor(() => {
      const input = screen.getByPlaceholderText(
        "New Message...",
      ) as HTMLInputElement;
      expect(input.value).toBe("");
      expect(mockNavigate).toHaveBeenCalledWith("/chats/1");
    });
  });

  test("displays error modal when create chat fails", async () => {
    const user = userEvent.setup();
    renderComponent([
      findChatByIdGroup,
      findChatByIdNull,
      sendMessage,
      createChatError,
    ]);

    await sendNewMessage(user, MESSAGE_DETAILS.content);

    await assertErrorModalAndDismissal(user, "Failed to Create Chat");
  });
});
