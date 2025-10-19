import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import {
  allContactsByUserEmpty,
  allContactsByUser,
  userContactsMock,
} from "./mocks";
import Contacts from "../components/Contacts";

const renderComponent = (mocks = [allContactsByUser]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <Contacts />
      </MemoryRouter>
    </MockedProvider>
  );

describe("<Contacts />", () => {
  test("renders component", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Contacts" })).toBeDefined();
      expect(
        screen.getByPlaceholderText("Search by name or username...")
      ).toBeDefined();
    });
  });

  test("displays no contacts found if user has none", async () => {
    renderComponent([allContactsByUserEmpty]);

    await waitFor(() => {
      expect(screen.getByText("No contacts found.")).toBeDefined();
    });
  });

  test("displays all users contacts", async () => {
    renderComponent();

    await waitFor(() => {
      userContactsMock.forEach((contact) => {
        const { username, name, about } = contact.contactDetails;
        expect(screen.getByText(`@${username}`)).toBeDefined();
        expect(screen.getByText(name)).toBeDefined();
        expect(screen.getByText(about ?? "")).toBeDefined();
      });
    });
  });
});
