import { Fragment } from "react";
import { UnifiedDesignSystem } from "@shared/design-system";

export const formatUrl = (url: string) => {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
};

export const isValid = (val: string | undefined): boolean => {
  return !!(
    val &&
    val.trim().toLowerCase() !== "n/a" &&
    val.trim().toLowerCase() !== "none"
  );
};

export interface ContactItemProps {
  label: string;
  value: string | undefined;
  isLink?: boolean;
  href?: string;
  linkColor?: string;
}

export function ContactItem({
  label,
  value,
  isLink = false,
  href,
  linkColor = UnifiedDesignSystem.colors.primary,
}: ContactItemProps) {
  if (!isValid(value)) return null;

  return (
    <Fragment>
      {isLink ? (
        <a
          href={href || value}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: linkColor,
            textDecoration: "none",
            borderBottom: "1px dotted currentColor",
          }}
        >
          {label === "Email" || label === "Phone" ? value : formatUrl(value!)}
        </a>
      ) : (
        <span>{value}</span>
      )}
    </Fragment>
  );
}
