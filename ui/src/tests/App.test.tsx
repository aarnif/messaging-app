import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import type { MockLink } from "@apollo/client/testing";
import App from "../App";
import {
  meMock,
  meNullMock,
  allChatsByUser,
  allContactsByUser,
  findChatById,
  CHAT_DETAILS,
  findContactById,
  isBlockedByUserFalse,
  CONTACT_DETAILS,
} from "./mocks";

Element.prototype.scrollIntoView = vi.fn();

const renderComponent = (
  initialEntries = ["/"],
  mocks: MockLink.MockedResponse[] = [meMock]
) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </MockedProvider>
  );

describe("<App />", () => {
  test("renders sign in page", async () => {
    renderComponent(["/signin"], [meNullMock]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Sign In" })).toBeDefined();
    });
  });

  test("renders sign up page", async () => {
    renderComponent(["/signup"], [meNullMock]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Sign Up" })).toBeDefined();
    });
  });

  test("redirects from home page to sign in when not authenticated", async () => {
    renderComponent(["/"], [meNullMock]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Sign In" })).toBeDefined();
    });
  });

  test("redirects to home page from sign in when authenticated", async () => {
    renderComponent(["/signin"], [meMock, allChatsByUser]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    });
  });

  test("redirects to home page from sign up when authenticated", async () => {
    renderComponent(["/signup"], [meMock, allChatsByUser]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    });
  });

  test("renders home page", async () => {
    renderComponent(["/"], [meMock, allChatsByUser]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    });
  });

  test("renders chat page", async () => {
    renderComponent(["/chats/1"], [meMock, allChatsByUser, findChatById]);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: CHAT_DETAILS.name })
      ).toBeDefined();
    });
  });

  test("renders new chat preview page", async () => {
    renderComponent(["/chats/new"], [meMock, allChatsByUser, findChatById]);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: CHAT_DETAILS.name })
      ).toBeDefined();
    });
  });

  test("renders contacts page", async () => {
    renderComponent(["/contacts"], [meMock, allContactsByUser]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Contacts" })).toBeDefined();
    });
  });

  test("renders contact page", async () => {
    renderComponent(
      ["/contacts/1"],
      [meMock, allContactsByUser, findContactById, isBlockedByUserFalse]
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: CONTACT_DETAILS.contactDetails.name,
        })
      ).toBeDefined();
    });
  });

  test("renders profile page", async () => {
    renderComponent(["/profile"]);

    await waitFor(() => {
      expect(screen.getByText("Profile Page")).toBeDefined();
    });
  });

  test("renders settings page", async () => {
    renderComponent(["/settings"]);

    await waitFor(() => {
      expect(screen.getByText("Settings Page")).toBeDefined();
    });
  });

  test("renders not found page for unknown routes", async () => {
    renderComponent(["/unknown"]);

    await waitFor(() => {
      expect(screen.getByText("Page Not Found")).toBeDefined();
    });
  });
});
