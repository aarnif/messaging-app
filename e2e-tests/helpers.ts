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
