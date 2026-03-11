import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import ModalProvider from "../components/ModalProvider";
import Home from "../components/Home";
import { mockSetToken } from "./helpers/mocks";

describe("<Home />", () => {
  test("renders component", async () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <ModalProvider>
            <Home setToken={mockSetToken} />
          </ModalProvider>
        </MemoryRouter>
      </MockedProvider>
    );

    expect(
      screen.getByRole("heading", { name: "Messaging App" })
    ).toBeDefined();
  });
});
