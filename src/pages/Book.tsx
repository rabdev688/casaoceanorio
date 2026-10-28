import { useState, type FormEvent } from "react";
import type { DateRange } from "react-day-picker";

import { DateField } from "@/components/date-field";
import { GuestSelect } from "@/components/guest-select";
import { Icon } from "@/components/icon";
import { RatesCalendar } from "@/components/rates-calendar";
import {
  calendarMonths,
  dateToSelection,
  toISODate,
} from "@/lib/stay-calendar";
import { useReveal } from "@/lib/useReveal";

interface ToastMessage {
  id: number;
  title: string;
  text: string;
}

export function Book() {
  useReveal();

  // Calendar State
  const [currentMonthIdx, setCurrentMonthIdx] = useState(1);
  const [selectedStart, setSelectedStart] = useState<{
    monthIdx: number;
    day: number;
  } | null>({
    monthIdx: 1,
    day: 8,
  });
  const [selectedEnd, setSelectedEnd] = useState<{
    monthIdx: number;
    day: number;
  } | null>({
    monthIdx: 1,
    day: 12,
  });

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, text: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  };

  // Contact Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    checkIn: "2026-06-08",
    checkOut: "2026-06-12",
    guests: 2,
    message: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setSelectedStart(null);
      setSelectedEnd(null);
      return;
    }

    const start = dateToSelection(range.from);
    if (!start) return;

    const end = range.to ? dateToSelection(range.to) : null;
    const sameDay =
      end && start.monthIdx === end.monthIdx && start.day === end.day;

    if (!end || sameDay) {
      setSelectedStart(start);
      setSelectedEnd(null);
      return;
    }

    setSelectedStart(start);
    setSelectedEnd(end);
    setFormData((prev) => ({
      ...prev,
      checkIn: toISODate(range.from as Date),
      checkOut: toISODate(range.to as Date),
    }));
    showToast(
      "Dates Selected!",
      `Selected ${calendarMonths[start.monthIdx].name} ${start.day} to ${calendarMonths[end.monthIdx].name} ${end.day}. Send an inquiry and we will confirm availability.`,
    );
  };

  // Calculate nights
  const calculateTotal = () => {
    if (!selectedStart || !selectedEnd) return null;

    let nights = 0;

    if (selectedStart.monthIdx === selectedEnd.monthIdx) {
      nights = selectedEnd.day - selectedStart.day;
    } else {
      const startDaysInM = calendarMonths[selectedStart.monthIdx].daysInMonth;
      nights += startDaysInM - selectedStart.day;
      nights += selectedEnd.day;
    }

    if (nights < 1) return null;

    return { nights };
  };

  const bookingSummary = calculateTotal();

  // Form Submission & Validation
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = "Please enter your full name.";
    }
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      errors.email = "Please provide a valid email address.";
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      errors.phone = "Please provide a direct contact phone number.";
    }
    if (!formData.checkIn) {
      errors.checkIn = "Check-in date is required.";
    }
    if (!formData.checkOut) {
      errors.checkOut = "Check-out date is required.";
    } else if (formData.checkIn && formData.checkOut <= formData.checkIn) {
      errors.checkOut = "Check-out date must be after check-in date.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        showToast(
          "Inquiry Sent to Willie & Shelly!",
          `Thank you, ${formData.fullName}! Your direct booking inquiry has been received. We will respond within 24 hours.`,
        );
        setFormData((prev) => ({ ...prev, message: "" }));
      }, 700);
    }
  };

  return (
    <>
      {/* Page-level toast container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <div className="toast-text">
              <strong>{t.title}</strong>
              <p>{t.text}</p>
            </div>
            <button
              className="toast-close"
              onClick={() =>
                setToasts((prev) => prev.filter((item) => item.id !== t.id))
              }
              aria-label="Close notification"
            >
              <Icon type="close" />
            </button>
          </div>
        ))}
      </div>

      {/* --- Interactive Calendar & Rate Estimator --- */}
      <section className="calendar-section section reveal" id="booking">
        <div className="calendar-intro">
          <p className="eyebrow">Request your dates</p>
          <h2>Plan your stay.</h2>
          <p>
            Select check-in and check-out, then send a message. We will respond
            within 24 hours with availability. Booking directly avoids fees
            charged by booking sites.
          </p>

          <div className="legend">
            <span>
              <i className="available" /> Open to request
            </span>
            <span>
              <i className="selected-dot" /> Selected
            </span>
          </div>

          {bookingSummary ? (
            <div className="booking-summary-card" style={{ marginTop: "30px" }}>
              <div className="booking-summary-info">
                <h4>{bookingSummary.nights} nights at Casa Oceano Rio</h4>
                <p>
                  We will confirm these dates and
                  reply within 24 hours.
                </p>
              </div>
              <button
                className="primary"
                style={{ width: "100%", marginTop: "14px" }}
                onClick={() => {
                  const contactEl = document.getElementById("contact");
                  if (contactEl)
                    contactEl.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Inquire with these dates <Icon type="arrow" />
              </button>
            </div>
          ) : (
            <div className="hint-note">
              Select a check-in day, then a check-out day, and send them with
              your inquiry.
            </div>
          )}
        </div>

        <div className="calendar">
          <RatesCalendar
            monthIdx={currentMonthIdx}
            onMonthIdxChange={setCurrentMonthIdx}
            selectedStart={selectedStart}
            selectedEnd={selectedEnd}
            onRangeSelect={handleRangeSelect}
          />
        </div>
      </section>

      {/* --- Direct Booking & Contact Form Section --- */}
      <section className="contact-section section reveal" id="contact">
        <div className="contact-layout">
          <div className="contact-info">
            <div>
              <p className="eyebrow">Direct host inquiries</p>
              <h2>
                Book direct with
                <br />
                Willie & Shelly.
              </h2>
            </div>

            <div className="direct-perks">
              <h4>Why book directly with us?</h4>
              <p>
                We are individual owners, not a rental company. Booking directly
                avoids fees charged by booking sites. Put your dates in the
                message and we will respond within 24 hours with availability.
              </p>
              <ul>
                <li>Willie and Shelly manage the house themselves</li>
                <li>Call or text anytime</li>
                <li>
                  Chairs, floats, umbrellas, cooler, and large beach carts
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
                <a href="mailto:wlfields@bellsouth.net">
                  wlfields@bellsouth.net
                </a>
                <br />
                Shelly:{" "}
                <a href="mailto:tybeeshelly@yahoo.com">tybeeshelly@yahoo.com</a>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <h3>Direct reservation inquiry</h3>
            <p className="form-subtitle">
              Put your requested dates in the message. We will respond within 24
              hours with availability.
            </p>

            <form onSubmit={handleFormSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="fullName">Your full name *</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                  {formErrors.fullName && (
                    <span className="error-msg">{formErrors.fullName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email address *</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Your email address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  {formErrors.email && (
                    <span className="error-msg">{formErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone number *</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="phone number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                  {formErrors.phone && (
                    <span className="error-msg">{formErrors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="formCheckIn">Check-in date *</label>
                  <DateField
                    id="formCheckIn"
                    value={formData.checkIn}
                    onChange={(checkIn) =>
                      setFormData({ ...formData, checkIn })
                    }
                    invalid={Boolean(formErrors.checkIn)}
                  />
                  {formErrors.checkIn && (
                    <span className="error-msg">{formErrors.checkIn}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="formCheckOut">Check-out date *</label>
                  <DateField
                    id="formCheckOut"
                    value={formData.checkOut}
                    onChange={(checkOut) =>
                      setFormData({ ...formData, checkOut })
                    }
                    invalid={Boolean(formErrors.checkOut)}
                  />
                  {formErrors.checkOut && (
                    <span className="error-msg">{formErrors.checkOut}</span>
                  )}
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
                    Inquiry message 
                    <span className="form-fineprint">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="your message or questions"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                className="primary submit-btn"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Sending Inquiry..."
                ) : (
                  <>
                    Send booking inquiry <Icon type="arrow" />
                  </>
                )}
              </button>

              <p className="form-fineprint">
                We will respond within 24 hours with availability.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
