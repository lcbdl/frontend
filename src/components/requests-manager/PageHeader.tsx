import { JSX } from "solid-js";

interface PageHeaderProps {
  icon: JSX.Element;
  title: string;
  breadcrumb: {
    home?: string;
    current: string;
  };
  actionButton?: {
    label: string;
    icon: JSX.Element;
    onClick: () => void;
    variant?: "primary" | "secondary" | "flat";
    type?: "button" | "submit";
  };
}

export const PageHeader = (props: PageHeaderProps) => {
  return (
    <div class="flex flex-col border-t border-gray-200 bg-white px-4 py-5 sm:px-6 md:flex-row md:justify-between lg:border-t-0">
      <div class="flex flex-shrink-0">
        <div class="my-auto mr-4">{props.icon}</div>

        <div>
          <p class="text-xl font-medium">{props.title}</p>
          <div class="flex flex-row space-x-2 text-xs tracking-tight text-gray-700">
            <p>{props.breadcrumb.home || "Home"}</p>
            <span>/</span>
            <p>{props.breadcrumb.current}</p>
          </div>
        </div>
      </div>

      {props.actionButton && (
        <div class="mt-5 flex flex-row space-x-3 md:my-auto">
          <button
            class={
              props.actionButton.variant === "flat"
                ? "inline-flex items-center rounded-md border border-transparent px-4 py-1.5 text-sm font-medium text-gray-700 transition ease-in-out hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                : props.actionButton.variant === "primary"
                  ? "inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  : "inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }
            onClick={props.actionButton.onClick}
            type={props.actionButton.type || "button"}
          >
            {props.actionButton.icon}
            <span>{props.actionButton.label}</span>
          </button>
        </div>
      )}
    </div>
  );
};
