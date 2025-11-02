import { createContext } from "react";

const ModalContext = createContext<(() => void) | null>(null);

export default ModalContext;
