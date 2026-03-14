"use client";

import Link from "next/link";
import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useNavigationProgress } from "@/components/layout/navigation-progress";

type AppLinkProps = React.ComponentPropsWithoutRef<typeof Link>;

function isModifiedEvent(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey || event.button !== 0;
}

function getHrefValue(href: AppLinkProps["href"]) {
  if (typeof href === "string") {
    return href;
  }

  return href.pathname?.toString() ?? "";
}

export const AppLink = React.forwardRef<HTMLAnchorElement, AppLinkProps>(
  ({ href, onClick, target, ...props }, ref) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { startNavigation } = useNavigationProgress();

    return (
      <Link
        ref={ref}
        href={href}
        target={target}
        onClick={(event) => {
          onClick?.(event);

          if (event.defaultPrevented || target === "_blank" || isModifiedEvent(event)) {
            return;
          }

          const currentQuery = searchParams.toString();
          const currentPath = currentQuery ? `${pathname}?${currentQuery}` : pathname;
          const nextPath = getHrefValue(href);

          if (!nextPath || nextPath === "#" || nextPath === pathname || nextPath === currentPath) {
            return;
          }

          startNavigation();
        }}
        {...props}
      />
    );
  },
);
AppLink.displayName = "AppLink";
