// Helper function to simulate beforeInput event
export const simulateBeforeInput = (element: HTMLElement, data: string | null) => {
  const event = new InputEvent("beforeinput", {
    bubbles: true,
    cancelable: true,
    data,
  });
  element.dispatchEvent(event);
};
