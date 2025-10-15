import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { MemoryRouter } from "react-router";
import Home from "../components/Home";

describe("<Home />", () => {
  test("renders component", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Messaging App" })
    ).toBeDefined();
  });
});
