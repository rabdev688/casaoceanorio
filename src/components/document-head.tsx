import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const SITE_ORIGIN = "https://www.casaoceanorio.com";

const DEFAULT_DESCRIPTION =
  "Casa Oceano Rio, a Tybee Island vacation rental in the South Beach area. Book directly with Willie and Shelly.";

const PAGES: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Casa Oceano Rio · Tybee Island",
    description: DEFAULT_DESCRIPTION,
  },
  "/about": {
    title: "Our story · Casa Oceano Rio",
    description:
      "Willie and Shelly have welcomed guests to Casa Oceano Rio on Tybee Island since 2010. A South Beach house, managed by the owners.",
  },
  "/gallery": {
    title: "Photo gallery · Casa Oceano Rio",
    description:
      "Photos of Casa Oceano Rio, a South Beach vacation rental on Tybee Island. Bedrooms, decks, kitchen, and the dipping pool.",
  },
  "/amenities": {
    title: "Rooms and amenities · Casa Oceano Rio",
    description:
      "Rooms, beach gear, and amenities at Casa Oceano Rio on Tybee Island. Chairs, umbrellas, and a dipping pool are included.",
  },
  "/location": {
    title: "South Beach location · Casa Oceano Rio",
    description:
      "Casa Oceano Rio is in the South Beach area of Tybee Island, within walking distance of shops, restaurants, and nightclubs.",
  },
  "/book": {
    title: "Check availability · Casa Oceano Rio",
    description:
      "Check availability and request dates at Casa Oceano Rio. Book directly with Willie and Shelly on Tybee Island.",
  },
};

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertCanonical(href: string | null) {
  const existing = document.head.querySelector('link[rel="canonical"]');
  if (!href) {
    existing?.remove();
    return;
  }
  const link = existing ?? document.createElement("link");
  link.setAttribute("rel", "canonical");
  link.setAttribute("href", href);
  if (!existing) document.head.appendChild(link);
}

export function DocumentHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = PAGES[pathname];
    const indexable = Boolean(page);
    const title =
      page?.title ??
      (pathname === "/admin"
        ? "Booking admin"
        : "Casa Oceano Rio · Tybee Island");
    const description = page?.description ?? DEFAULT_DESCRIPTION;
    const url = `${SITE_ORIGIN}${pathname === "/" ? "/" : pathname}`;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta(
      "name",
      "robots",
      indexable ? "index, follow" : "noindex, nofollow",
    );
    upsertCanonical(indexable ? url : null);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", indexable ? url : SITE_ORIGIN);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:image", `${SITE_ORIGIN}/gallery/exterior.webp`);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", `${SITE_ORIGIN}/gallery/exterior.webp`);
  }, [pathname]);

  return null;
}
