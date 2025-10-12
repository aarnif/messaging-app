import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import SignIn from "../components/SignIn";

const renderComponent = () => render(<SignIn />);

describe("<SignIn />", () => {
  test("renders component", () => {
    renderComponent();

    expect(screen.getByText("Sign In")).toBeDefined();
  });
});
