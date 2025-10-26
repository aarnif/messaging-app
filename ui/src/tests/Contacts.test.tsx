import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { describe, test, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import {
  allContactsByUserEmpty,
  allContactsByUser,
  userContactsMock,
  nonContactUsers,
  nonContactUsersEmpty,
  nonContactUsersMock,
  addContacts,
  addContactsEmpty,
} from "./mocks";
import Contacts from "../components/Contacts";
import type { MockLink } from "@apollo/client/testing";

const contact1username = nonContactUsersMock[0].username;
const contact2username = nonContactUsersMock[1].username;

const renderComponent = (
  mocks: MockLink.MockedResponse[] = [allContactsByUser]
) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <Contacts />
      </MemoryRouter>
    </MockedProvider>
  );

describe("<Contacts />", () => {
  test("renders contacts list header", async () => {
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

  describe("adding new contacts", () => {
    test("shows add contacts modal when new add contacts button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent([allContactsByUser, nonContactUsers]);

      await waitFor(async () => {
        expect(screen.getByRole("heading", { name: "Contacts" })).toBeDefined();
      });

      await user.click(screen.getByRole("button"));

      await waitFor(async () => {
        expect(screen.getByText("Add Contacts")).toBeDefined();
      });
    });

    test("closes add contacts modal when close modal button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent([allContactsByUser, nonContactUsers]);

      await waitFor(async () => {
        expect(screen.getByRole("heading", { name: "Contacts" })).toBeDefined();
      });

      await user.click(screen.getByRole("button"));

      await waitFor(async () => {
        expect(screen.getByText("Add Contacts")).toBeDefined();
      });

      await user.click(screen.getByTestId("close-modal-button"));

      await waitFor(async () => {
        expect(screen.queryByText("Add Contacts")).toBeNull();
      });
    });

    test("show no users if every user is already a contact", async () => {
      const user = userEvent.setup();
      renderComponent([allContactsByUser, nonContactUsersEmpty]);

      await waitFor(async () => {
        expect(screen.getByRole("heading", { name: "Contacts" })).toBeDefined();
      });

      await user.click(screen.getByRole("button"));

      await waitFor(async () => {
        expect(screen.getByText("Add Contacts")).toBeDefined();
        expect(screen.getByText("No users found")).toBeDefined();
      });
    });

    test("displays error if no user is selected", async () => {
      const user = userEvent.setup();
      renderComponent([allContactsByUser, nonContactUsers, addContactsEmpty]);

      await waitFor(async () => {
        expect(screen.getByRole("heading", { name: "Contacts" })).toBeDefined();
      });

      await user.click(screen.getByRole("button"));

      await waitFor(async () => {
        expect(screen.getByText("Add Contacts")).toBeDefined();
        nonContactUsersMock.forEach((user) => {
          const { name, username, about } = user;
          expect(screen.getByText(name)).toBeDefined();
          expect(screen.getByText(`@${username}`)).toBeDefined();
          expect(screen.getByText(about)).toBeDefined();
        });
      });

      await user.click(screen.getByTestId("add-contacts-button"));

      await waitFor(() => {
        expect(screen.getByText("Select at least one contact.")).toBeDefined();
      });

      await waitForElementToBeRemoved(
        () => screen.queryByText("Select at least one contact."),
        { timeout: 3500 }
      );
    });

    test("selects users when user button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent([allContactsByUser, nonContactUsers]);

      await waitFor(async () => {
        expect(screen.getByRole("heading", { name: "Contacts" })).toBeDefined();
      });

      await user.click(screen.getByRole("button"));

      await waitFor(async () => {
        expect(screen.getByText("Add Contacts")).toBeDefined();
        nonContactUsersMock.forEach((user) => {
          const { name, username, about } = user;
          expect(screen.getByText(name)).toBeDefined();
          expect(screen.getByText(`@${username}`)).toBeDefined();
          expect(screen.getByText(about)).toBeDefined();
        });
      });

      await user.click(screen.getByText(`@${contact1username}`));
      await user.click(screen.getByText(`@${contact2username}`));

      await waitFor(async () => {
        const selectedContacts = screen.getAllByTestId("selected");
        expect(selectedContacts[0]).toBeDefined();
        expect(
          within(selectedContacts[0]).getByText(`@${contact1username}`)
        ).toBeDefined();
        expect(selectedContacts[1]).toBeDefined();
        expect(
          within(selectedContacts[1]).getByText(`@${contact2username}`)
        ).toBeDefined();
      });
    });

    test("closes modal when new contacts has been added", async () => {
      const user = userEvent.setup();
      renderComponent([allContactsByUser, nonContactUsers, addContacts]);

      await waitFor(async () => {
        expect(screen.getByRole("heading", { name: "Contacts" })).toBeDefined();
      });

      await user.click(screen.getByRole("button"));

      await waitFor(async () => {
        expect(screen.getByText("Add Contacts")).toBeDefined();
        nonContactUsersMock.forEach((user) => {
          const { name, username, about } = user;
          expect(screen.getByText(name)).toBeDefined();
          expect(screen.getByText(`@${username}`)).toBeDefined();
          expect(screen.getByText(about)).toBeDefined();
        });
      });

      await user.click(screen.getByText(`@${contact1username}`));
      await user.click(screen.getByText(`@${contact2username}`));

      await waitFor(async () => {
        const selectedContacts = screen.getAllByTestId("selected");
        expect(selectedContacts[0]).toBeDefined();
        expect(
          within(selectedContacts[0]).getByText(`@${contact1username}`)
        ).toBeDefined();
        expect(selectedContacts[1]).toBeDefined();
        expect(
          within(selectedContacts[1]).getByText(`@${contact2username}`)
        ).toBeDefined();
      });

      await user.click(screen.getByTestId("add-contacts-button"));

      await waitFor(async () => {
        expect(screen.queryByText("Add Contacts")).toBeNull();
      });
    });
  });
});
