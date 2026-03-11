import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GraphQLError } from "graphql";
import { MotionGlobalConfig } from "framer-motion";

// Disable Framer Motion animations in component tests
MotionGlobalConfig.skipAnimations = true;

afterEach(() => {
  cleanup();
});

// Suppress expected GraphQL errors during CI test runs
if (process.env.CI === "true") {
  process.on("unhandledRejection", (reason: unknown) => {
    if (reason instanceof GraphQLError) {
      return;
    }
  });
}
