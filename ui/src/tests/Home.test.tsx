import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Home from "../components/Home";

describe("<Home />", () => {
  test("renders component", async () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Messaging App" })
    ).toBeDefined();
  });
});
