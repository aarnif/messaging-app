import { screen, waitFor, within } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { expect } from "vitest";
import type { Contact } from "../../__generated__/graphql";

export const assertContactsDisplayed = (contacts: Contact[]) => {
  contacts.forEach((contact) => {
    const { id, name, username, about } = contact.contactDetails;
    const user = screen.getByTestId(`user-${id}`);
    expect(within(user).getByText(name)).toBeDefined();
    expect(within(user).getByText(`@${username}`)).toBeDefined();
    expect(within(user).getByText(about ?? "")).toBeDefined();
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
      within(selectedContacts[index]).getByText(`@${username}`),
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
  user: UserEvent,
  errorMessage: string,
) => {
  await waitFor(() => {
    expect(screen.getByText(errorMessage)).toBeDefined();
  });

  await user.click(screen.getByTestId("close-notify-message"));

  await waitFor(() => {
    expect(screen.queryByText(errorMessage)).toBeNull();
  });
};

export const assertErrorModalAndDismissal = async (
  user: UserEvent,
  errorMessage: string,
) => {
  await waitFor(() => {
    expect(screen.getByRole("heading", { name: errorMessage })).toBeDefined();
  });

  await user.click(screen.getByRole("button", { name: "Close" }));
};
