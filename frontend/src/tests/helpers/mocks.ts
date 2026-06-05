import { vi } from "vitest";
import type { InputField } from "../../types";

export const mockClient = {
  resetStore: vi.fn(),
  refetchQueries: vi.fn(),
  query: vi.fn(),
  cache: {
    updateQuery: vi.fn(),
    readQuery: vi.fn(),
    evict: vi.fn(),
    identify: vi.fn(),
  },
};

export const mockNavigate = vi.fn();

export const mockMatch = vi.fn();

export const mockUseOutletContext = vi.fn();

export const mockSetToken = vi.fn();

export const windowMockContent = {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: query === "(prefers-color-scheme: dark)" ? true : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
};

export const mockChatsSearchWord: InputField = {
  name: "search-chats",
  type: "text",
  value: "",
  placeholder: "Search by title or description...",
  setValue: vi.fn(),
  onChange: vi.fn(),
  onReset: vi.fn(),
};
