import { useState, useId } from "react";
import { useNavigate } from "react-router-dom";
import { DateField } from "@/components/date-field";
import { GuestSelect } from "@/components/guest-select";
import { Icon } from "@/components/icon";

export interface BookingBarProps {
  mobile?: boolean;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onApplyDates?: (checkIn: string, checkOut: string, guests: number) => void;
}

export function BookingBar({
  mobile = false,
  initialCheckIn = "2026-06-12",
  initialCheckOut = "2026-06-18",
  initialGuests = 16,
  onApplyDates,
}: BookingBarProps) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const navigate = useNavigate();

  const checkInId = useId();
  const checkOutId = useId();
  const guestsId = useId();

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
        <DateField id={checkInId} value={checkIn} onChange={setCheckIn} />
      </label>
      <label htmlFor={checkOutId}>
        <span>Check-out</span>
        <DateField id={checkOutId} value={checkOut} onChange={setCheckOut} />
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
