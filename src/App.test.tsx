import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./components/SceneViewport", () => ({
  SceneViewport: () => <div data-testid="3d-scene">3D lifecycle scene</div>,
}));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("App", () => {
  it("keeps stage inspection separate from active progress", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Plan in focus" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "03 Test, Waiting" }));

    expect(screen.getByRole("heading", { name: "Test" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Plan in focus" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "03 Test, Waiting" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("announces failure, recovers, completes, and resets the loop", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Simulate failure" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failure signal at Plan",
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );

    await user.click(screen.getByRole("button", { name: "Simulate success" }));
    expect(
      screen.getByRole("heading", { name: "Code in focus" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    for (let index = 0; index < 4; index += 1) {
      await user.click(screen.getByRole("button", { name: "Advance stage" }));
    }

    expect(
      screen.getByRole("heading", { name: "Cycle complete" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "5",
    );
    expect(
      screen.getByRole("button", { name: "Advance stage" }),
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Reset loop" }));
    expect(
      screen.getByRole("heading", { name: "Plan in focus" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
  });

  it("exposes every stage and action as named DOM controls", () => {
    render(<App />);
    const navigation = screen.getByRole("navigation", { name: "SDLC stages" });

    expect(within(navigation).getAllByRole("button")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Advance stage" })).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Simulate success" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Simulate failure" }),
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: "Reset loop" })).toBeEnabled();
  });
});
