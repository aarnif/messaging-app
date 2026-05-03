import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import NotificationProvider from "../components/NotificationProvider";
import Home from "../pages/Home";
import { mockSetToken } from "./helpers/mocks";

describe("<Home />", () => {
  test("renders component", async () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <NotificationProvider>
            <Home setToken={mockSetToken} />
          </NotificationProvider>
        </MemoryRouter>
      </MockedProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Messaging App" }),
    ).toBeDefined();
  });
});
