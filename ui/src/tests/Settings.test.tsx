import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { mockNavigate } from "./mocks";
import Settings from "../components/Settings";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderComponent = () =>
  render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>
  );

describe("<Settings />", () => {
  test("renders menu", async () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: "Settings" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Edit Profile" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Appearance" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Change Password" })).toBeDefined();
  });
});
