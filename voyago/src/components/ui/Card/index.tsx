"use client";

import { forwardRef, HTMLAttributes } from "react";
import cs from "classnames";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cs(
          "bg-white rounded-2xl border border-[#a8a29e]/10 shadow-sm transition-all",
          hoverable && "hover:shadow-xl hover:-translate-y-1 hover:border-[#ea580c]/20",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cs("px-6 pt-6 pb-3 border-b border-[#a8a29e]/10", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardHeader.displayName = "CardHeader";

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cs("p-6", className)} {...props}>
        {children}
      </div>
    );
  }
);
CardBody.displayName = "CardBody";

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cs("px-6 py-4 border-t border-[#a8a29e]/10", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardBody, CardFooter };