import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Simple test to validate React Testing Library setup
describe("React Testing Library Setup", () => {
  it("renders a simple div", () => {
    render(<div data-testid="test-div">Hello World</div>);
    expect(screen.getByTestId("test-div")).toBeDefined();
    expect(screen.getByText("Hello World")).toBeDefined();
  });

  it("handles button clicks", async () => {
    const mockClick = vi.fn();
    render(
      <button onClick={mockClick} data-testid="test-button">
        Click Me
      </button>
    );
    
    const button = screen.getByTestId("test-button");
    button.click();
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});