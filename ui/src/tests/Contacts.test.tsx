import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
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
} from "./helpers/mocks";
import {
  assertContactsDisplayed,
  selectContacts,
  assertContactsSelected,
} from "./helpers/funcs";
import Contacts from "../components/Contacts";
import type { MockLink } from "@apollo/client/testing";
import type { User } from "../__generated__/graphql";

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

const waitForPageRender = async () => {
  await waitFor(() => {
    expect(screen.getByRole("heading", { name: "Contacts" })).toBeDefined();
    expect(
      screen.getByPlaceholderText("Search by name or username...")
    ).toBeDefined();
  });
};

const assertUsersDisplayed = (users: User[]) => {
  users.forEach((user) => {
    const { name, username, about } = user;
    expect(screen.getByText(name)).toBeDefined();
    expect(screen.getByText(`@${username}`)).toBeDefined();
    expect(screen.getByText(about ?? "")).toBeDefined();
  });
};

describe("<Contacts />", () => {
  test("renders contacts list header", async () => {
    renderComponent();

    await waitForPageRender();
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
      assertContactsDisplayed(userContactsMock);
    });
  });

  describe("adding new contacts", () => {
    test("shows add contacts modal when new add contacts button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent([allContactsByUser, nonContactUsers]);

      await waitForPageRender();

      await user.click(screen.getByRole("button"));

      await waitFor(async () => {
        expect(screen.getByText("Add Contacts")).toBeDefined();
      });
    });

    test("closes add contacts modal when close modal button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent([allContactsByUser, nonContactUsers]);

      await waitForPageRender();

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

      await waitForPageRender();

      await user.click(screen.getByRole("button"));

      await waitFor(async () => {
        expect(screen.getByText("Add Contacts")).toBeDefined();
        expect(screen.getByText("No users found")).toBeDefined();
      });
    });

    test("displays error if no user is selected", async () => {
      const user = userEvent.setup();
      renderComponent([allContactsByUser, nonContactUsers, addContactsEmpty]);

      await waitForPageRender();

      await user.click(screen.getByRole("button"));

      await waitFor(async () => {
        expect(screen.getByText("Add Contacts")).toBeDefined();
        assertUsersDisplayed(nonContactUsersMock);
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

      await waitForPageRender();

      await user.click(screen.getByRole("button"));

      await waitFor(async () => {
        expect(screen.getByText("Add Contacts")).toBeDefined();
        assertUsersDisplayed(nonContactUsersMock);
      });

      await selectContacts(user, [contact1username, contact2username]);

      await waitFor(async () => {
        assertContactsSelected([contact1username, contact2username]);
      });
    });

    test("closes modal when new contacts has been added", async () => {
      const user = userEvent.setup();
      renderComponent([allContactsByUser, nonContactUsers, addContacts]);

      await waitForPageRender();

      await user.click(screen.getByRole("button"));

      await waitFor(async () => {
        expect(screen.getByText("Add Contacts")).toBeDefined();
        assertUsersDisplayed(nonContactUsersMock);
      });

      await selectContacts(user, [contact1username, contact2username]);

      await waitFor(async () => {
        assertContactsSelected([contact1username, contact2username]);
      });

      await user.click(screen.getByTestId("add-contacts-button"));

      await waitFor(async () => {
        expect(screen.queryByText("Add Contacts")).toBeNull();
      });
    });
  });
});
