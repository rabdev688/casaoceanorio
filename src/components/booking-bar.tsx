import { useState, useId } from "react";
import { useNavigate } from "react-router-dom";
import { DateField } from "@/components/date-field";
import { GuestSelect } from "@/components/guest-select";
import { Icon } from "@/components/icon";
import { describeStay } from "@/lib/stay-availability";
import { monthStarts, toISODate } from "@/lib/stay-calendar";
import { showToast } from "@/lib/toast";
import { useAvailability } from "@/lib/use-availability";
import { horizonCheckout, rangesOverlap, todayInTimeZone } from "../../server/dates.js";

export interface BookingBarProps {
  mobile?: boolean;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onApplyDates?: (checkIn: string, checkOut: string, guests: number, open: boolean) => void;
}

export function BookingBar({
  mobile = false,
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests = 2,
  onApplyDates,
}: BookingBarProps) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const navigate = useNavigate();
  const { data, reload } = useAvailability();
  const [checking, setChecking] = useState(false);
  const today = data?.today ?? todayInTimeZone();
  const horizonEnd = data?.horizonEnd ?? horizonCheckout(today);
  const months = monthStarts(today);

  const checkInId = useId();
  const checkOutId = useId();
  const guestsId = useId();

  const blocks = data?.blocked ?? [];

  const nightTaken = (date: Date) => {
    const iso = toISODate(date);
    return blocks.some((block) => iso >= block.checkIn && iso < block.checkOut);
  };

  const disableDate = (date: Date) => {
    const iso = toISODate(date);
    return iso < today || iso > horizonEnd;
  };

  const disableCheckOut = (date: Date) => disableDate(date) || Boolean(checkIn && toISODate(date) <= checkIn);

  const chooseCheckIn = (next: string) => {
    if (blocks.some((block) => next >= block.checkIn && next < block.checkOut)) {
      showToast("Night unavailable", "That night is already taken. Choose an open check-in.");
      return false;
    }
    const overlaps =
      Boolean(checkOut) && blocks.some((block) => rangesOverlap(next, checkOut, block.checkIn, block.checkOut));
    if (overlaps) {
      showToast("Those dates include a taken night", "Pick a checkout that stops before the next guest.");
    }
    if (overlaps || (checkOut && next >= checkOut)) setCheckOut("");
    setCheckIn(next);
  };

  const chooseCheckOut = (next: string) => {
    if (checkIn && next <= checkIn) {
      showToast("Check-out is too early", "Choose a check-out after check-in.");
      return false;
    }
    if (checkIn && blocks.some((block) => rangesOverlap(checkIn, next, block.checkIn, block.checkOut))) {
      showToast("Those dates include a taken night", "Pick a checkout that stops before the next guest.");
      return false;
    }
    setCheckOut(next);
  };

  const handleSearch = async () => {
    setChecking(true);
    let open = false;
    try {
      const next = await reload();
      const ready = Boolean(checkIn && checkOut && checkOut > checkIn);
      if (ready) {
        const result = describeStay(checkIn, checkOut, next);
        showToast(result.title, result.text);
        open = result.open;
      }
    } finally {
      setChecking(false);
    }
    if (onApplyDates) {
      onApplyDates(checkIn, checkOut, guests, open);
    } else {
      navigate("/book");
    }
  };

  return (
    <div className={mobile ? "booking booking-mobile" : "booking"}>
      <label htmlFor={checkInId}>
        <span>Check-in</span>
        <DateField
          id={checkInId}
          value={checkIn}
          onChange={chooseCheckIn}
          disabled={disableDate}
          booked={nightTaken}
          startMonth={months[0]}
          endMonth={months[months.length - 1]}
        />
      </label>
      <label htmlFor={checkOutId}>
        <span>Check-out</span>
        <DateField
          id={checkOutId}
          value={checkOut}
          onChange={chooseCheckOut}
          disabled={disableCheckOut}
          booked={nightTaken}
          startMonth={months[0]}
          endMonth={months[months.length - 1]}
        />
      </label>
      <label htmlFor={guestsId}>
        <span>Guests</span>
        <GuestSelect id={guestsId} value={guests} onChange={setGuests} />
      </label>
      <button className="primary" onClick={() => void handleSearch()} type="button" disabled={checking}>
        {checking ? "Checking..." : "Check availability"} {!checking && <Icon type="arrow" />}
      </button>
    </div>
  );
}
