import { useState, useEffect, useId, useRef, FormEvent } from "react";
import type { DateRange } from "react-day-picker";

import { DateField } from "@/components/date-field";
import { GuestSelect } from "@/components/guest-select";
import { Navbar } from "@/components/navbar";
import { RatesCalendar } from "@/components/rates-calendar";
import {
  calendarMonths,
  dateToSelection,
  toISODate,
} from "@/lib/stay-calendar";

// --- Gallery & Spaces Media Assets (Tybee Island coastal aesthetic) ---
interface PhotoItem {
  src: string;
  title: string;
  desc: string;
  space: string;
}

const photos: PhotoItem[] = [
  {
    src: "/gallery/exterior.jpg",
    title: "Casa Oceano Rio",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    space: "Lorem ipsum",
  },
  {
    src: "/gallery/dipping-pool.jpg",
    title: "Dipping Pool",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    space: "Dipping Pool",
  },
  {
    src: "/gallery/living-room.jpg",
    title: 'Living Room With 75" TV',
    desc: 'Living Room With 75" TV.',
    space: "Living Room",
  },
  {
    src: "/gallery/kitchen.jpg",
    title: "Kitchen",
    desc: "Kitchen.",
    space: "Kitchen",
  },
  {
    src: "/gallery/primary-bedroom.jpg",
    title: "Primary Bedroom",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    space: "Primary Bedroom",
  },
  {
    src: "/gallery/rooftop.jpg",
    title: "Rooftop Deck",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    space: "Rooftop Deck",
  },
  {
    src: "/gallery/primary-bath.jpg",
    title: "Primary Bath Walk-In Shower",
    desc: "Primary Bath Walk-In Shower.",
    space: "Primary Bath",
  },
  {
    src: "/gallery/open-living.jpg",
    title: "Open Living Concept",
    desc: "Open Living Concept.",
    space: "Open Living",
  },
  {
    src: "/gallery/stairs.jpg",
    title: "Living Room - Stairs to 3rd Floor",
    desc: "Living Room - Stairs to 3rd Floor.",
    space: "Living Room",
  },
  {
    src: "/gallery/breakfast-nook.jpg",
    title: "Breakfast Nook",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    space: "Breakfast Nook",
  },
  {
    src: "/gallery/dining-room.jpg",
    title: "Dining Room",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    space: "Dining Room",
  },
  {
    src: "/gallery/half-bath.jpg",
    title: "Half Bath Off Dining Room",
    desc: "Half Bath Off Dining Room.",
    space: "Half Bath",
  },
  {
    src: "/gallery/second-floor-bedroom-1.jpg",
    title: "Second Floor Bedroom 1",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    space: "Second Floor",
  },
  {
    src: "/gallery/second-floor-bedroom-2.jpg",
    title: "Second Floor Bedroom 2",
    desc: "Second Floor Bedroom 2.",
    space: "Second Floor",
  },
  {
    src: "/gallery/first-floor-bedroom-1.jpg",
    title: "First Floor Bedroom 1",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    space: "First Floor",
  },
  {
    src: "/gallery/first-floor-bedroom-2.jpg",
    title: "First Floor Bedroom 2",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    space: "First Floor",
  },
  {
    src: "/gallery/laundry-bath.jpg",
    title: "1 of 2 First Floor Bathrooms - Laundry",
    desc: "1 of 2 First Floor Bathrooms - Laundry.",
    space: "First Floor Bath",
  },
  {
    src: "/gallery/first-floor-bath.jpg",
    title: "2 of 2 First Floor Bathrooms",
    desc: "2 of 2 First Floor Bathrooms.",
    space: "First Floor Bath",
  },
  {
    src: "/gallery/main-deck.jpg",
    title: "Second Floor Main Deck",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    space: "Main Deck",
  },
];

// --- Spaces Carousel Data ---
interface SpaceItem {
  floor: string;
  img: string;
  title: string;
  desc: string;
  features: string[];
}

const spacesData: SpaceItem[] = [
  {
    floor: "Lorem ipsum",
    img: "/gallery/primary-bedroom.jpg",
    title: "Primary Bedroom",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    features: [
      "Primary Bedroom",
      "Lorem ipsum dolor",
      "Primary Bath Walk-In Shower",
    ],
  },
  {
    floor: "Lorem ipsum",
    img: "/gallery/living-room.jpg",
    title: 'Living Room With 75" TV',
    desc: "Living Room - Stairs to 3rd Floor. Satellite or cable. Wood Fireplace.",
    features: [
      '75" TV',
      "Satellite or cable",
      "Stairs to 3rd Floor",
    ],
  },
  {
    floor: "Lorem ipsum",
    img: "/gallery/kitchen.jpg",
    title: "Kitchen",
    desc: "Kitchen, Breakfast Nook, and Dining Room. Half Bath Off Dining Room.",
    features: [
      "Kitchen",
      "Breakfast Nook",
      "Half Bath Off Dining Room",
    ],
  },
  {
    floor: "Second floor",
    img: "/gallery/second-floor-bedroom-1.jpg",
    title: "Second Floor Bedrooms",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    features: [
      "Second Floor Bedroom 1",
      "Second Floor Bedroom 2",
      "Lorem ipsum dolor",
    ],
  },
  {
    floor: "First floor",
    img: "/gallery/first-floor-bedroom-1.jpg",
    title: "First Floor Bedrooms",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. 1 of 2 First Floor Bathrooms - Laundry.",
    features: [
      "First Floor Bedroom 1",
      "First Floor Bedroom 2",
      "Washer & Dryer",
    ],
  },
  {
    floor: "Lorem ipsum",
    img: "/gallery/dipping-pool.jpg",
    title: "Dipping Pool",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    features: [
      "Dipping pool",
      "Rooftop Deck",
      "Large Gas Grill",
    ],
  },
];

// --- SVG Icons ---
type IconType =
  | "wave"
  | "bed"
  | "pool"
  | "view"
  | "menu"
  | "close"
  | "arrow"
  | "pin"
  | "phone"
  | "check"
  | "tv"
  | "wifi"
  | "kitchen"
  | "sun"
  | "coffee"
  | "flame"
  | "car"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "star"
  | "calendar";

const Icon = ({ type, className }: { type: IconType; className?: string }) => {
  const iconClass = className || "icon";
  const paths: Record<IconType, React.ReactNode> = {
    wave: <path d="M2 13c3-4 6 4 10 0s7 4 10 0M2 8c3-4 6 4 10 0s7 4 10 0" />,
    bed: <path d="M3 18v-8m18 8v-6H3v6m3-6V7h7a4 4 0 0 1 4 4v1" />,
    pool: (
      <path d="M2 15c3-3 5 3 8 0s5 3 8 0 4 0 4 0M2 19c3-3 5 3 8 0s5 3 8 0 4 0 4 0M7 14V5a2 2 0 0 1 4 0m0 4h6" />
    ),
    view: (
      <>
        <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
    check: <path d="M20 6 9 17l-5-5" />,
    tv: (
      <>
        <rect width="20" height="15" x="2" y="7" rx="2" />
        <polyline points="17 2 12 7 7 2" />
      </>
    ),
    wifi: (
      <>
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </>
    ),
    kitchen: (
      <>
        <path d="M18 2v20M6 2v20M2 7h20M2 17h20" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </>
    ),
    coffee: (
      <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z M6 2v2M10 2v2M14 2v2" />
    ),
    flame: (
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    ),
    car: (
      <>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
    "chevron-down": <path d="m6 9 6 6 6-6" />,
    "chevron-left": <path d="m15 18-6-6 6-6" />,
    "chevron-right": <path d="m9 18 6-6-6-6" />,
    star: (
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ),
    calendar: (
      <>
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={iconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[type]}
    </svg>
  );
};

// --- Booking Bar Component ---
interface BookingBarProps {
  mobile?: boolean;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onApplyDates?: (checkIn: string, checkOut: string, guests: number) => void;
}

function BookingBar({
  mobile = false,
  initialCheckIn = "2026-06-12",
  initialCheckOut = "2026-06-18",
  initialGuests = 16,
  onApplyDates,
}: BookingBarProps) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);

  const checkInId = useId();
  const checkOutId = useId();
  const guestsId = useId();

  const handleSearch = () => {
    if (onApplyDates) {
      onApplyDates(checkIn, checkOut, guests);
    } else {
      const contactEl = document.getElementById("contact");
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: "smooth" });
      }
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

// --- Toast Interface ---
interface ToastMessage {
  id: number;
  title: string;
  text: string;
}

function App() {
  const [sheet, setSheet] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Lightbox
  const [lightbox, setLightbox] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Spaces Carousel
  const [spacesIdx, setSpacesIdx] = useState(0);
  const [spacesPerView, setSpacesPerView] = useState(3);
  const spacesAutoPlay = useRef(true);
  const spacesTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const spacesTouchStartX = useRef<number | null>(null);

  // Reviews
  const [review, setReview] = useState(0);

  // Calendar State
  const [currentMonthIdx, setCurrentMonthIdx] = useState(1); // Start in June 2026
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

  // FAQ Accordion State (open FAQ indexes)
  const [openFaqs, setOpenFaqs] = useState<number[]>([0, 3]);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  // Intersection Observer for .reveal
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

  // Scroll listener for Back to Top
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lightbox Keyboard Navigation
  useEffect(() => {
    if (lightbox === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
      } else if (e.key === "ArrowRight") {
        setLightbox((prev) => (prev !== null ? (prev + 1) % photos.length : 0));
      } else if (e.key === "ArrowLeft") {
        setLightbox((prev) =>
          prev !== null ? (prev - 1 + photos.length) % photos.length : 0,
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox]);

  // Spaces Carousel: responsive per-view & auto-play
  useEffect(() => {
    const getPerView = () => {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 640) return 2;
      return 1;
    };
    const update = () => {
      const pv = getPerView();
      setSpacesPerView(pv);
      setSpacesIdx((prev) => Math.min(prev, spacesData.length - pv));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const maxIdx = spacesData.length - spacesPerView;
    if (spacesTimer.current) clearInterval(spacesTimer.current);
    spacesTimer.current = setInterval(() => {
      if (!spacesAutoPlay.current) return;
      setSpacesIdx((prev) => (prev >= maxIdx ? 0 : prev + 1));
    }, 4000);
    return () => {
      if (spacesTimer.current) clearInterval(spacesTimer.current);
    };
  }, [spacesPerView]);

  // Helper to show a Toast notification
  const showToast = (title: string, text: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  };

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

  // Calculate nights and estimated total
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

  // Apply dates from Hero Booking Bar
  const handleApplyDatesFromHero = (
    checkIn: string,
    checkOut: string,
    guests: number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      checkIn,
      checkOut,
      guests,
    }));
    const contactEl = document.getElementById("contact");
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: "smooth" });
    }
    showToast(
      "Dates Applied",
      `Check-in: ${checkIn}, Check-out: ${checkOut} for ${guests} guests. Ready to reserve direct!`,
    );
  };

  // FAQ Accordion Toggle
  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  // Contact Form Submission & Validation
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

      // Simulate API integration delay
      setTimeout(() => {
        setIsSubmitting(false);
        showToast(
          "Inquiry Sent to Willie & Shelly!",
          `Thank you, ${formData.fullName}! Your direct booking inquiry has been received. We will respond within 24 hours.`,
        );
        // Reset form message
        setFormData((prev) => ({
          ...prev,
          message: "",
        }));
      }, 700);
    }
  };

  const reviews = [
    [
      "Since 2010, Casa Oceano Rio has welcomed guests from all over the world and has more than 200 five-star reviews.",
      "Casa Oceano Rio",
      "Tybee Island, Georgia",
    ],
  ];

  // Amenities Categorized
  const amenityCategories = {
    indoor: [
      {
        icon: "tv" as IconType,
        name: '75" TV',
        desc: 'Living Room With 75" TV. Satellite or cable.',
      },
      {
        icon: "flame" as IconType,
        name: "Wood Fireplace",
        desc: "Wood Fireplace.",
      },
      {
        icon: "sun" as IconType,
        name: "Air Conditioning and Heat",
        desc: "Air Conditioning. Heat.",
      },
      {
        icon: "wifi" as IconType,
        name: "Internet",
        desc: "Internet.",
      },
      {
        icon: "check" as IconType,
        name: "Washer & Dryer",
        desc: "1 of 2 First Floor Bathrooms - Laundry.",
      },
      {
        icon: "bed" as IconType,
        name: "Lorem ipsum",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      },
      {
        icon: "check" as IconType,
        name: "No Smoking/Pets",
        desc: "Children Welcome.",
      },
    ],
    outdoor: [
      {
        icon: "pool" as IconType,
        name: "Dipping pool",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      },
      {
        icon: "view" as IconType,
        name: "Rooftop Deck",
        desc: "Rooftop Deck.",
      },
      {
        icon: "sun" as IconType,
        name: "Second Floor Main Deck",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      },
      {
        icon: "flame" as IconType,
        name: "Large Gas Grill",
        desc: "Large Gas Grill.",
      },
      {
        icon: "coffee" as IconType,
        name: "Low Country Boil Pot and Gas Burner",
        desc: "Low Country Boil Pot and Gas Burner.",
      },
      {
        icon: "car" as IconType,
        name: "Parking",
        desc: "Parking.",
      },
    ],
    kitchen: [
      {
        icon: "kitchen" as IconType,
        name: "Kitchen",
        desc: "Kitchen.",
      },
      {
        icon: "bed" as IconType,
        name: "Dolor sit amet",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      },
      {
        icon: "coffee" as IconType,
        name: "Breakfast Nook",
        desc: "Breakfast Nook.",
      },
      {
        icon: "sun" as IconType,
        name: "Consectetur adipiscing",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      },
      {
        icon: "check" as IconType,
        name: "Half Bath Off Dining Room",
        desc: "Half Bath Off Dining Room.",
      },
      {
        icon: "check" as IconType,
        name: "Elit sed do",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      },
    ],
    beach: [
      {
        icon: "car" as IconType,
        name: "Large Beach Carts",
        desc: "For hauling chairs and the cooler to the beach.",
      },
      {
        icon: "sun" as IconType,
        name: "Chairs and Umbrellas",
        desc: "Included for days at the beach.",
      },
      {
        icon: "wave" as IconType,
        name: "Floats",
        desc: "Floats are included with the beach gear.",
      },
      {
        icon: "pool" as IconType,
        name: "Cooler",
        desc: "A cooler is included with the beach gear.",
      },
      {
        icon: "pin" as IconType,
        name: "South Beach, Tybee",
        desc: "Walking distance to the commercial district.",
      },
      {
        icon: "check" as IconType,
        name: "Children Welcome",
        desc: "Children Welcome.",
      },
      {
        icon: "view" as IconType,
        name: "Shops, Restaurants, and Nightclubs",
        desc: "Within walking distance in Tybee’s commercial district.",
      },
    ],
  };

  const amenityColumns = [
    { label: "Lorem ipsum", items: amenityCategories.indoor },
    { label: "Dolor sit amet", items: amenityCategories.outdoor },
    { label: "Consectetur elit", items: amenityCategories.kitchen },
    { label: "Adipiscing elit", items: amenityCategories.beach },
  ];
  const amenityRowCount = Math.max(
    ...amenityColumns.map((column) => column.items.length),
  );

  // Real FAQs for Casa Oceano Rio
  const faqs = [
    {
      q: "How do I book directly and avoid platform fees?",
      a: "Use the contact form on this page, or call or text Willie at (912) 398-4113 or Shelly at (912) 398-6901. We are on VRBO, and booking directly avoids the fees those sites charge. Put your requested dates in the message and we will respond within 24 hours with availability.",
    },
    {
      q: "Are pets allowed?",
      a: "No smoking and no pets. Children are welcome.",
    },
    {
      q: "Where is the house?",
      a: "Casa Oceano Rio is in the exclusive South Beach area of Tybee, at 1811a Butler Ave, Tybee Island, Ga 31328. It is within walking distance of Tybee's commercial district, with shops, restaurants, and nightclubs.",
    },
    {
      q: "What beach gear is included?",
      a: "Chairs, floats, umbrellas, a cooler, and large beach carts.",
    },
    {
      q: "Is there parking?",
      a: "Yes. Parking.",
    },
    {
      q: "Lorem ipsum dolor sit amet?",
      a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
  ];

  return (
    <main>
      {/* --- Global Toast Notifications --- */}
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

      {/* --- Floating Back to Top Button --- */}
      <button
        className={`back-to-top ${showBackToTop ? "show" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top of page"
      >
        <svg
          viewBox="0 0 24 24"
          className="icon"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>

      <Navbar />

      {/* --- Hero Section --- */}
      <div className="hero-wrap">
        <section className="hero" id="top">
          <div className="hero-bg" />
          <div className="hero-copy">
            <div className="hero-subhead">
              <p className="eyebrow light">
                Tybee Island, Georgia · South Beach
              </p>
            </div>
            <h1>
              Where the river
              <br />
              meets the ocean.
            </h1>
            <p className="intro">
              Welcome to Casa Oceano Rio, a Tybee Island vacation rental in the
              exclusive South Beach area, with a dipping pool and beach gear
              included. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>

            <div className="hero-direct-badge">
              <Icon type="check" />
              <span>
                Book directly with Willie and Shelly and avoid booking-site
                fees.
              </span>
            </div>
          </div>

          <div className="scroll-note">
            <span /> Scroll to explore Tybee Island
          </div>
        </section>

        {/* Desktop Quick Booking Bar */}
        <BookingBar onApplyDates={handleApplyDatesFromHero} />
      </div>

      {/* --- Property Highlights Bar --- */}
      <section className="highlights reveal">
        <article>
          <Icon type="wave" />
          <div>
            <strong>South Beach, Tybee</strong>
            <span>Walk to shops, restaurants, and nightclubs</span>
          </div>
        </article>
        <article>
          <Icon type="bed" />
          <div>
            <strong>Lorem ipsum</strong>
            <span>Dolor sit amet consectetur</span>
          </div>
        </article>
        <article>
          <Icon type="pool" />
          <div>
            <strong>Dipping pool</strong>
            <span>Lorem ipsum dolor sit amet</span>
          </div>
        </article>
        <article>
          <Icon type="view" />
          <div>
            <strong>Rooftop Deck</strong>
            <span>Where the river meets the ocean</span>
          </div>
        </article>
      </section>

      {/* --- Story Section: Willie & Shelly's Tybee Legacy --- */}
      <section className="story section reveal" id="story">
        <div className="story-layout">
          <div className="story-copy">
            <div className="section-head">
              <p className="eyebrow">Where the river meets the ocean</p>
              <h2>
                Built in 1984.
                <br />
                Welcoming guests since 2010.
              </h2>
            </div>
            <p>
              Since 2010, Casa Oceano Rio has provided accommodations to guests
              from all over the world, with over 200 five-star reviews. We are
              individual owners, not part of a corporate rental company, and we
              take a personal interest in every stay. The house is in the
              exclusive South Beach area of Tybee, within walking distance of
              the commercial district, with shops, restaurants, and nightclubs.
            </p>
            <p>
              Willie is a Savannah native and built Casa Oceano Rio as a private
              residence in 1984. He and Shelly were married in 1993 and raised
              their two boys on Tybee Island. After the kids went off to
              college, they moved to a home in Savannah’s Historic District. In
              2010 the residence became Casa Oceano Rio. Willie and Shelly still
              manage it themselves.
            </p>

            <div className="stats-grid">
              <div className="stat-item">
                <b>1984</b>
                <span>Built as their home</span>
              </div>
              <div className="stat-item">
                <b>200+</b>
                <span>Five-star reviews</span>
              </div>
              <div className="stat-item">
                <b>Lorem</b>
                <span>Ipsum dolor</span>
              </div>
            </div>

            <a className="text-link" href="#contact">
              Inquire directly with Willie & Shelly <Icon type="arrow" />
            </a>
          </div>

          <div className="overlap">
            <img
              className="main-photo"
              src={photos[0].src}
              alt="Casa Oceano Rio, Tybee Island"
            />
            <img
              className="float-photo"
              src="/gallery/willie-shelly.jpg"
              alt="Willie and Shelly, owners of Casa Oceano Rio"
            />
          </div>
        </div>
      </section>

      {/* --- Rooms & Spaces Breakdown Section --- */}
      <section className="spaces-section section reveal" id="spaces">
        <div className="section-head">
          <p className="eyebrow">Thoughtful multi-level design</p>
          <h2>Rooms & spaces made to gather.</h2>
        </div>

        <div
          className="spaces-carousel"
          onMouseEnter={() => {
            spacesAutoPlay.current = false;
          }}
          onMouseLeave={() => {
            spacesAutoPlay.current = true;
          }}
          onTouchStart={(e) => {
            spacesTouchStartX.current = e.touches[0].clientX;
            spacesAutoPlay.current = false;
          }}
          onTouchEnd={(e) => {
            if (spacesTouchStartX.current === null) return;
            const delta =
              spacesTouchStartX.current - e.changedTouches[0].clientX;
            const maxIdx = spacesData.length - spacesPerView;
            if (delta > 50) setSpacesIdx((p) => Math.min(p + 1, maxIdx));
            else if (delta < -50) setSpacesIdx((p) => Math.max(p - 1, 0));
            spacesTouchStartX.current = null;
            setTimeout(() => {
              spacesAutoPlay.current = true;
            }, 3000);
          }}
        >
          {/* Viewport clips the track */}
          <div className="spaces-carousel-viewport">
            <div
              className="spaces-carousel-track"
              style={{
                transform: `translateX(-${(spacesIdx * 100) / spacesPerView}%)`,
              }}
            >
              {spacesData.map((space) => (
                <div className="spaces-carousel-slide" key={space.title}>
                  <div className="spaces-card-inner">
                    <div className="spaces-card-img-wrap">
                      <img src={space.img} alt={space.title} loading="lazy" />
                      <div className="spaces-card-img-overlay" />
                    </div>
                    <div className="spaces-card-body">
                      <h3>{space.title}</h3>
                      <p>{space.desc}</p>
                      <ul className="space-features">
                        {space.features.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls row: prev — dots — next */}
          <div className="spaces-controls">
            <button
              className="spaces-nav-btn"
              aria-label="Previous space"
              type="button"
              onClick={() => {
                const maxIdx = spacesData.length - spacesPerView;
                setSpacesIdx((p) => (p <= 0 ? maxIdx : p - 1));
              }}
            >
              <Icon type="chevron-left" />
            </button>

            <div
              className="spaces-dots"
              role="tablist"
              aria-label="Spaces carousel"
            >
              {Array.from({
                length: spacesData.length - spacesPerView + 1,
              }).map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === spacesIdx}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`spaces-dot${i === spacesIdx ? " active" : ""}`}
                  onClick={() => setSpacesIdx(i)}
                  type="button"
                />
              ))}
            </div>

            <button
              className="spaces-nav-btn"
              aria-label="Next space"
              type="button"
              onClick={() => {
                const maxIdx = spacesData.length - spacesPerView;
                setSpacesIdx((p) => (p >= maxIdx ? 0 : p + 1));
              }}
            >
              <Icon type="chevron-right" />
            </button>
          </div>
        </div>
      </section>

      {/* --- Interactive Image Gallery with Enhanced Lightbox --- */}
      <section className="gallery section" id="gallery">
        <div className="section-head reveal">
          <p className="eyebrow">Explore every corner</p>
          <h2>Space to unwind on Tybee.</h2>
        </div>

        <div className="gallery-grid reveal">
          {photos.slice(0, 5).map((photo, i) => (
            <button
              key={photo.src}
              className={`gallery-item item-${i + 1}`}
              onClick={() => setLightbox(i)}
              type="button"
            >
              <img
                src={photo.src}
                alt={photo.title}
                loading={i > 1 ? "lazy" : "eager"}
              />
              <div className="gallery-caption">
                <span className="title">{photo.title}</span>
                <span className="index">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(photos.length).padStart(2, "0")}
                </span>
              </div>
            </button>
          ))}

          {/* 6th tile — fills the empty bottom-right on desktop, hidden on mobile */}
          <button
            className="gallery-item item-6"
            onClick={() => setLightbox(5)}
            type="button"
          >
            <img src={photos[5].src} alt={photos[5].title} loading="lazy" />
            <div className="gallery-caption">
              <span className="title">{photos[5].title}</span>
              <span className="index">
                06 / {String(photos.length).padStart(2, "0")}
              </span>
            </div>
            <div className="gallery-viewall-overlay">
              <button
                className="primary gallery-viewall-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(0);
                }}
                type="button"
              >
                View all {photos.length} photos <Icon type="arrow" />
              </button>
            </div>
          </button>
        </div>

        {/* Mobile-only standalone button (hidden on desktop via CSS) */}
        <div className="gallery-more-btn-wrap">
          <button
            className="primary"
            style={{ margin: "0 auto" }}
            onClick={() => setLightbox(0)}
            type="button"
          >
            View all {photos.length} photos <Icon type="arrow" />
          </button>
        </div>
      </section>

      {/* --- Lightbox Modal with Arrows & Counter --- */}
      {lightbox !== null && (
        <div
          className="lightbox"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const delta = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(delta) > 40) {
              if (delta > 0) {
                setLightbox((lightbox + 1) % photos.length);
              } else {
                setLightbox((lightbox - 1 + photos.length) % photos.length);
              }
            }
            touchStartX.current = null;
          }}
        >
          <button
            className="lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label="Close Lightbox"
          >
            <Icon type="close" />
          </button>

          <button
            className="lightbox-nav-btn lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((lightbox - 1 + photos.length) % photos.length);
            }}
            aria-label="Previous image"
          >
            <Icon type="chevron-left" />
          </button>

          <button
            className="lightbox-nav-btn lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              setLightbox((lightbox + 1) % photos.length);
            }}
            aria-label="Next image"
          >
            <Icon type="chevron-right" />
          </button>

          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-counter">
              Photo {lightbox + 1} of {photos.length} · {photos[lightbox].space}
            </div>
            <img src={photos[lightbox].src} alt={photos[lightbox].title} />
            <div className="lightbox-caption">
              <h4>{photos[lightbox].title}</h4>
              <p>{photos[lightbox].desc}</p>
            </div>
            <div className="lightbox-dots">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  className={`lightbox-dot ${idx === lightbox ? "active" : ""}`}
                  onClick={() => setLightbox(idx)}
                  aria-label={`Jump to photo ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- YouTube Video Tour Section --- */}
      <section className="video-section reveal" id="video">
        <div className="video-container">
          <p className="eyebrow light">Tybee Island</p>
          <h2>15 minute drone tour of Tybee.</h2>
          <p
            className="intro"
            style={{
              margin: "16px auto 36px",
              maxWidth: "640px",
              textAlign: "center",
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>

          <div className="video-player-wrap">
            <iframe
              src="https://www.youtube.com/embed/VPBE2E0TaS8?rel=0&modestbranding=1"
              title="15 minute drone tour of Tybee"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* --- Amenities --- */}
      <section className="amenities section reveal" id="amenities">
        <div className="section-head">
          <p className="eyebrow">We are here for you!</p>
          <h2>Featured Amenities</h2>
        </div>

        <div
          className="amenity-board"
          style={
            { "--amenity-rows": amenityRowCount + 1 } as React.CSSProperties
          }
        >
          {amenityColumns.map((column) => (
            <div key={column.label} className="amenity-col">
              <div className="amenity-col-head">{column.label}</div>
              {Array.from({ length: amenityRowCount }, (_, index) => {
                const item = column.items[index];
                if (!item) {
                  return (
                    <div
                      key={`${column.label}-empty-${index}`}
                      className="amenity-cell is-empty"
                    />
                  );
                }
                return (
                  <div key={item.name} className="amenity-cell">
                    <span className="amenity-name">
                      <Icon type={item.icon} />
                      <strong>{item.name}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="amenities-note">
          <span>
            <b>No Smoking</b>
          </span>
          <span>
            <b>No Pets</b>
          </span>
          <span>
            <b>Children welcome</b>
          </span>
          <span>
            <b>Parking</b>
          </span>
        </div>
      </section>

      {/* --- Location Section: Tybee Island & South Beach --- */}
      <section className="location section reveal" id="location">
        <div className="location-copy">
          <p className="eyebrow light">Tybee Island · South Beach</p>
          <h2>Where the river meets the ocean.</h2>
          <p>
            Casa Oceano Rio is in the exclusive South Beach area of Tybee, at{" "}
            <b>1811a Butler Ave</b>. The commercial district, with shops,
            restaurants, and nightclubs, is within walking distance. Chairs,
            floats, umbrellas, a cooler, and large beach carts are included.
          </p>

          <div className="location-address">
            <Icon type="pin" />
            <div>
              <b>1811a Butler Ave, Tybee Island, Ga 31328</b>
            </div>
          </div>

          <ul>
            <li>South Beach area of Tybee Island</li>
            <li>Walking distance to shops, restaurants, and nightclubs</li>
            <li>Dipping pool</li>
            <li>Parking</li>
            <li>Lorem ipsum dolor sit amet</li>
          </ul>
        </div>

        <div className="location-map">
          <div className="map-card">
            <iframe
              title="Map of Casa Oceano Rio, 1811a Butler Ave, Tybee Island, Ga 31328"
              src="https://www.google.com/maps?q=1811a%20Butler%20Ave%2C%20Tybee%20Island%2C%20Ga%2031328&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <a
            className="map-link"
            href="https://www.google.com/maps/search/?api=1&query=1811a+Butler+Ave,+Tybee+Island,+Ga+31328"
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps <Icon type="arrow" />
          </a>
        </div>
      </section>

      {/* --- Reviews Section ---
      <section className="reviews section reveal" id="reviews">
        <p className="eyebrow light">Notes from 200+ five-star guests</p>
        <div className="review-stars">★★★★★</div>
        <blockquote>{reviews[review][0]}</blockquote>
        <p className="author">
          <strong>{reviews[review][1]}</strong> · {reviews[review][2]}
        </p>

        <div className="review-nav">
          {reviews.map((_, i) => (
            <button
              key={i}
              aria-label={`Show review ${i + 1}`}
              className={`indicator ${i === review ? "active" : ""}`}
              onClick={() => setReview(i)}
            />
          ))}
        </div>

        <div className="review-nav-arrows">
          <button
            className="review-arrow-btn"
            onClick={() =>
              setReview((review - 1 + reviews.length) % reviews.length)
            }
          >
            <Icon type="chevron-left" /> Previous
          </button>
          <button
            className="review-arrow-btn"
            onClick={() => setReview((review + 1) % reviews.length)}
          >
            Next <Icon type="chevron-right" />
          </button>
        </div>
      </section> */}

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
                  Lorem ipsum dolor sit amet. We will confirm these dates and
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

      {/* --- FAQ Accordion Section --- */}
      {/* <section className="faq-section section reveal" id="faq">
        <div className="section-head" style={{ textAlign: "center" }}>
          <p className="eyebrow">Everything you need to know</p>
          <h2>Frequently asked questions.</h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqs.includes(idx);
            return (
              <div key={faq.q} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  type="button"
                >
                  <h3>{faq.q}</h3>
                  <div className="faq-toggle-icon">
                    <Icon type="chevron-down" />
                  </div>
                </button>
                {isOpen && <div className="faq-answer">{faq.a}</div>}
              </div>
            );
          })}
        </div>
      </section> */}

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
                <li>Lorem ipsum dolor sit amet</li>
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
                <b>1811a Butler Ave, Tybee Island, Ga 31328</b>
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
                    placeholder="Lorem ipsum"
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
                    placeholder="Lorem ipsum"
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
                    placeholder="Lorem ipsum"
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
                    Message or questions (optional)
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Requested dates and any questions. We reply within 24 hours with availability."
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

      {/* --- Footer --- */}
      <footer>
        <div className="footer-top">
          <div>
            <p className="eyebrow light">Tybee Island, Georgia</p>
            <h2>
              Ready when
              <br />
              you are.
            </h2>
          </div>
          <a className="footer-book" href="#contact">
            Check availability
            <Icon type="arrow" />
          </a>
        </div>

        <div className="footer-main-grid">
          <div className="footer-col">
            <a className="brand" href="#top" style={{ color: "white" }}>
              Casa Oceano Rio
              <small className="location-tag">Tybee Island, Georgia</small>
            </a>
            <p style={{ marginTop: "14px" }}>
              Willie, a Savannah native, built this South Beach house in 1984.
              He and Shelly have welcomed guests here since 2010. Lorem ipsum
              dolor sit amet.
            </p>
          </div>

          <div className="footer-col">
            <h5>Direct contact</h5>
            <ul>
              <li>
                <a href="tel:9123984113">Willie: (912) 398-4113</a>
              </li>
              <li>
                <a href="tel:9123986901">Shelly: (912) 398-6901</a>
              </li>
              <li>
                <a href="mailto:wlfields@bellsouth.net">
                  wlfields@bellsouth.net
                </a>
              </li>
              <li>
                <a href="mailto:tybeeshelly@yahoo.com">tybeeshelly@yahoo.com</a>
              </li>
              <li>1811a Butler Ave, Tybee Island, Ga 31328</li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Quick links</h5>
            <ul>
              <li>
                <a href="#story">Our story</a>
              </li>
              <li>
                <a href="#spaces">Rooms & spaces</a>
              </li>
              <li>
                <a href="#gallery">Photo gallery</a>
              </li>
              <li>
                <a href="#video">Tybee video tour</a>
              </li>
              <li>
                <a href="#amenities">All amenities</a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Guest policies</h5>
            <ul>
              <li>Lorem ipsum</li>
              <li>No pets</li>
              <li>No smoking</li>
              <li>Children welcome</li>
              <li>Book direct, reply within 24 hours</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <small>
            © {new Date().getFullYear()} Casa Oceano Rio · Tybee Island,
            Georgia. All rights reserved.
          </small>
          <small>Lorem ipsum dolor sit amet</small>
        </div>
      </footer>

      {/* --- Sticky Mobile Book Bar & Sheet --- */}
      <button
        className="mobile-book"
        onClick={() => setSheet(true)}
        type="button"
      >
        Check availability <span>Lorem ipsum · South Beach, Tybee</span>
      </button>

      {sheet && (
        <div
          className="sheet-wrap"
          onClick={() => setSheet(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <button
              className="sheet-close"
              onClick={() => setSheet(false)}
              aria-label="Close booking drawer"
            >
              <Icon type="close" />
            </button>
            <p className="eyebrow">Direct Reservation</p>
            <h2>Stay at Casa Oceano Rio</h2>
            <p
              style={{
                fontSize: "14px",
                color: "var(--muted)",
                marginBottom: "20px",
              }}
            >
              1811a Butler Ave, Tybee Island, Ga 31328. Book directly with
              Willie and Shelly. We reply within 24 hours with availability.
            </p>
            <BookingBar
              mobile
              onApplyDates={(inDate, outDate, g) => {
                setSheet(false);
                handleApplyDatesFromHero(inDate, outDate, g);
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
