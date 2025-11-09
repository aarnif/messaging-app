import { expect } from "vitest";
import {
  screen,
  within,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
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

export const sendNewMessage = async (user: UserEvent, message: string) => {
  await waitFor(async () => {
    expect(screen.getByPlaceholderText("New Message...")).toBeDefined();
  });

  if (message) {
    await user.type(screen.getByPlaceholderText("New Message..."), message);
  }

  await user.click(screen.getByTestId("send-message-button"));
};

export const assertErrorMessageAndDismissal = async (
  errorMessage: string,
  timeout = 3500
) => {
  await waitFor(() => {
    expect(screen.getByText(errorMessage)).toBeDefined();
  });

  await waitForElementToBeRemoved(() => screen.queryByText(errorMessage), {
    timeout,
  });
};
