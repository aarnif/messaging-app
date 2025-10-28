import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import Menu from "../components/Menu";
import { mockClient, mockNavigate } from "./mocks";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@apollo/client/react", async () => {
  const actual = await vi.importActual("@apollo/client/react");
  return {
    ...actual,
    useApolloClient: () => mockClient,
  };
});

Object.defineProperty(global, "localStorage", { value: localStorage });

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
    expect(screen.getByRole("link", { name: "Settings" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Log Out" })).toBeDefined();
  });

  test("highlight active menu item on item click", async () => {
    const user = userEvent.setup();

    renderComponent();

    const contactLink = screen.getByRole("link", { name: "Contacts" });

    await user.click(contactLink);

    expect(contactLink.className).toContain("active");
  });

  test("logs out and navigates to signin page on log up button click", async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole("button", { name: "Log Out" }));

    expect(localStorage.clear).toHaveBeenCalled();
    expect(mockClient.resetStore).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });
});
