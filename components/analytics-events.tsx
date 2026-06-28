"use client";

import { useEffect } from "react";
import { track } from "@vercel/analytics/react";

function parseTrackProps(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter(([, item]) =>
        ["string", "number", "boolean"].includes(typeof item)
      )
    ) as Record<string, string | number | boolean>;
  } catch {
    return undefined;
  }
}

export function AnalyticsEvents() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const trackedElement = target.closest<HTMLElement>("[data-track]");
      const eventName = trackedElement?.dataset.track;

      if (!eventName) {
        return;
      }

      track(eventName, parseTrackProps(trackedElement.dataset.trackProps));
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
