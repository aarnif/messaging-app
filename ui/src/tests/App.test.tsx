import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import App from "../App";
import { meMock, meNullMock } from "./mocks";

const renderComponent = (initialEntries = ["/"], mocks = [meMock]) =>
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
    renderComponent(["/signin"], [meMock]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    });
  });

  test("redirects to home page from sign up when authenticated", async () => {
    renderComponent(["/signup"], [meMock]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    });
  });

  test("renders home page", async () => {
    renderComponent(["/"]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
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
      expect(screen.getByText("Contacts Page")).toBeDefined();
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
