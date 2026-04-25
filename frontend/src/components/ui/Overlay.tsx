import type { HTMLMotionProps, Variants } from "framer-motion";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Animation =
  | "slideRight"
  | "slideTop"
  | "slideBottom"
  | "fadeInOut"
  | "fadeOut";

const animationVariants: Record<Animation, Variants> = {
  slideRight: {
    initial: { x: "100vw", opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { type: "tween" } },
    exit: {
      x: "100vw",
      opacity: 0,
      transition: { delay: 0.4, type: "tween" },
    },
  },
  slideTop: {
    initial: { y: -50, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { delay: 0.4, duration: 0.4, type: "tween" },
    },
    exit: { y: -50, opacity: 0 },
  },
  slideBottom: {
    initial: { y: "100vh", opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: "tween" } },
    exit: { y: "100vh", opacity: 0 },
  },
  fadeInOut: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { type: "tween" } },
    exit: { opacity: 0 },
  },
  fadeOut: {
    animate: { opacity: 1, transition: { type: "tween" } },
    exit: { opacity: 0 },
  },
};

type OverlayProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: ReactNode;
  animation?: Animation;
  onClick: () => void;
  additionalClassName?: string;
};

const Overlay = ({
  children,
  animation = "slideRight",
  onClick,
  additionalClassName,
}: OverlayProps) => {
  const variant = animationVariants[animation];

  const baseClassName =
    `fixed inset-0 bg-black/50 z-40 ${additionalClassName}`.trim();

  return (
    <motion.div
      data-testid="overlay"
      className={baseClassName}
      variants={variant}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Overlay;
