import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
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
} from "./helpers/mocks";
import Profile from "../components/Profile";
import type { MockLink } from "@apollo/client/testing";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useMatch: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

const { name, username } = currentUserChatAdminMock;

const renderComponent = (mocks: MockLink.MockedResponse[] = [editProfile24h]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <Profile currentUser={currentUserChatAdminMock} />
      </MemoryRouter>
    </MockedProvider>
  );

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

    await waitFor(() => {
      expect(
        screen.getByText("Profile name must be at least three characters long")
      ).toBeDefined();
    });

    await waitForElementToBeRemoved(
      () =>
        screen.queryByText(
          "Profile name must be at least three characters long"
        ),
      { timeout: 3500 }
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

    await waitFor(async () => {
      expect(
        screen.queryByRole("heading", { name: "Change Password" })
      ).toBeNull();
    });
  });

  test("display error if all fields are not filled", async () => {
    const user = userEvent.setup();
    renderComponent();

    assertProfilePageLoaded();

    await openChangePasswordModal(user);

    await user.click(screen.getByTestId("change-password-button"));

    await waitFor(() => {
      expect(screen.getByText("Please fill all fields.")).toBeDefined();
    });

    await waitForElementToBeRemoved(
      () => screen.queryByText("Please fill all fields."),
      { timeout: 3500 }
    );
  });

  test("display error if passwords do not match", async () => {
    const user = userEvent.setup();
    renderComponent();

    assertProfilePageLoaded();

    await openChangePasswordModal(user);

    await user.type(
      screen.getByPlaceholderText("Enter your current password..."),
      "password"
    );
    await user.type(
      screen.getByPlaceholderText("Enter your new password..."),
      "new-password"
    );
    await user.type(
      screen.getByPlaceholderText("Confirm your new password..."),
      "new-passwor"
    );

    await user.click(screen.getByTestId("change-password-button"));

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeDefined();
    });

    await waitForElementToBeRemoved(
      () => screen.queryByText("Passwords do not match"),
      { timeout: 3500 }
    );
  });

  test("display error if current password is wrong", async () => {
    const user = userEvent.setup();
    renderComponent([changePasswordError]);

    assertProfilePageLoaded();

    await openChangePasswordModal(user);

    await user.type(
      screen.getByPlaceholderText("Enter your current password..."),
      "wrong"
    );
    await user.type(
      screen.getByPlaceholderText("Enter your new password..."),
      "newpassword"
    );
    await user.type(
      screen.getByPlaceholderText("Confirm your new password..."),
      "newpassword"
    );

    await user.click(screen.getByTestId("change-password-button"));

    await waitFor(() => {
      expect(screen.getByText("Current password do not match")).toBeDefined();
    });

    await waitForElementToBeRemoved(
      () => screen.queryByText("Current password do not match"),
      { timeout: 3500 }
    );
  });

  test("changes password succesfully and closes modal", async () => {
    const user = userEvent.setup();
    renderComponent([changePassword]);

    assertProfilePageLoaded();

    await openChangePasswordModal(user);

    await user.type(
      screen.getByPlaceholderText("Enter your current password..."),
      "password"
    );
    await user.type(
      screen.getByPlaceholderText("Enter your new password..."),
      "newpassword"
    );
    await user.type(
      screen.getByPlaceholderText("Confirm your new password..."),
      "newpassword"
    );

    await user.click(screen.getByTestId("change-password-button"));

    await waitFor(
      async () => {
        expect(
          screen.queryByRole("heading", { name: "Change Password" })
        ).toBeNull();
      },
      { timeout: 2000 }
    );
  });
});
