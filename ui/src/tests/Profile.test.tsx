import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing/react";
import { useMutation } from "@apollo/client/react";
import { MemoryRouter } from "react-router";
import { currentUserMock, editProfile24h, mockNavigate } from "./mocks";
import Profile from "../components/Profile";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useMatch: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

const mockEditProfile = vi.fn();

vi.mock("@apollo/client/react", async () => {
  const actual = await vi.importActual("@apollo/client/react");
  return {
    ...actual,
    useMutation: vi.fn(() => [
      mockEditProfile,
      { loading: false, error: null },
    ]),
  };
});

const { name, username } = currentUserMock;

const renderComponent = (mocks = [editProfile24h]) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter>
        <Profile currentUser={currentUserMock} />
      </MemoryRouter>
    </MockedProvider>
  );

describe("<Profile />", () => {
  test("renders content", async () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: "Profile" })).toBeDefined();
    expect(screen.getByText(name)).toBeDefined();
    expect(screen.getByText(`@${username}`)).toBeDefined();
    expect(screen.getByTestId("go-back-button")).toBeDefined();
    expect(screen.getByTestId("edit-profile-button")).toBeDefined();
  });

  test("navigates back to settings page when back button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    expect(screen.getByRole("heading", { name: "Profile" })).toBeDefined();
    expect(screen.getByText(name)).toBeDefined();
    expect(screen.getByText(`@${username}`)).toBeDefined();

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

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Profile" })).toBeDefined();
      expect(screen.getByText(name)).toBeDefined();
      expect(screen.getByText(`@${username}`)).toBeDefined();
    });

    await user.click(screen.getByTestId("edit-profile-button"));

    await waitFor(async () => {
      expect(
        screen.getByRole("heading", { name: "Edit Profile" })
      ).toBeDefined();
      expect(
        screen.getByPlaceholderText("Enter your name here...")
      ).toBeDefined();
      expect(
        screen.getByPlaceholderText("Tell something about yourself...")
      ).toBeDefined();
    });
  });

  test("closes edit profile modal when close button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Profile" })).toBeDefined();
      expect(screen.getByText(name)).toBeDefined();
      expect(screen.getByText(`@${username}`)).toBeDefined();
    });

    await user.click(screen.getByTestId("edit-profile-button"));

    await waitFor(async () => {
      expect(
        screen.getByRole("heading", { name: "Edit Profile" })
      ).toBeDefined();
      expect(
        screen.getByPlaceholderText("Enter your name here...")
      ).toBeDefined();
      expect(
        screen.getByPlaceholderText("Tell something about yourself...")
      ).toBeDefined();
    });

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

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Profile" })).toBeDefined();
      expect(screen.getByText(name)).toBeDefined();
      expect(screen.getByText(`@${username}`)).toBeDefined();
    });

    await user.click(screen.getByTestId("edit-profile-button"));

    const nameInput = screen.getByPlaceholderText("Enter your name here...");

    await waitFor(async () => {
      expect(
        screen.getByRole("heading", { name: "Edit Profile" })
      ).toBeDefined();
      expect(nameInput).toBeDefined();
      expect(
        screen.getByPlaceholderText("Tell something about yourself...")
      ).toBeDefined();
    });

    user.clear(nameInput);

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
    const mockEditProfile = vi.fn();
    vi.mocked(useMutation).mockReturnValue([
      mockEditProfile,
      {
        data: undefined,
        loading: false,
        error: undefined,
        called: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client: {} as any,
        reset: vi.fn(),
      },
    ]);

    const user = userEvent.setup();
    renderComponent();

    await waitFor(async () => {
      expect(screen.getByRole("heading", { name: "Profile" })).toBeDefined();
      expect(screen.getByText(name)).toBeDefined();
      expect(screen.getByText(`@${username}`)).toBeDefined();
    });

    await user.click(screen.getByTestId("edit-profile-button"));

    const nameInput = screen.getByPlaceholderText("Enter your name here...");
    const aboutInput = screen.getByPlaceholderText(
      "Tell something about yourself..."
    );

    await waitFor(async () => {
      expect(
        screen.getByRole("heading", { name: "Edit Profile" })
      ).toBeDefined();
      expect(nameInput).toBeDefined();
      expect(aboutInput).toBeDefined();
    });

    const newProfileName = "New Profile Name";
    const newAboutText = "New About Text";

    await user.clear(nameInput);
    await user.clear(aboutInput);
    await user.type(nameInput, newProfileName);
    await user.type(aboutInput, newAboutText);

    await user.click(screen.getByTestId("submit-edit-profile-button"));

    await waitFor(() => {
      expect(mockEditProfile).toHaveBeenCalledWith({
        variables: {
          input: {
            name: newProfileName,
            about: newAboutText,
            is24HourClock: currentUserMock.is24HourClock,
          },
        },
      });
    });
  });
});
