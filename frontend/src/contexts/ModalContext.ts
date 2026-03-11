import type { ModalOptions } from "../types";
import { createContext } from "react";

const ModalContext = createContext<((options: ModalOptions) => void) | null>(
  null
);

export default ModalContext;
