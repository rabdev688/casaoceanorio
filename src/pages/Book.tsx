import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import type { DateRange } from "react-day-picker";

import { DateField } from "@/components/date-field";
import { GuestSelect } from "@/components/guest-select";
import { Icon } from "@/components/icon";
import { RatesCalendar } from "@/components/rates-calendar";
import { monthStarts, parseISODate, toISODate } from "@/lib/stay-calendar";
import { useAvailability } from "@/lib/use-availability";
import { scrollToRequestForm } from "@/lib/scroll-to-section";
import { describeStay } from "@/lib/stay-availability";
import { useReveal } from "@/lib/useReveal";
import {
  formatLongDate,
  horizonCheckout,
  nightCount,
  rangesOverlap,
  todayInTimeZone,
} from "../../server/dates.js";

interface ToastMessage {
  id: number;
  title: string;
  text: string;
}

function guestCount(value: string | null, fallback: number) {
  const guests = Number(value);
  return Number.isInteger(guests) && guests >= 1 && guests <= 16 ? guests : fallback;
}

export function Book() {
  useReveal();
  const [params] = useSearchParams();
  const { data, error, loading, reload } = useAvailability();
  const today = data?.today ?? todayInTimeZone();
  const horizonEnd = data?.horizonEnd ?? horizonCheckout(today);
  const months = monthStarts(today);
  const blocks = data?.blocked ?? [];

  const [month, setMonth] = useState(() => {
    const parsed = parseISODate(params.get("checkIn") || "");
    if (parsed) return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
    const [year, monthNumber] = todayInTimeZone().split("-").map(Number);
    return new Date(year, monthNumber - 1, 1);
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    checkIn: params.get("checkIn") || "",
    checkOut: params.get("checkOut") || "",
    guests: guestCount(params.get("guests"), 2),
    message: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkIn = params.get("checkIn") || "";
    const checkOut = params.get("checkOut") || "";
    if (!checkIn && !checkOut && !params.get("guests")) return;
    setFormData((prev) => ({
      ...prev,
      checkIn,
      checkOut,
      guests: guestCount(params.get("guests"), prev.guests),
    }));
    const parsed = parseISODate(checkIn);
    if (parsed) setMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
  }, [params]);

  const showToast = (title: string, text: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 5500);
  };

  const nightTaken = (iso: string) =>
    blocks.some((block) => iso >= block.checkIn && iso < block.checkOut);

  const disableDate = (date: Date) => {
    const iso = toISODate(date);
    return iso < today || iso > horizonEnd;
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setFormData((prev) => ({ ...prev, checkIn: "", checkOut: "" }));
      return;
    }
    const start = toISODate(range.from);
    if (start < today || start >= horizonEnd) {
      showToast("Outside the booking window", "Choose a check-in inside the open months.");
      return;
    }
    if (nightTaken(start)) {
      showToast("Night unavailable", "That night is already taken. Choose an open check-in.");
      setFormData((prev) => ({ ...prev, checkIn: "", checkOut: "" }));
      return;
    }
    const end = range.to ? toISODate(range.to) : "";
    if (!end || end === start) {
      setFormData((prev) => ({ ...prev, checkIn: start, checkOut: "" }));
      return;
    }
    if (end > horizonEnd) {
      showToast("Outside the booking window", "Choose an earlier check-out.");
      return;
    }
    if (blocks.some((block) => rangesOverlap(start, end, block.checkIn, block.checkOut))) {
      showToast(
        "Those dates include a taken night",
        "Pick a checkout that stops before the next guest.",
      );
      setFormData((prev) => ({ ...prev, checkIn: start, checkOut: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, checkIn: start, checkOut: end }));
    showToast(
      "Dates selected",
      `${formatLongDate(start)} to ${formatLongDate(end)}. Submit the form to confirm this stay.`,
    );
  };

  const checkAvailability = async () => {
    setChecking(true);
    try {
      const next = await reload();
      const result = describeStay(formData.checkIn, formData.checkOut, next);
      showToast(result.title, result.text);
      if (result.open) scrollToRequestForm();
    } finally {
      setChecking(false);
    }
  };

  const chooseFormCheckIn = (checkIn: string) => {
    if (nightTaken(checkIn)) {
      showToast("Night unavailable", "That night is already taken. Choose an open check-in.");
      return false;
    }
    const overlaps =
      Boolean(formData.checkOut) &&
      blocks.some((block) => rangesOverlap(checkIn, formData.checkOut, block.checkIn, block.checkOut));
    if (overlaps) {
      showToast("Those dates include a taken night", "Pick a checkout that stops before the next guest.");
    }
    const checkOut = overlaps || (formData.checkOut && checkIn >= formData.checkOut) ? "" : formData.checkOut;
    setFormData((prev) => ({ ...prev, checkIn, checkOut }));
  };

  const chooseFormCheckOut = (checkOut: string) => {
    if (formData.checkIn && checkOut <= formData.checkIn) {
      showToast("Check-out is too early", "Choose a check-out after check-in.");
      return false;
    }
    if (
      formData.checkIn &&
      blocks.some((block) => rangesOverlap(formData.checkIn, checkOut, block.checkIn, block.checkOut))
    ) {
      showToast("Those dates include a taken night", "Pick a checkout that stops before the next guest.");
      return false;
    }
    setFormData((prev) => ({ ...prev, checkOut }));
  };

  const nights = nightCount(formData.checkIn, formData.checkOut);
  const selectedFrom = parseISODate(formData.checkIn);
  const selectedTo = parseISODate(formData.checkOut);
  const selected = selectedFrom ? { from: selectedFrom, to: selectedTo } : undefined;
  const bookingEnabled = data?.bookingEnabled === true;

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name.";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please provide a valid email address.";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      errors.phone = "Please provide a direct contact phone number.";
    }
    if (!formData.checkIn) errors.checkIn = "Check-in date is required.";
    if (!formData.checkOut) errors.checkOut = "Check-out date is required.";
    else if (formData.checkIn && formData.checkOut <= formData.checkIn) {
      errors.checkOut = "Check-out date must be after check-in date.";
    } else if (
      formData.checkIn &&
      blocks.some((block) => rangesOverlap(formData.checkIn, formData.checkOut, block.checkIn, block.checkOut))
    ) {
      errors.checkOut = "Those dates include a taken night.";
    }
    if (formData.checkIn && nightTaken(formData.checkIn)) {
      errors.checkIn = "That check-in night is already taken.";
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!bookingEnabled) {
      showToast("Booking is unavailable", "Call or text Willie or Shelly to reserve.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          guests: formData.guests,
          guestName: formData.fullName,
          guestEmail: formData.email,
          guestPhone: formData.phone,
          message: formData.message,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; reference?: string };
      if (response.status === 409) {
        showToast("Those nights are no longer open", "Nothing was saved. Pick another set of dates.");
        await reload();
        return;
      }
      if (!response.ok || !body.reference) {
        showToast("Booking was not saved", body.error || "Call or text Willie or Shelly to reserve.");
        return;
      }
      setConfirmation(body.reference);
      setFormData((prev) => ({ ...prev, message: "" }));
      showToast("Stay confirmed", `Reference ${body.reference}. A confirmation email is on its way.`);
      await reload();
    } catch {
      showToast("Booking was not saved", "Call or text Willie or Shelly to reserve.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <div className="toast-text">
              <strong>{toast.title}</strong>
              <p>{toast.text}</p>
            </div>
            <button
              className="toast-close"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
              aria-label="Close notification"
            >
              <Icon type="close" />
            </button>
          </div>
        ))}
      </div>

      <section className="calendar-section section reveal" id="booking">
        <div className="calendar-intro">
          <p className="eyebrow">Request your dates</p>
          <h2>Plan your stay.</h2>
          <p>
            Select check-in and check-out, then send your details. If those nights are open, the stay is
            confirmed and you get an email with your reference.
          </p>

          <div className="legend">
            <span>
              <i className="available" /> Open
            </span>
            <span>
              <i className="selected-dot" /> Selected
            </span>
            <span>
              <i className="available day-booked-dot" /> Closed
            </span>
          </div>

          {loading ? <div className="hint-note">Loading open nights.</div> : null}
          {error ? <div className="hint-note">{error}</div> : null}
          {!loading && data && !bookingEnabled ? (
            <div className="hint-note">
              The booking calendar is not connected yet. Call or text Willie or Shelly to reserve.
            </div>
          ) : null}

          {nights > 0 ? (
            <div className="booking-summary-card" style={{ marginTop: "30px" }}>
              <div className="booking-summary-info">
                <h4>
                  {nights} {nights === 1 ? "night" : "nights"} at Casa Oceano Rio
                </h4>
                <p>Submit the form to confirm this stay if the nights are still open.</p>
              </div>
              <button
                className="primary"
                style={{ width: "100%", marginTop: "14px" }}
                onClick={() => void checkAvailability()}
                type="button"
                disabled={checking}
              >
                {checking ? "Checking the calendar..." : "Check availability"} {!checking && <Icon type="arrow" />}
              </button>
            </div>
          ) : (
            <div className="hint-note">Select a check-in day, then a check-out day.</div>
          )}
          <p className="form-fineprint">
            A clash between this website and VRBO is uncommon. Willie and Shelly resolve it by phone.
          </p>
        </div>

        <div className="calendar">
          <RatesCalendar
            month={month}
            months={months}
            onMonthChange={setMonth}
            selected={selected}
            onRangeSelect={handleRangeSelect}
            disabled={disableDate}
            booked={(date) => nightTaken(toISODate(date))}
          />
        </div>
      </section>

      <section className="contact-section section reveal" id="contact">
        <div className="contact-layout">
          <div className="contact-info">
            <div>
              <p className="eyebrow">Direct host booking</p>
              <h2>
                Book Direct and Save Up to 20%
                <br />
                with Willie & Shelly.
              </h2>
            </div>

            <div className="direct-perks">
              <h4>Why book directly with us?</h4>
              <p>
                We are individual owners, not a rental company. Booking directly avoids fees charged by
                booking sites. If the nights are open, your stay is confirmed by email.
              </p>
              <ul>
                <li>Willie and Shelly manage the house themselves</li>
                <li>Call or text anytime</li>
                <li>
                  Chairs, umbrellas, cooler, and large beach carts
                </li>
                <li>Dipping pool</li>
              </ul>
            </div>

            <div className="host-cards">
              <div className="host-card">
                <span className="role">Call or text anytime</span>
                <strong>Willie</strong>
                <a className="phone-link" href="tel:9123984113">
                  <Icon type="phone" /> (912) 398-4113
                </a>
              </div>
              <div className="host-card">
                <span className="role">Call or text anytime</span>
                <strong>Shelly</strong>
                <a className="phone-link" href="tel:9123986901">
                  <Icon type="phone" /> (912) 398-6901
                </a>
              </div>
            </div>

            <div className="contact-note">
              <Icon type="pin" />
              <div>
                <b>{import.meta.env.VITE_ADDRESS}</b>
                <br />
                Willie:{" "}
                <a href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL}`}>
                  {import.meta.env.VITE_CONTACT_EMAIL}
                </a>
                <br />
                Shelly: <a href="mailto:tybeeshelly@yahoo.com">tybeeshelly@yahoo.com</a>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <h3>Direct reservation</h3>
            {confirmation ? (
              <p className="form-subtitle">
                Your stay is confirmed. Reference {confirmation}. Check your email, and call or text Willie
                or Shelly if you need to change it.
              </p>
            ) : (
              <p className="form-subtitle">
                Send your details. If the nights are still open, you will get a confirmation email.
              </p>
            )}

            <form onSubmit={handleFormSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group full-width" id="guestNameField">
                  <label htmlFor="fullName">Your full name *</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                  />
                  {formErrors.fullName && <span className="error-msg">{formErrors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email address *</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  />
                  {formErrors.email && <span className="error-msg">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone number *</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="phone number"
                    value={formData.phone}
                    onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  />
                  {formErrors.phone && <span className="error-msg">{formErrors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="formCheckIn">Check-in date *</label>
                  <DateField
                    id="formCheckIn"
                    value={formData.checkIn}
                    onChange={chooseFormCheckIn}
                    invalid={Boolean(formErrors.checkIn)}
                    disabled={disableDate}
                    booked={(date) => nightTaken(toISODate(date))}
                    startMonth={months[0]}
                    endMonth={months[months.length - 1]}
                  />
                  {formErrors.checkIn && <span className="error-msg">{formErrors.checkIn}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="formCheckOut">Check-out date *</label>
                  <DateField
                    id="formCheckOut"
                    value={formData.checkOut}
                    onChange={chooseFormCheckOut}
                    invalid={Boolean(formErrors.checkOut)}
                    disabled={(date) =>
                      disableDate(date) || Boolean(formData.checkIn && toISODate(date) <= formData.checkIn)
                    }
                    booked={(date) => nightTaken(toISODate(date))}
                    startMonth={months[0]}
                    endMonth={months[months.length - 1]}
                  />
                  {formErrors.checkOut && <span className="error-msg">{formErrors.checkOut}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="guests">Guests</label>
                  <GuestSelect
                    id="guests"
                    value={formData.guests}
                    onChange={(guests) => setFormData({ ...formData, guests })}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="message">
                    Message <span className="form-fineprint">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="your message or questions"
                    value={formData.message}
                    onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                  />
                </div>
              </div>

              <button className="primary submit-btn" type="submit" disabled={isSubmitting || !bookingEnabled}>
                {isSubmitting ? (
                  "Confirming stay..."
                ) : (
                  <>
                    Confirm booking <Icon type="arrow" />
                  </>
                )}
              </button>

              <p className="form-fineprint">
                To change or cancel later, call or text Willie at (912) 398-4113 or Shelly at (912) 398-6901.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
