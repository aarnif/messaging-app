import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { MemoryRouter } from "react-router";
import App from "../App";

const renderComponent = (initialEntries = ["/"]) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
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

  test("renders chats page", () => {
    renderComponent(["/chats"]);

    expect(screen.getByText("Chats")).toBeDefined();
  });

  test("renders chat page", () => {
    renderComponent(["/chats/1"]);

    expect(screen.getByText("Chat with ID 1")).toBeDefined();
  });

  test("renders contacts page", () => {
    renderComponent(["/contacts"]);

    expect(screen.getByText("Contacts")).toBeDefined();
  });

  test("renders contact page", () => {
    renderComponent(["/contacts/1"]);

    expect(screen.getByText("Contact with ID 1")).toBeDefined();
  });

  test("renders profile page", () => {
    renderComponent(["/profile"]);

    expect(screen.getByText("Profile")).toBeDefined();
  });

  test("renders settings page", () => {
    renderComponent(["/settings"]);

    expect(screen.getByText("Settings")).toBeDefined();
  });

  test("renders not found page for unmatched routes", () => {
    renderComponent(["/unknown"]);

    expect(screen.getByText("Page Not Found")).toBeDefined();
  });
});
