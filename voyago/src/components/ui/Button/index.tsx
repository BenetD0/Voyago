"use client";

import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import cs from "classnames";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ButtonAsLink = BaseButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-md",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
  outline: "border-2 	border-[#ea580c] 	text-[#7c2d12] hover:bg-[#ea580c]/10",
  ghost: "	text-[#7c2d12] hover:bg-[#ea580c]/10",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-4 text-lg",
};

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const { variant = "primary", size = "md", className, children, ...rest } = props;

    const classes = cs(
      "inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if ("href" in props && props.href) {
      return (
        <a ref={ref as React.ForwardedRef<HTMLAnchorElement>} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {children}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        className={classes}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
