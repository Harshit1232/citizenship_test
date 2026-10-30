/**
 * Shared setup for component tests (files ending .test.tsx, run in jsdom).
 * Unit tests (.test.ts) run in Node and skip the browser parts.
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";

if (typeof window !== "undefined") {
  const { cleanup } = await import("@testing-library/react");
  const { setStoreForTesting } = await import("@/lib/storage/store");

  // jsdom has <dialog> but not showModal() or close().
  const proto = window.HTMLDialogElement?.prototype;
  if (proto && !proto.showModal) {
    proto.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    proto.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
  // jsdom doesn't do layout or scrolling.
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};

  // Start every test with empty storage, including the store's in-memory copy.
  beforeEach(() => {
    window.localStorage.clear();
    setStoreForTesting(null);
  });
  afterEach(() => cleanup());
}
