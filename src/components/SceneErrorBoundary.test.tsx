import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { SceneErrorBoundary } from "./SceneErrorBoundary";

function BrokenScene(): never {
  throw new Error("WebGL setup failed");
}

it("keeps an actionable DOM fallback when the 3D renderer fails", async () => {
  const consoleError = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);
  const retry = vi.fn();
  const user = userEvent.setup();

  render(
    <SceneErrorBoundary onRetry={retry}>
      <BrokenScene />
    </SceneErrorBoundary>,
  );

  expect(screen.getByRole("alert")).toHaveTextContent("3D view paused");
  expect(
    screen.getByText(/lifecycle controls and status remain available/i),
  ).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Retry 3D view" }));
  expect(retry).toHaveBeenCalledOnce();

  consoleError.mockRestore();
});
