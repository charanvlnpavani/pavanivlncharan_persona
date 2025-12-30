import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "secondary";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium";
  const variants: Record<string, string> = {
    default: "bg-muted text-muted-foreground",
    outline: "border bg-background",
    secondary: "bg-secondary text-secondary-foreground",
  };

  return (
    <span
      data-slot="badge"
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}

export default Badge;
