import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { MemoryRouter } from "react-router";
import Menu from "../components/Menu";

const renderComponent = () =>
  render(
    <MemoryRouter>
      <Menu />
    </MemoryRouter>
  );

describe("<Menu />", () => {
  test("renders component", () => {
    renderComponent();

    expect(screen.getByRole("link", { name: "Chats" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Contacts" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Profile" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Settings" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Log Out" })).toBeDefined();
  });
});
