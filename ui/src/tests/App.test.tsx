import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import App from "../App";
import { ME } from "../graphql/queries";
import type { MockLink } from "@apollo/client/testing";

const meMock: MockLink.MockedResponse = {
  request: {
    query: ME,
  },
  result: {
    data: {
      me: {
        id: "1",
        username: "user1",
        name: "User1",
        about: null,
        avatar: null,
      },
    },
  },
};

const meNull: MockLink.MockedResponse = {
  request: {
    query: ME,
  },
  result: {
    data: {
      me: null,
    },
  },
};

const renderComponent = (initialEntries = ["/"], mocks = [meMock]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </MockedProvider>
  );

describe("<App />", () => {
  test("renders index page", () => {
    renderComponent();

    expect(screen.getByText("Index")).toBeDefined();
  });

  test("renders sign in page", () => {
    renderComponent(["/signin"]);

    expect(screen.getByText("Sign In")).toBeDefined();
  });

  test("renders sign up page", () => {
    renderComponent(["/signup"]);

    expect(screen.getByText("Sign Up")).toBeDefined();
  });

  test("redirects user to sign in page if not logged in", () => {
    renderComponent(["/chats"], [meNull]);

    expect(screen.getByText("Sign In")).toBeDefined();
  });

  test("renders chats page", async () => {
    renderComponent(["/chats"]);

    await waitFor(() => {
      expect(screen.getByText("Chats")).toBeDefined();
    });
  });

  test("renders chat page", async () => {
    renderComponent(["/chats/1"]);

    await waitFor(() => {
      expect(screen.getByText("Chat with ID 1")).toBeDefined();
    });
  });

  test("renders contacts page", async () => {
    renderComponent(["/contacts"]);

    await waitFor(() => {
      expect(screen.getByText("Contacts")).toBeDefined();
    });
  });

  test("renders contact page", async () => {
    renderComponent(["/contacts/1"]);

    await waitFor(() => {
      expect(screen.getByText("Contact with ID 1")).toBeDefined();
    });
  });

  test("renders profile page", async () => {
    renderComponent(["/profile"]);

    await waitFor(() => {
      expect(screen.getByText("Profile")).toBeDefined();
    });
  });

  test("renders settings page", async () => {
    renderComponent(["/settings"]);

    await waitFor(() => {
      expect(screen.getByText("Settings")).toBeDefined();
    });
  });

  test("renders not found page for unmatched routes", () => {
    renderComponent(["/unknown"]);

    expect(screen.getByText("Page Not Found")).toBeDefined();
  });
});
