import { useEffect } from "react";

/**
 * Wires up the IntersectionObserver that adds the "visible" class
 * to every .reveal element on the current page when it enters the viewport.
 * Call this once at the top of each page component.
 */
export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
