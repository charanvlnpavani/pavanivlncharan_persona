import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";

type ButtonVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

export interface ButtonClickProps {
  logo?: React.ReactNode;
  titleName: string;
  /** External URL */
  link?: string;
  /** Internal route (react-router) */
  to?: string;
  /** Single variant or array to combine styles */
  variant?: ButtonVariant | ButtonVariant[];
  onClick?: () => void;
  className?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  /** When true and `link` is set, the anchor will include the `download` attribute */
  download?: boolean;
}

export const ButtonClick: React.FC<ButtonClickProps> = ({
  logo,
  titleName,
  link,
  to,
  variant,
  onClick,
  className,
  target,
  download,
}) => {
  if (to && link) {
    console.warn(
      "ButtonClick received both 'to' and 'link' — 'to' will take precedence."
    );
  }

  const content = (
    <span className="flex items-center gap-2">
      {logo && (
        <span className="w-5 h-5 flex items-center justify-center">{logo}</span>
      )}
      <span>{titleName}</span>
    </span>
  );

  // Support passing multiple variants as an array — we merge their computed classes
  const variantClasses = Array.isArray(variant)
    ? variant.map((v) => buttonVariants({ variant: v })).join(" ")
    : "";

  // If variant is an array we don't pass a single variant prop to the underlying Button
  const passVariant = Array.isArray(variant) ? undefined : variant;

  const classes = ["text-blue-950", className, variantClasses]
    .filter(Boolean)
    .join(" ");

  // Internal route using react-router Link
  if (to) {
    return (
      <Button
        asChild
        variant={passVariant}
        className={classes}
        onClick={onClick}
      >
        <Link to={to}>{content}</Link>
      </Button>
    );
  }

  // External link
  if (link) {
    if (link === "") {
      console.warn(
        "ButtonClick received an empty 'link'. Provide a valid URL or use 'to' or 'onClick'."
      );
    }

    const rel = target === "_blank" ? "noopener noreferrer" : undefined;

    return (
      <Button
        asChild
        variant={passVariant}
        className={classes}
        onClick={onClick}
      >
        <a
          href={link}
          target={target ?? "_blank"}
          rel={rel}
          {...(download ? { download: "" } : {})}
        >
          {content}
        </a>
      </Button>
    );
  }

  // Regular button
  return (
    <Button variant={passVariant} className={classes} onClick={onClick}>
      {content}
    </Button>
  );
};
