import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const signUp = async (
  page: Page,
  username: string,
  password: string,
  confirmPassword: string,
) => {
  await page.getByRole("button", { name: "Sign Up" }).click();
  await page
    .getByRole("textbox", { name: "Confirm Password" })
    .waitFor({ state: "visible" });
  await expect(
    page.getByRole("heading", { name: "Messaging App" }),
  ).toBeVisible();

  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page
    .getByRole("textbox", { name: "Password", exact: true })
    .fill(password);
  await page
    .getByRole("textbox", { name: "Confirm Password" })
    .fill(confirmPassword);

  await page.getByTestId("submit-button").waitFor({ state: "attached" });
  await page.getByTestId("submit-button").click({ force: true });
};

export const signIn = async (
  page: Page,
  username: string,
  password: string,
) => {
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page
    .getByRole("textbox", { name: "Password", exact: true })
    .fill(password);

  await page.getByRole("button", { name: "Sign In" }).click();
};

export const logout = async (page: Page) => {
  await page.getByTestId("logout-button").click();
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(
    page.getByRole("heading", { name: "Messaging App" }),
  ).toBeVisible();
};

export const addContacts = async (
  page: Page,
  users: {
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
  }[],
) => {
  await page.getByTestId("contacts-nav-item").click();
  await expect(page.getByRole("heading", { name: /Contacts/ })).toBeVisible();
  await expect(page.getByText("No contacts found.")).toBeVisible();
  await page.getByTestId("add-new-contacts").click();
  for (const user of users) {
    await page.getByRole("button", { name: user.username }).click();
  }
  await page.getByTestId("add-contacts-button").click();

  await expect(
    page.getByRole("heading", { name: "Add Contacts" }),
  ).not.toBeVisible();
};

export const blockContact = async (page: Page) => {
  await page.getByRole("button", { name: "Block Contact" }).click();
  await page.getByRole("button", { name: "Block", exact: true }).click();

  await expect(page.getByText("You have blocked the contact.")).toBeVisible();
};

export const openPrivateChatModal = async (page: Page) => {
  await page.getByTestId("create-new-chat").click();
  await page.getByRole("button", { name: "New Private Chat" }).click();

  await expect(
    page.getByRole("heading", { name: "New Private Chat" }),
  ).toBeVisible();
};

export const openGroupChatModal = async (page: Page) => {
  await page.getByTestId("create-new-chat").click();
  await page.getByRole("button", { name: "New Group Chat" }).click();

  await expect(
    page.getByRole("heading", { name: "New Group Chat" }),
  ).toBeVisible();
};

export const addMembersToChat = async (
  page: Page,
  users: {
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
  }[],
) => {
  for (const user of users) {
    await page.getByRole("button", { name: user.username }).click();
  }
};

export const sendMessage = async (page: Page, message: string) => {
  await page.getByTestId("message-input").fill(message);
  await page.getByTestId("send-message-button").click();
};

export const createPrivateChat = async (
  page: Page,
  user?: {
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
  },
  initialMessage?: string,
) => {
  await openPrivateChatModal(page);

  if (user) {
    await page.getByRole("button", { name: user.username }).click();
  }

  await page.getByTestId("create-chat-button").click();

  await page.waitForTimeout(1000);

  if (initialMessage) {
    await sendMessage(page, initialMessage);
  }
};

export const createGroupChat = async (
  page: Page,
  chatName: string,
  chatDescription: string,
  users: {
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
  }[],
  initialMessage?: string,
) => {
  await openGroupChatModal(page);

  await page.getByRole("textbox", { name: "Name", exact: true }).fill(chatName);
  await page
    .getByRole("textbox", { name: "Description", exact: true })
    .fill(chatDescription);

  await addMembersToChat(page, users);

  await page.getByTestId("create-chat-button").click();

  await page.waitForTimeout(1000);

  if (initialMessage) {
    await sendMessage(page, initialMessage);
  }
};

export const openChatInfoModal = async (page: Page) => {
  await page.getByTestId("chat-info-button").click();

  await expect(
    page.getByRole("heading", { name: "Chat", exact: true }),
  ).toBeVisible();
};

export const editGroupChat = async (
  page: Page,
  chatName: string,
  chatDescription: string,
  chatMembers: {
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
  }[],
) => {
  await openChatInfoModal(page);

  await page.getByTestId("edit-chat-button").click();

  await expect(
    page.getByRole("heading", { name: "Edit Chat", exact: true }),
  ).toBeVisible();

  await page.getByRole("textbox", { name: "Name", exact: true }).fill(chatName);

  await page
    .getByRole("textbox", { name: "Description", exact: true })
    .fill(chatDescription);

  const modal = page.getByTestId("edit-chat-modal");

  const currentMembers = await modal.getByTestId("selected").all();

  for (let i = 0; i < currentMembers.length; ++i) {
    await currentMembers[i].click();
  }

  for (const user of chatMembers) {
    await modal.getByRole("button", { name: user.username }).click();
  }

  await page.getByTestId("submit-button").click();
};

export const editProfile = async (page: Page, name: string, about?: string) => {
  await page.getByTestId("settings-nav-item").click();
  await page.getByTestId("edit-profile-button").click();

  await page.getByRole("textbox", { name: "Name", exact: true }).fill(name);

  if (about) {
    await page.getByRole("textbox", { name: "About", exact: true }).fill(about);
  }

  await page.getByTestId("submit-edit-profile-button").click();
};

export const changePassword = async (
  page: Page,
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string,
) => {
  await page.getByTestId("settings-nav-item").click();
  await page.getByRole("button", { name: "Change Password" }).click();

  await page
    .getByRole("textbox", { name: "Current Password", exact: true })
    .fill(currentPassword);
  await page
    .getByRole("textbox", { name: "New Password", exact: true })
    .fill(newPassword);
  await page
    .getByRole("textbox", { name: "Confirm New Password", exact: true })
    .fill(confirmNewPassword);

  await page.getByTestId("change-password-button").click();
};

export const openAppearanceSettings = async (page: Page) => {
  await page.getByTestId("settings-nav-item").click();
  await page.getByRole("link", { name: "Appearance" }).click();
};

export const signUpMultipleUsers = async (
  page: Page,
  users: {
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
  }[],
) => {
  for (const user of users) {
    await signUp(page, user.username, user.password, user.confirmPassword);
    await logout(page);
  }
};

export const assertErrorNotifyAndClose = async (
  page: Page,
  message: string,
) => {
  await expect(page.getByText(message)).toBeVisible();
  await page.getByTestId("close-notify-message").click();
  await expect(page.getByText(message)).not.toBeVisible();
};
