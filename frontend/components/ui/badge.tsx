import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "secondary" | "brand";
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-muted text-muted-foreground",
  outline: "border bg-background text-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  brand: "bg-brand-soft text-foreground",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export default Badge;
