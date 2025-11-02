import type { ModalOptions } from "../types";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import useModal from "../hooks/useModal";

import ModalProvider from "../components/ModalProvider";

const mockCallback = vi.fn();

const alertModalOptions: ModalOptions = {
  type: "alert",
  title: "Alert",
  message: "Message",
  close: "Cancel",
  confirm: "Confirm",
  callback: mockCallback,
};

const TestComponent = ({ modalOptions }: { modalOptions: ModalOptions }) => {
  const modal = useModal();

  return (
    <div>
      <button onClick={() => modal(modalOptions)}>Open Modal</button>
      <div>Content</div>
    </div>
  );
};

const renderComponent = (modalOptions: ModalOptions = alertModalOptions) => {
  return render(
    <ModalProvider>
      <TestComponent modalOptions={modalOptions} />
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

    await waitFor(() => {
      expect(screen.queryByTestId("notification-modal")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirm" })
      ).toBeInTheDocument();
    });
  });

  test("closes modal when clicking outside of it", async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByRole("button", { name: "Open Modal" }));

    await waitFor(() => {
      expect(screen.queryByTestId("notification-modal")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirm" })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("overlay"));

    await waitFor(() =>
      expect(screen.queryByTestId("notification-modal")).not.toBeInTheDocument()
    );
  });

  test("opens alert modal when modal type is alert", async () => {
    const user = userEvent.setup();

    renderComponent(alertModalOptions);

    await user.click(screen.getByRole("button", { name: "Open Modal" }));

    await waitFor(() => {
      expect(screen.queryByTestId("notification-modal")).toBeInTheDocument();
      expect(screen.queryByTestId("alert-modal")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirm" })
      ).toBeInTheDocument();
    });
  });

  test("opens danger modal when modal type is danger", async () => {
    const user = userEvent.setup();

    const dangerModalOptions: ModalOptions = {
      ...alertModalOptions,
      type: "danger",
    };

    renderComponent(dangerModalOptions);

    await user.click(screen.getByRole("button", { name: "Open Modal" }));

    await waitFor(() => {
      expect(screen.queryByTestId("notification-modal")).toBeInTheDocument();
      expect(screen.queryByTestId("danger-modal")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirm" })
      ).toBeInTheDocument();
    });
  });

  test("opens success modal when modal type is danger", async () => {
    const user = userEvent.setup();

    const successModalOptions: ModalOptions = {
      ...alertModalOptions,
      type: "success",
    };

    renderComponent(successModalOptions);

    await user.click(screen.getByRole("button", { name: "Open Modal" }));

    await waitFor(() => {
      expect(screen.queryByTestId("notification-modal")).toBeInTheDocument();
      expect(screen.queryByTestId("success-modal")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirm" })
      ).toBeInTheDocument();
    });
  });

  test("shows only close button when confirm or callback is not provided", async () => {
    const user = userEvent.setup();

    const modalOptionsWithoutConfirm: ModalOptions = {
      type: "alert",
      title: "Alert",
      message: "Message",
      close: "Close",
    };

    renderComponent(modalOptionsWithoutConfirm);

    await user.click(screen.getByRole("button", { name: "Open Modal" }));

    await waitFor(() => {
      expect(screen.getByTestId("notification-modal")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Confirm" })
      ).not.toBeInTheDocument();
    });
  });

  test("closes modal without action when close button is clicked", async () => {
    const user = userEvent.setup();

    renderComponent(alertModalOptions);

    await user.click(screen.getByRole("button", { name: "Open Modal" }));

    await waitFor(() => {
      expect(screen.queryByTestId("notification-modal")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirm" })
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: alertModalOptions.close })
    );

    await waitFor(() => {
      expect(screen.queryByTestId("notification-modal")).toBeNull();
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  test("closes modal with action when confirm button is clicked", async () => {
    const user = userEvent.setup();

    renderComponent(alertModalOptions);

    await user.click(screen.getByRole("button", { name: "Open Modal" }));

    await waitFor(() => {
      expect(screen.queryByTestId("notification-modal")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirm" })
      ).toBeInTheDocument();
    });
    await user.click(
      screen.getByRole("button", { name: alertModalOptions.confirm })
    );

    await waitFor(() => {
      expect(screen.queryByTestId("notification-modal")).toBeNull();
      expect(mockCallback).toHaveBeenCalled();
    });
  });
});
