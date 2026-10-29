/** Scroll a section under the fixed nav, then correct if late images move it. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) scrollElement(el);
}

function scrollElement(el: HTMLElement) {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

  let last = el.getBoundingClientRect().top + window.scrollY;
  const started = performance.now();

  const watch = () => {
    if (!el.isConnected) return;
    const next = el.getBoundingClientRect().top + window.scrollY;
    if (Math.abs(next - last) > 8) {
      last = next;
      el.scrollIntoView({ behavior: "auto", block: "start" });
    }
    if (performance.now() - started < 2500) requestAnimationFrame(watch);
  };

  requestAnimationFrame(watch);
}

/** On a phone the intro sits above the form, so land on the name field. */
export function scrollToRequestForm() {
  const field = document.getElementById("fullName");
  const mobile = window.matchMedia("(max-width: 860px)").matches;
  const group = field?.closest(".form-group");
  const target =
    mobile && group instanceof HTMLElement ? group : document.getElementById("contact");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (target) scrollElement(target);
      field?.focus({ preventScroll: true });
    });
  });
}

/** Open dates go to the request form. Closed or incomplete dates open the calendar. */
export function scrollToStay(checkIn: string, checkOut: string, open: boolean) {
  const openForm = open && checkIn && checkOut && checkOut > checkIn;
  if (openForm) {
    scrollToRequestForm();
    return;
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToSection("booking");
    });
  });
}
