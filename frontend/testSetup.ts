import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import { GraphQLError } from "graphql";
import { afterEach } from "vitest";

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
