import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import type { MockLink } from "@apollo/client/testing";
import { MemoryRouter } from "react-router";
import {
  mockNavigate,
  currentUserChatAdminMock,
  findChatByIdGroup,
  findChatByIdNull,
  sendMessage,
  USER_ONE_DETAILS,
  MESSAGE_DETAILS,
  NewPrivateChatDetails,
  NewGroupChatDetails,
} from "./helpers/mocks";
import NewChat from "../components/NewChat";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockCreateChat = vi.fn();

vi.mock("@apollo/client/react", async () => {
  const actual = await vi.importActual("@apollo/client/react");
  return {
    ...actual,
    useMutation: vi.fn(() => [mockCreateChat, { loading: false, error: null }]),
  };
});

const renderComponent = (
  mocks: MockLink.MockedResponse[] = [
    findChatByIdGroup,
    findChatByIdNull,
    sendMessage,
  ]
) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <NewChat currentUser={currentUserChatAdminMock} />
      </MemoryRouter>
    </MockedProvider>
  );

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
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(screen.getByPlaceholderText("New Message...")).toBeDefined();
    });

    await user.click(screen.getByTestId("send-message-button"));

    await waitFor(() => {
      expect(mockCreateChat).not.toHaveBeenCalledWith({
        variables: {
          input: {
            name: null,
            members: [NewPrivateChatDetails.members[1].id],
            description: null,
            initialMessage: MESSAGE_DETAILS.content,
          },
        },
      });
    });
  });

  test("creates chat successfully and navigates to the created chat page", async () => {
    mockCreateChat.mockResolvedValue({
      data: {
        createChat: { id: 1 },
      },
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
      expect(mockCreateChat).toHaveBeenCalledWith({
        variables: {
          input: {
            name: NewPrivateChatDetails.name,
            members: [NewPrivateChatDetails.members[1].id],
            description: NewPrivateChatDetails.description,
            initialMessage: MESSAGE_DETAILS.content,
          },
        },
      });
      expect(mockNavigate).toHaveBeenCalledWith("/chats/1");
      expect(input.value).toBe("");
    });
  });
});
