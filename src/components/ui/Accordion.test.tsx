import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Accordion, AccordionContent, AccordionItem, useAccordionResize } from "./Accordion";

// Mock lucide-solid icons
vi.mock("lucide-solid", () => ({
  ChevronDown: (props: any) => <div data-testid="chevron-down" {...props} />,
  ChevronRight: (props: any) => <div data-testid="chevron-right" {...props} />,
}));

// Mock utility functions
vi.mock("@/utils/cls-util", () => ({
  cn: (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(" "),
}));

vi.mock("@/utils/common-utils", () => ({
  getFocusableElements: (container: Element) =>
    container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
}));

// Helper to create a basic accordion structure
const TestAccordion = (props: any = {}) => (
  <Accordion {...props}>
    <AccordionItem index={0} title="Item 1">
      <div data-testid="content-1">Content 1</div>
    </AccordionItem>
    <AccordionItem index={1} title="Item 2">
      <div data-testid="content-2">Content 2</div>
    </AccordionItem>
    <AccordionItem index={2} title="Item 3">
      <div data-testid="content-3">Content 3</div>
    </AccordionItem>
  </Accordion>
);

describe("Accordion", () => {
  beforeEach(() => {
    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock MutationObserver
    global.MutationObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock requestAnimationFrame
    // @ts-expect-error mock error
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  describe("Basic Functionality", () => {
    it("renders accordion with items", () => {
      render(() => <TestAccordion />);

      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
      expect(screen.getByText("Item 3")).toBeInTheDocument();
    });

    it("has correct ARIA attributes", () => {
      render(() => <TestAccordion />);

      const accordion = screen.getByRole("region");
      expect(accordion).toHaveAttribute("aria-label", "Accordion");

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button, index) => {
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).toHaveAttribute("aria-controls", `accordion-content-${index}`);
        expect(button).toHaveAttribute("aria-labelledby", `accordion-header-${index}`);
      });
    });

    it("toggles single item by default", async () => {
      render(() => <TestAccordion />);

      const button1 = screen.getByText("Item 1").closest("button")!;

      fireEvent.click(button1);

      await waitFor(() => {
        expect(button1).toHaveAttribute("aria-expanded", "true");
      });

      // Click second item should close first and open second
      const button2 = screen.getByText("Item 2").closest("button")!;
      fireEvent.click(button2);

      await waitFor(() => {
        expect(button1).toHaveAttribute("aria-expanded", "false");
        expect(button2).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("allows multiple items open when isMulti is true", async () => {
      render(() => <TestAccordion isMulti={true} />);

      const button1 = screen.getByText("Item 1").closest("button")!;
      const button2 = screen.getByText("Item 2").closest("button")!;

      fireEvent.click(button1);
      fireEvent.click(button2);

      await waitFor(() => {
        expect(button1).toHaveAttribute("aria-expanded", "true");
        expect(button2).toHaveAttribute("aria-expanded", "true");
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("opens/closes with Enter key", async () => {
      render(() => <TestAccordion />);

      const button1 = screen.getByText("Item 1").closest("button")!;

      fireEvent.keyDown(button1, { key: "Enter" });

      await waitFor(() => {
        expect(button1).toHaveAttribute("aria-expanded", "true");
      });

      fireEvent.keyDown(button1, { key: "Enter" });

      await waitFor(() => {
        expect(button1).toHaveAttribute("aria-expanded", "false");
      });
    });

    it("opens/closes with Space key", async () => {
      render(() => <TestAccordion />);

      const button1 = screen.getByText("Item 1").closest("button")!;

      fireEvent.keyDown(button1, { key: " " });

      await waitFor(() => {
        expect(button1).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("navigates between items with arrow keys", () => {
      render(() => <TestAccordion />);

      const buttons = screen.getAllByRole("button");
      const button1 = buttons[0];
      const button2 = buttons[1];

      // Focus first button
      button1.focus();
      expect(document.activeElement).toBe(button1);

      // Arrow down should focus next button
      const focusSpy = vi.spyOn(button2, "focus");
      fireEvent.keyDown(button1, { key: "ArrowDown" });
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe("Props and Configuration", () => {
    it("respects activeIndex prop", async () => {
      render(() => <TestAccordion activeIndex={[1]} />);

      const button2 = screen.getByText("Item 2").closest("button")!;

      await waitFor(() => {
        expect(button2).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("calls onChange when item is toggled", async () => {
      const onChange = vi.fn();
      render(() => <TestAccordion onChange={onChange} />);

      const button1 = screen.getByText("Item 1").closest("button")!;
      fireEvent.click(button1);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith([0]);
      });
    });

    it("disables accordion when disabled prop is true", () => {
      render(() => <TestAccordion disabled={true} />);

      const accordion = screen.getByRole("region");
      expect(accordion).toHaveClass("pointer-events-none", "opacity-60");
    });

    it("respects collapsible=false to keep at least one item open", async () => {
      render(() => <TestAccordion activeIndex={[0]} collapsible={false} />);

      const button1 = screen.getByText("Item 1").closest("button")!;

      // Try to close the only open item
      fireEvent.click(button1);

      // Should remain open since collapsible is false
      await waitFor(() => {
        expect(button1).toHaveAttribute("aria-expanded", "true");
      });
    });
  });

  describe("AccordionItem", () => {
    it("shows selected value count when provided", () => {
      render(() => (
        <Accordion>
          <AccordionItem index={0} title="Item 1" selectedValueCount={3}>
            Content
          </AccordionItem>
        </Accordion>
      ));

      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByLabelText("3 selected")).toBeInTheDocument();
    });

    it("uses chevron right when chevronRight prop is true", () => {
      render(() => (
        <Accordion>
          <AccordionItem index={0} title="Item 1" chevronRight={true}>
            Content
          </AccordionItem>
        </Accordion>
      ));

      expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
      expect(screen.queryByTestId("chevron-down")).not.toBeInTheDocument();
    });

    it("applies custom classes", () => {
      render(() => (
        <Accordion>
          <AccordionItem index={0} title="Item 1" buttonClass="custom-button" contentClass="custom-content">
            Content
          </AccordionItem>
        </Accordion>
      ));

      const content = screen.getByText("Content");
      expect(content).toHaveClass("custom-content");
    });

    it("disables individual items when disabled prop is true", () => {
      render(() => (
        <Accordion>
          <AccordionItem index={0} title="Item 1" disabled={true}>
            Content
          </AccordionItem>
        </Accordion>
      ));

      const button = screen.getByText("Item 1").closest("button")!;
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).toBeDisabled();
    });
  });

  describe("Height Management", () => {
    it("sets up ResizeObserver when autoResize is enabled", () => {
      const mockObserve = vi.fn();
      global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: mockObserve,
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }));

      render(() => <TestAccordion autoResize={true} />);

      expect(global.ResizeObserver).toHaveBeenCalled();
    });

    it("applies min and max height constraints", () => {
      render(() => (
        <Accordion>
          <AccordionItem index={0} title="Item 1" minHeight={100} maxHeight={200}>
            <div style={{ height: "300px" }}>Large Content</div>
          </AccordionItem>
        </Accordion>
      ));

      const contentContainer = screen.getByText("Large Content").parentElement!;
      expect(contentContainer).toHaveStyle({ "max-height": "200px" });
    });
  });

  describe("AccordionContent", () => {
    it("renders content with custom class", () => {
      const TestWithAccordionContent = () => (
        <Accordion>
          <AccordionItem index={0} title="Item 1">
            <AccordionContent class="custom-content-class">
              <div data-testid="wrapped-content">Wrapped Content</div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      render(() => <TestWithAccordionContent />);

      expect(screen.getByTestId("wrapped-content")).toBeInTheDocument();
    });
  });

  describe("useAccordionResize Hook", () => {
    it("throws error when used outside accordion context", () => {
      const TestComponent = () => {
        try {
          useAccordionResize();
          return <div>Should not render</div>;
        } catch (error) {
          return <div data-testid="error">Error caught {JSON.stringify(error)}</div>;
        }
      };

      render(() => <TestComponent />);
      expect(screen.getByTestId("error")).toBeInTheDocument();
    });
  });

  describe("Focus Management", () => {
    it("manages tabindex for focusable elements inside content", async () => {
      render(() => (
        <Accordion>
          <AccordionItem index={0} title="Item 1">
            <button data-testid="inner-button">Inner Button</button>
            <input data-testid="inner-input" />
          </AccordionItem>
        </Accordion>
      ));

      const accordionButton = screen.getByText("Item 1").closest("button")!;
      const innerButton = screen.getByTestId("inner-button");
      const innerInput = screen.getByTestId("inner-input");

      // Initially, inner elements should not be focusable
      expect(innerButton).toHaveAttribute("tabindex", "-1");
      expect(innerInput).toHaveAttribute("tabindex", "-1");

      // Open accordion
      fireEvent.click(accordionButton);

      await waitFor(() => {
        expect(innerButton).toHaveAttribute("tabindex", "0");
        expect(innerInput).toHaveAttribute("tabindex", "0");
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles JSXElement titles", () => {
      render(() => (
        <Accordion>
          <AccordionItem index={0} title={<span data-testid="custom-title">Custom Title</span>}>
            Content
          </AccordionItem>
        </Accordion>
      ));

      expect(screen.getByTestId("custom-title")).toBeInTheDocument();
    });

    it("updates active indexes when activeIndex prop changes", async () => {
      const TestWithSignal = () => {
        const [activeIndex, setActiveIndex] = createSignal([0]);

        return (
          <>
            <button data-testid="change-active" onClick={() => setActiveIndex([1])}>
              Change Active
            </button>
            <TestAccordion activeIndex={activeIndex()} />
          </>
        );
      };

      render(() => <TestWithSignal />);

      // Initially first item should be open
      await waitFor(() => {
        const button1 = screen.getByText("Item 1").closest("button")!;
        expect(button1).toHaveAttribute("aria-expanded", "true");
      });

      // Change active index
      fireEvent.click(screen.getByTestId("change-active"));

      await waitFor(() => {
        const button1 = screen.getByText("Item 1").closest("button")!;
        const button2 = screen.getByText("Item 2").closest("button")!;
        expect(button1).toHaveAttribute("aria-expanded", "false");
        expect(button2).toHaveAttribute("aria-expanded", "true");
      });
    });
  });
});
