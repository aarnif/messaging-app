import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import App from "../App";

describe("<App />", () => {
  test("renders content", async () => {
    render(<App />);

    expect(screen.getByText("Hello World!")).toBeDefined();
  });
});
