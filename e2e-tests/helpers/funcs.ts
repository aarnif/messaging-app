import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const signUp = async (
  page: Page,
  username: string,
  password: string,
  confirmPassword: string
) => {
  await page.getByRole("button", { name: "Sign Up" }).click();
  await expect(page.getByRole("heading", { name: "Sign Up" })).toBeVisible();

  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page
    .getByRole("textbox", { name: "Password", exact: true })
    .fill(password);
  await page
    .getByRole("textbox", { name: "Confirm Password" })
    .fill(confirmPassword);

  await page.getByRole("button", { name: "Sign Up" }).click();
};

export const signIn = async (
  page: Page,
  username: string,
  password: string
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
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
};

export const addContacts = async (
  page: Page,
  users: {
    name: string;
    username: string;
    password: string;
    confirmPassword: string;
  }[]
) => {
  await page.getByTestId("contacts-nav-item").click();
  await expect(page.getByRole("heading", { name: /Contacts/ })).toBeVisible();
  await expect(page.getByText("No contacts found.")).toBeVisible();
  await page.getByTestId("add-new-contacts").click();
  for (const user of users) {
    await page.getByRole("button", { name: user.username }).click();
  }
  await page.getByTestId("add-contacts-button").click();
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
    page.getByRole("heading", { name: "New Private Chat" })
  ).toBeVisible();
};
