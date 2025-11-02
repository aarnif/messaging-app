import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import useModal from "../hooks/useModal";

import ModalProvider from "../components/ModalProvider";

const TestComponent = () => {
  const modal = useModal();

  return (
    <div>
      <button onClick={() => modal()}>Open Modal</button>
      <div>Content</div>
    </div>
  );
};

const renderComponent = () => {
  return render(
    <ModalProvider>
      <TestComponent />
    </ModalProvider>
  );
};

describe("<ModalProvider />", () => {
  test("renders content", () => {
    renderComponent();

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  test("modal is not visible by default", () => {
    renderComponent();

    expect(screen.queryByTestId("notification-modal")).not.toBeInTheDocument();
  });

  test("opens modal when open button is clicked", async () => {
    const user = userEvent.setup();

    renderComponent();

    expect(screen.getByText("Content")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open Modal" }));

    await waitFor(() =>
      expect(screen.queryByTestId("notification-modal")).toBeInTheDocument()
    );
  });

  test("closes modal when clicking outside of it", async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole("button", { name: "Open Modal" }));

    await waitFor(() =>
      expect(screen.getByTestId("notification-modal")).toBeInTheDocument()
    );

    await user.click(screen.getByTestId("overlay"));

    await waitFor(() =>
      expect(screen.queryByTestId("notification-modal")).not.toBeInTheDocument()
    );
  });
});
