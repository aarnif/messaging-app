import { expect } from "vitest";
import { screen, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import type { Contact } from "../../__generated__/graphql";

export const assertContactsDisplayed = (contacts: Contact[]) => {
  contacts.forEach((contact) => {
    const { name, username, about } = contact.contactDetails;
    expect(screen.getByText(name)).toBeDefined();
    expect(screen.getByText(`@${username}`)).toBeDefined();
    expect(screen.getByText(about ?? "")).toBeDefined();
  });
};

export const selectContacts = async (user: UserEvent, usernames: string[]) => {
  for (const username of usernames) {
    await user.click(screen.getByText(`@${username}`));
  }
};

export const assertContactsSelected = (usernames: string[]) => {
  const selectedContacts = screen.getAllByTestId("selected");

  usernames.forEach((username, index) => {
    expect(selectedContacts[index]).toBeDefined();
    expect(
      within(selectedContacts[index]).getByText(`@${username}`)
    ).toBeDefined();
  });
};
