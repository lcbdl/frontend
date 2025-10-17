import { cn } from "@/utils/cls-util.ts";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps, JSX } from "solid-js";
import { splitProps } from "solid-js";

export const buttonVariants = cva(
  "relative inline-flex flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden font-medium shadow-sm   transition ease-in-out focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none disabled:pointer-events-none disabled:opacity-30",
  {
    variants: {
      variant: {
        default: "rounded-md border-transparent bg-sky-700 text-white hover:bg-sky-800 focus:ring-white",
        defaultInverse:
          "rounded-md bg-white font-semibold text-sky-900 ring-1 ring-inset ring-sky-700 hover:bg-sky-700 hover:text-white",
        secondary: "rounded-md border-transparent bg-green-700 text-white hover:bg-green-800 focus:ring-white",
        outlined:
          "rounded-md ring-1 ring-inset ring-gray-300 hover:ring-gray-900 hover:shadow-gray-800/10 bg-white text-gray-900 hover:bg-gray-700 hover:text-white",
        danger: "rounded-md border-transparent bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        icon: "rounded-full border-transparent bg-green-700 text-white hover:bg-green-800 focus:ring-white",
        flat: "rounded-md border-none shadow-none text-sky-900/80 hover:text-sky-900",
      },
      size: {
        sm: "px-2.5 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "sm:w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
    compoundVariants: [
      {
        variant: "icon",
        size: "sm",
        class: "p-1",
      },
      {
        variant: "icon",
        size: "md",
        class: "p-1.5",
      },
      {
        variant: "icon",
        size: "lg",
        class: "p-2",
      },
      {
        variant: "danger",
        size: "sm",
        class: "px-2 py-1 text-sm",
      },
    ],
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    class?: string;
  };

export const Button = (props: ButtonProps) => {
  const [local, rest] = splitProps(props as ButtonProps, ["class", "variant", "size", "fullWidth", "onClick"]);
  const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
    if (local.onClick && typeof local.onClick === "function") {
      local.onClick(e);
    }
  };

  return (
    <button
      class={cn(
        buttonVariants({
          variant: local.variant,
          size: local.size,
          fullWidth: local.fullWidth,
        }),
        local.class,
      )}
      onClick={handleClick}
      {...rest}
    />
  );
};
