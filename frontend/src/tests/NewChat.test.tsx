import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import type { MockLink } from "@apollo/client/testing";
import { MemoryRouter } from "react-router";
import {
  mockNavigate,
  mockUseOutletContext,
  currentUserChatAdminMock,
  findChatByIdGroup,
  findChatByIdNull,
  sendMessage,
  createChat,
  USER_ONE_DETAILS,
  MESSAGE_DETAILS,
  NewPrivateChatDetails,
  NewGroupChatDetails,
} from "./helpers/mocks";
import { sendNewMessage } from "./helpers/funcs";
import NewChat from "../components/NewChat";

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
  ]
) => {
  mockUseOutletContext.mockReturnValue({
    currentUser: currentUserChatAdminMock,
  });

  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <NewChat />
      </MemoryRouter>
    </MockedProvider>
  );
};

describe("<NewChat />", () => {
  beforeEach(() => {
    localStorage.setItem(
      "new-chat-info",
      JSON.stringify(NewPrivateChatDetails)
    );
  });

  test("shows new private chat name and not members", async () => {
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: NewPrivateChatDetails.name })
      ).toBeDefined();
      expect(
        screen.queryByText(
          NewPrivateChatDetails.members
            ?.map((member) =>
              member?.username === USER_ONE_DETAILS.username
                ? "You"
                : member?.name
            )
            .join(", ")
        )
      ).toBeNull();
    });
  });

  test("shows new group chat name and members", async () => {
    localStorage.setItem("new-chat-info", JSON.stringify(NewGroupChatDetails));
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: NewGroupChatDetails.name })
      ).toBeDefined();
      expect(
        screen.getByText(
          NewGroupChatDetails.members
            ?.map((member) =>
              member?.username === USER_ONE_DETAILS.username
                ? "You"
                : member?.name
            )
            .join(", ")
        )
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
    const consoleLogSpy = vi.spyOn(console, "log");

    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(screen.getByPlaceholderText("New Message...")).toBeDefined();
    });

    await user.click(screen.getByTestId("send-message-button"));

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith("Do not send empty message!");
    });
  });

  test("creates chat successfully and navigates to the created chat page", async () => {
    const user = userEvent.setup();
    renderComponent();

    await sendNewMessage(user, MESSAGE_DETAILS.content);

    await waitFor(() => {
      const input = screen.getByPlaceholderText(
        "New Message..."
      ) as HTMLInputElement;
      expect(input.value).toBe("");
      expect(mockNavigate).toHaveBeenCalledWith("/chats/1");
    });
  });
});
