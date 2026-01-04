import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import { mockNavigate, meMock } from "./helpers/mocks";
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
    <MockedProvider mocks={[meMock]}>
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    </MockedProvider>
  );

describe("<Settings />", () => {
  test("renders menu", async () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: "Settings" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Profile" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Appearance" })).toBeDefined();
  });
});
