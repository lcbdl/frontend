import { Component, mergeProps } from "solid-js";

interface LoadingProps {
  /**
   * Accessible label for the loading indicator.
   * Defaults to "Loading..." if not provided.
   */
  message?: string;
  class?: string;
}

/**
 * A simple accessible loading spinner component for SolidJS.
 * Uses Tailwind CSS's `animate-spin` and `sr-only` utilities.
 */
const Loading: Component<LoadingProps> = (props) => {
  const mergedProps = mergeProps(props, { message: "loading", class: "h-6 w-6 animate-spin text-gray-600" });

  return (
    <div role="status" aria-live="polite" class="flex justify-center">
      <svg
        class={`${mergedProps.class} mx-auto`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <title>{mergedProps.message}</title>
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span class="sr-only">{mergedProps.message}</span>
    </div>
  );
};

export default Loading;
