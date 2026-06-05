import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, test, vi } from "vitest";
import Settings from "../pages/Settings";
import { mockNavigate } from "./helpers/mocks";
import { meMock } from "./helpers/responses";

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
    </MockedProvider>,
  );

describe("<Settings />", () => {
  test("renders menu", async () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: "Settings" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Profile" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Appearance" })).toBeDefined();
  });
});
