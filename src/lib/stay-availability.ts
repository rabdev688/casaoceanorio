import type { AvailabilityPayload } from "@/lib/use-availability";
import { rangesOverlap } from "../../server/dates.js";

export interface StayCheck {
  open: boolean;
  title: string;
  text: string;
}

/** Same rules as the booking calendar's Check availability button. */
export function describeStay(
  checkIn: string,
  checkOut: string,
  data: AvailabilityPayload | null,
): StayCheck {
  if (!data?.bookingEnabled) {
    return {
      open: false,
      title: "Calendar unavailable",
      text: "Call or text Willie or Shelly to reserve.",
    };
  }
  const taken = data.blocked.some((block) =>
    rangesOverlap(checkIn, checkOut, block.checkIn, block.checkOut),
  );
  if (taken) {
    return {
      open: false,
      title: "Those nights are closed",
      text: "The latest VRBO calendar has these dates blocked.",
    };
  }
  if (data.syncStatus.lastError && data.syncStatus.state !== "ok") {
    return {
      open: false,
      title: "VRBO calendar was not updated",
      text: data.syncStatus.lastError,
    };
  }
  return {
    open: true,
    title: "Those nights are open",
    text: "Submit the form to confirm this stay.",
  };
}
