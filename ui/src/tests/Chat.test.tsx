import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter, useMatch } from "react-router";
import { findChatById, findChatByIdNull, CHAT_DETAILS } from "./mocks";
import Chat from "../components/Chat";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useMatch: vi.fn(),
  };
});

const renderComponent = (mocks = [findChatById]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={["/chats/1"]}>
        <Chat />
      </MemoryRouter>
    </MockedProvider>
  );

describe("<Chat />", () => {
  test("renders component", async () => {
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
          CHAT_DETAILS.members.map((member) => member.name).join(", ")
        )
      ).toBeDefined();
    });
  });

  test("displays chat not found if chat does not exists", async () => {
    renderComponent([findChatByIdNull]);

    await waitFor(() => {
      expect(screen.getByText("Chat not found.")).toBeDefined();
      expect(
        screen.getByText("It may have been deleted or the link is incorrect.")
      ).toBeDefined();
    });
  });
});
