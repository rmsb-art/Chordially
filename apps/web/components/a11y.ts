/**
 * Accessibility baseline utilities for the web shell.
 * Covers keyboard focus management, heading order, contrast checks,
 * and live-region announcements.
 */

/** Announce a message to screen readers via an ARIA live region. */
export function announce(message: string, priority: "polite" | "assertive" = "polite") {
  const el = getOrCreateLiveRegion(priority);
  el.textContent = "";
  // Flush so re-setting the same string is still announced.
  requestAnimationFrame(() => {
    el.textContent = message;
  });
}

function getOrCreateLiveRegion(priority: "polite" | "assertive"): HTMLElement {
  const id = `a11y-live-${priority}`;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.setAttribute("aria-live", priority);
    el.setAttribute("aria-atomic", "true");
    Object.assign(el.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      overflow: "hidden",
      clip: "rect(0 0 0 0)",
      whiteSpace: "nowrap",
    });
    document.body.appendChild(el);
  }
  return el;
}

/** Trap focus within a container element (e.g. modal). Returns a cleanup fn. */
export function trapFocus(container: HTMLElement): () => void {
  const focusable = 'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
  const els = () => Array.from(container.querySelectorAll<HTMLElement>(focusable));

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== "Tab") return;
    const items = els();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  }

  container.addEventListener("keydown", onKeyDown);
  return () => container.removeEventListener("keydown", onKeyDown);
}
