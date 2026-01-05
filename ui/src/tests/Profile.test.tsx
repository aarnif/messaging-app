import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { MemoryRouter } from "react-router";
import {
  currentUserChatAdminMock,
  editProfile24h,
  editProfileUpdate,
  changePassword,
  changePasswordError,
  mockNavigate,
  mockUseOutletContext,
} from "./helpers/mocks";
import { assertErrorMessageAndDismissal } from "./helpers/funcs";
import Profile from "../components/Profile";
import type { MockLink } from "@apollo/client/testing";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useMatch: vi.fn(),
    useNavigate: () => mockNavigate,
    useOutletContext: () => mockUseOutletContext(),
  };
});

const { name, username } = currentUserChatAdminMock;

const renderComponent = (
  mocks: MockLink.MockedResponse[] = [editProfile24h]
) => {
  mockUseOutletContext.mockReturnValue({
    currentUser: currentUserChatAdminMock,
  });

  return render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    </MockedProvider>
  );
};

const assertProfilePageLoaded = async () => {
  expect(screen.getByRole("heading", { name: "Profile" })).toBeDefined();
  expect(screen.getByText(name)).toBeDefined();
  expect(screen.getByText(`@${username}`)).toBeDefined();
  expect(screen.getByTestId("go-back-button")).toBeDefined();
  expect(screen.getByTestId("edit-profile-button")).toBeDefined();
};

const openEditProfileModal = async (user: UserEvent) => {
  await user.click(screen.getByTestId("edit-profile-button"));

  await waitFor(async () => {
    expect(screen.getByRole("heading", { name: "Edit Profile" })).toBeDefined();
    expect(
      screen.getByPlaceholderText("Enter your name here...")
    ).toBeDefined();
    expect(
      screen.getByPlaceholderText("Tell something about yourself...")
    ).toBeDefined();
  });
};

const openChangePasswordModal = async (user: UserEvent) => {
  await user.click(screen.getByRole("button", { name: "Change Password" }));

  await waitFor(async () => {
    expect(
      screen.getByRole("heading", { name: "Change Password" })
    ).toBeDefined();
    expect(
      screen.getByText("Enter your current and the new password.")
    ).toBeDefined();
    expect(
      screen.getByPlaceholderText("Enter your current password...")
    ).toBeDefined();
    expect(
      screen.getByPlaceholderText("Enter your new password...")
    ).toBeDefined();
    expect(
      screen.getByPlaceholderText("Confirm your new password...")
    ).toBeDefined();
  });
};

const fillChangePasswordForm = async (
  user: UserEvent,
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string
) => {
  await user.type(
    screen.getByPlaceholderText("Enter your current password..."),
    currentPassword
  );
  await user.type(
    screen.getByPlaceholderText("Enter your new password..."),
    newPassword
  );
  await user.type(
    screen.getByPlaceholderText("Confirm your new password..."),
    confirmNewPassword
  );
};

const assertChangePasswordModalClosed = async (timeout: number = 2000) => {
  await waitFor(
    async () => {
      expect(
        screen.queryByRole("heading", { name: "Change Password" })
      ).toBeNull();
    },
    { timeout }
  );
};

describe("<Profile />", () => {
  test("renders content", async () => {
    renderComponent();

    assertProfilePageLoaded();
  });

  test("navigates back to settings page when back button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    assertProfilePageLoaded();

    const goBackButton = screen.getByTestId("go-back-button");
    expect(goBackButton).toBeDefined();

    await user.click(goBackButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/settings");
    });
  });

  test("shows edit profile modal when edit profile button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    assertProfilePageLoaded();

    await openEditProfileModal(user);
  });

  test("closes edit profile modal when close button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    assertProfilePageLoaded();

    await openEditProfileModal(user);

    await user.click(screen.getByTestId("close-edit-profile-button"));

    await waitFor(async () => {
      expect(
        screen.queryByRole("heading", { name: "Edit Profile" })
      ).toBeNull();
    });
  });

  test("edit profile fails with empty name", async () => {
    const user = userEvent.setup();
    renderComponent();

    assertProfilePageLoaded();

    await openEditProfileModal(user);

    user.clear(screen.getByPlaceholderText("Enter your name here..."));

    await user.click(screen.getByTestId("submit-edit-profile-button"));

    await assertErrorMessageAndDismissal(
      "Profile name must be at least three characters long"
    );
  });

  test("edits profile name and about text succesfully and closes modal", async () => {
    const user = userEvent.setup();
    renderComponent([editProfileUpdate]);

    assertProfilePageLoaded();

    await openEditProfileModal(user);

    const nameInput = screen.getByPlaceholderText("Enter your name here...");
    const aboutInput = screen.getByPlaceholderText(
      "Tell something about yourself..."
    );

    const newProfileName = "New Profile Name";
    const newAboutText = "New About Text";

    await user.clear(nameInput);
    await user.clear(aboutInput);
    await user.type(nameInput, newProfileName);
    await user.type(aboutInput, newAboutText);

    await user.click(screen.getByTestId("submit-edit-profile-button"));

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Edit Profile" })
      ).toBeNull();
    });
  });

  test("shows change password modal when change password button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    assertProfilePageLoaded();

    await openChangePasswordModal(user);
  });

  test("closes change password modal when close button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    assertProfilePageLoaded();

    await openChangePasswordModal(user);

    await user.click(screen.getByTestId("close-modal-button"));

    await assertChangePasswordModalClosed();
  });

  test("display error if all fields are not filled", async () => {
    const user = userEvent.setup();
    renderComponent();

    assertProfilePageLoaded();

    await openChangePasswordModal(user);

    await user.click(screen.getByTestId("change-password-button"));

    await assertErrorMessageAndDismissal("Please fill all fields.");
  });

  test("display error if passwords do not match", async () => {
    const user = userEvent.setup();
    renderComponent();

    assertProfilePageLoaded();

    await openChangePasswordModal(user);
    await fillChangePasswordForm(user, "password", "newpassword", "newpasswor");

    await user.click(screen.getByTestId("change-password-button"));

    await assertErrorMessageAndDismissal("Passwords do not match");
  });

  test("display error if current password is wrong", async () => {
    const user = userEvent.setup();
    renderComponent([changePasswordError]);

    assertProfilePageLoaded();

    await openChangePasswordModal(user);
    await fillChangePasswordForm(user, "wrong", "newpassword", "newpassword");

    await user.click(screen.getByTestId("change-password-button"));

    await assertErrorMessageAndDismissal("Current password do not match");
  });

  test("changes password succesfully and closes modal", async () => {
    const user = userEvent.setup();
    renderComponent([changePassword]);

    assertProfilePageLoaded();

    await openChangePasswordModal(user);
    await fillChangePasswordForm(
      user,
      "password",
      "newpassword",
      "newpassword"
    );

    await user.click(screen.getByTestId("change-password-button"));

    await assertChangePasswordModalClosed();
  });
});
