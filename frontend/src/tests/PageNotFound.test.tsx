import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, test, vi } from "vitest";
import NotificationProvider from "../components/NotificationProvider";
import PageNotFound from "../pages/PageNotFound";
import { mockNavigate } from "./helpers/mocks";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderComponent = () => {
  render(
    <MockedProvider>
      <MemoryRouter>
        <NotificationProvider>
          <PageNotFound />
        </NotificationProvider>
      </MemoryRouter>
    </MockedProvider>,
  );
};

describe("<PageNotFound />", () => {
  test("renders page with 404 and message", async () => {
    renderComponent();

    expect(screen.getByText("404")).toBeDefined();
    expect(screen.getByText("Page Not Found")).toBeDefined();
    expect(
      screen.getByText(
        "Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.",
      ),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "Go Back" })).toBeDefined();
  });

  test("navigates back to previous page", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole("button", { name: "Go Back" }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
