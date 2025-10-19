import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import { allChatsByUserEmpty, allChatsByUser, userChatsMock } from "./mocks";
import Chats from "../components/Chats";
import { formatDisplayDate, truncateText } from "../helpers";

const renderComponent = (mocks = [allChatsByUser]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <Chats />
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
        const latestMessage = messages[messages.length - 1];

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
});
