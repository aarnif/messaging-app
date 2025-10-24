import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MockedProvider } from "@apollo/client/testing/react";
import type { MockLink } from "@apollo/client/testing";
import { MemoryRouter, useMatch } from "react-router";
import {
  findContactById,
  findContactByIdNull,
  mockNavigate,
  CONTACT_DETAILS,
} from "./mocks";
import Contact from "../components/Contact";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useMatch: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

const renderComponent = (
  mocks: MockLink.MockedResponse[] = [findContactById]
) =>
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={["/contacts/1"]}>
        <Contact />
      </MemoryRouter>
    </MockedProvider>
  );

const contactDetails = CONTACT_DETAILS.contactDetails;

describe("<Contact />", () => {
  test("shows loading spinner during data fetch", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: CONTACT_DETAILS.id },
    });
    renderComponent();
    expect(screen.getByTestId("spinner")).toBeDefined();
  });

  test("shows contact not found message for invalid contact ID", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: "999" },
    });
    renderComponent([findContactByIdNull]);

    await waitFor(() => {
      expect(screen.getByText("Contact not found.")).toBeDefined();
      expect(
        screen.getByText("It may have been deleted or the link is incorrect.")
      ).toBeDefined();
    });
  });

  test("renders contact info", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useMatch as any).mockReturnValue({
      params: { id: CONTACT_DETAILS.id },
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Contact" })).toBeDefined();
      expect(
        screen.getByRole("heading", { name: contactDetails.name })
      ).toBeDefined();
      expect(screen.getByText(`@${contactDetails.username}`)).toBeDefined();
      expect(screen.getByText(contactDetails.about)).toBeDefined();
    });
  });
});
