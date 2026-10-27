import { useState, useId } from "react";
import { useNavigate } from "react-router-dom";
import { DateField } from "@/components/date-field";
import { GuestSelect } from "@/components/guest-select";
import { Icon } from "@/components/icon";
import { monthStarts, toISODate } from "@/lib/stay-calendar";
import { useAvailability } from "@/lib/use-availability";
import { horizonCheckout, todayInTimeZone } from "../../server/dates.ts";

export interface BookingBarProps {
  mobile?: boolean;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onApplyDates?: (checkIn: string, checkOut: string, guests: number) => void;
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
  const { data } = useAvailability();
  const today = data?.today ?? todayInTimeZone();
  const horizonEnd = data?.horizonEnd ?? horizonCheckout(today);
  const months = monthStarts(today);

  const checkInId = useId();
  const checkOutId = useId();
  const guestsId = useId();

  const disableDate = (date: Date) => {
    const iso = toISODate(date);
    return iso < today || iso > horizonEnd;
  };

  const handleSearch = () => {
    if (onApplyDates) {
      onApplyDates(checkIn, checkOut, guests);
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
          onChange={setCheckIn}
          disabled={disableDate}
          startMonth={months[0]}
          endMonth={months[months.length - 1]}
        />
      </label>
      <label htmlFor={checkOutId}>
        <span>Check-out</span>
        <DateField
          id={checkOutId}
          value={checkOut}
          onChange={setCheckOut}
          disabled={disableDate}
          startMonth={months[0]}
          endMonth={months[months.length - 1]}
        />
      </label>
      <label htmlFor={guestsId}>
        <span>Guests</span>
        <GuestSelect id={guestsId} value={guests} onChange={setGuests} />
      </label>
      <button className="primary" onClick={handleSearch} type="button">
        Check availability <Icon type="arrow" />
      </button>
    </div>
  );
}
