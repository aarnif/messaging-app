import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import SelectionPrompt from "../components/ui/SelectionPrompt";

describe("<SelectionPrompt />", () => {
  test("renders message with correct text", () => {
    const message = "Select a contact to start chatting";
    render(<SelectionPrompt message={message} />);

    expect(screen.getByText(message)).toBeDefined();
  });
});
