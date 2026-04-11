import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import Avatar from "../components/ui/Avatar";

describe("<Avatar />", () => {
  test("renders avatar image when avatar prop is provided", () => {
    const avatarUrl = "https://example.com/avatar.jpg";
    const name = "John Doe";

    render(<Avatar name={name} size="medium" avatar={avatarUrl} />);

    const imgElement = screen.getByAltText(`${name}'s avatar`);
    expect(imgElement).toBeDefined();
    expect(imgElement).toHaveAttribute("src", avatarUrl);
  });
});
