import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import Chats from "../components/Chats";

describe("<Chats />", () => {
  test("renders component", async () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <Chats />
        </MemoryRouter>
      </MockedProvider>
    );
    expect(screen.getByRole("heading", { name: "Chats" })).toBeDefined();
    expect(
      screen.getByPlaceholderText("Search by title or description...")
    ).toBeDefined();
  });
});
