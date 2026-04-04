import { createContext } from "react";
import type { ModalOptions } from "../types";

const ModalContext = createContext<((options: ModalOptions) => void) | null>(
  null,
);

export default ModalContext;
