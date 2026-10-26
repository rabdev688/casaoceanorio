import { useState, useEffect, useId, FormEvent } from 'react'

// --- Gallery & Spaces Media Assets (Tybee Island coastal aesthetic) ---
interface PhotoItem {
  src: string
  title: string
  desc: string
  space: string
}

const photos: PhotoItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1790276319738-f7b19d7f7e8c?auto=format&fit=crop&w=1800&q=85',
    title: 'Casa Oceano Rio Exterior & Pool Deck',
    desc: 'Three stories of coastal living just steps from Tybee’s South Beach sands.',
    space: 'Exterior & Grounds',
  },
  {
    src: 'https://images.unsplash.com/photo-1790276319577-6fd4992ada4f?auto=format&fit=crop&w=1200&q=82',
    title: 'Private Dipping Pool Oasis',
    desc: 'Refreshing dip in the summer, gently heated during cool island winters.',
    space: 'Dipping Pool',
  },
  {
    src: 'https://images.unsplash.com/photo-1790276317950-cd0cad99655d?auto=format&fit=crop&w=1200&q=82',
    title: 'Open Living Room with 75" TV',
    desc: 'Wood-burning fireplace, soaring ceilings, and room for the whole family.',
    space: 'Living Room',
  },
  {
    src: 'https://images.unsplash.com/photo-1790276319469-e495208bfd45?auto=format&fit=crop&w=1200&q=82',
    title: 'Gourmet Kitchen & Dining Room',
    desc: 'Full kitchen, breakfast nook, 6 bar stools, plus dining table for 6.',
    space: 'Kitchen & Dining',
  },
  {
    src: 'https://images.unsplash.com/photo-1790276319296-1a47fce989ff?auto=format&fit=crop&w=1200&q=82',
    title: 'Primary Open Loft King Suite',
    desc: 'Expansive master loft with King bed, double vanities, and walk-in shower.',
    space: 'Primary Bedroom',
  },
  {
    src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=82',
    title: 'Panoramic Rooftop & Main Decks',
    desc: 'Breathtaking breezes where the Savannah River meets the Atlantic Ocean.',
    space: 'Rooftop Deck',
  },
  {
    src: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=82',
    title: 'Guest Suites & Historic 1940s Bath',
    desc: 'Thoughtfully renovated bathrooms and versatile multi-bed family rooms.',
    space: 'Guest Bath & Laundry',
  },
  {
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=82',
    title: 'South Beach Shoreline & Beach Gear',
    desc: 'Heavy-duty beach carts, umbrellas, chairs, floats & Yeti cooler included.',
    space: 'Tybee South Beach',
  },
]

// --- SVG Icons ---
type IconType =
  | 'wave'
  | 'bed'
  | 'pool'
  | 'view'
  | 'menu'
  | 'close'
  | 'arrow'
  | 'pin'
  | 'phone'
  | 'check'
  | 'tv'
  | 'wifi'
  | 'kitchen'
  | 'sun'
  | 'coffee'
  | 'flame'
  | 'car'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'star'
  | 'calendar'

const Icon = ({ type, className }: { type: IconType; className?: string }) => {
  const iconClass = className || 'icon'
  const paths: Record<IconType, React.ReactNode> = {
    wave: <path d="M2 13c3-4 6 4 10 0s7 4 10 0M2 8c3-4 6 4 10 0s7 4 10 0" />,
    bed: <path d="M3 18v-8m18 8v-6H3v6m3-6V7h7a4 4 0 0 1 4 4v1" />,
    pool: <path d="M2 15c3-3 5 3 8 0s5 3 8 0 4 0 4 0M2 19c3-3 5 3 8 0s5 3 8 0 4 0 4 0M7 14V5a2 2 0 0 1 4 0m0 4h6" />,
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
    coffee: <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z M6 2v2M10 2v2M14 2v2" />,
    flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
    car: (
      <>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
    'chevron-down': <path d="m6 9 6 6 6-6" />,
    'chevron-left': <path d="m15 18-6-6 6-6" />,
    'chevron-right': <path d="m9 18 6-6-6-6" />,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    calendar: (
      <>
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
  }

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
  )
}

// --- Booking Bar Component ---
interface BookingBarProps {
  mobile?: boolean
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: number
  onApplyDates?: (checkIn: string, checkOut: string, guests: number) => void
}

function BookingBar({
  mobile = false,
  initialCheckIn = '2026-06-12',
  initialCheckOut = '2026-06-18',
  initialGuests = 8,
  onApplyDates,
}: BookingBarProps) {
  const [checkIn, setCheckIn] = useState(initialCheckIn)
  const [checkOut, setCheckOut] = useState(initialCheckOut)
  const [guests, setGuests] = useState(initialGuests)

  const checkInId = useId()
  const checkOutId = useId()
  const guestsId = useId()

  const handleSearch = () => {
    if (onApplyDates) {
      onApplyDates(checkIn, checkOut, guests)
    } else {
      const contactEl = document.getElementById('contact')
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className={mobile ? 'booking booking-mobile' : 'booking'}>
      <label htmlFor={checkInId}>
        <span>Check-in</span>
        <input
          id={checkInId}
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
        />
      </label>
      <label htmlFor={checkOutId}>
        <span>Check-out</span>
        <input
          id={checkOutId}
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
        />
      </label>
      <label htmlFor={guestsId}>
        <span>Guests (sleeps 12+)</span>
        <select
          id={guestsId}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        >
          {[2, 4, 6, 8, 10, 12, 14].map((n) => (
            <option key={n} value={n}>
              {n} Guests
            </option>
          ))}
        </select>
      </label>
      <button className="primary" onClick={handleSearch} type="button">
        Check availability <Icon type="arrow" />
      </button>
    </div>
  )
}

// --- Calendar Data & Logic ---
interface MonthData {
  name: string
  year: number
  daysInMonth: number
  firstDayOffset: number // 0 = Sun, 1 = Mon ...
  blocked: number[]
  rates: number[]
}

const calendarMonths: MonthData[] = [
  {
    name: 'May',
    year: 2026,
    daysInMonth: 31,
    firstDayOffset: 5, // May 1, 2026 is Friday (offset 5)
    blocked: [1, 2, 8, 9, 15, 16, 22, 23, 24, 25],
    rates: Array.from({ length: 31 }, (_, i) => ([0, 5, 6].includes((i + 5) % 7) ? 585 : 520)),
  },
  {
    name: 'June',
    year: 2026,
    daysInMonth: 30,
    firstDayOffset: 1, // June 1, 2026 is Monday (offset 1)
    blocked: [5, 6, 7, 13, 14, 20, 21, 27, 28],
    rates: Array.from({ length: 30 }, (_, i) => ([0, 5, 6].includes((i + 1) % 7) ? 680 : 610)),
  },
  {
    name: 'July',
    year: 2026,
    daysInMonth: 31,
    firstDayOffset: 3, // July 1, 2026 is Wednesday (offset 3)
    blocked: [2, 3, 4, 5, 11, 12, 18, 19, 25, 26],
    rates: Array.from({ length: 31 }, (_, i) => ([0, 5, 6].includes((i + 3) % 7) ? 720 : 640)),
  },
  {
    name: 'August',
    year: 2026,
    daysInMonth: 31,
    firstDayOffset: 6, // Aug 1, 2026 is Saturday (offset 6)
    blocked: [1, 2, 7, 8, 14, 15, 21, 22],
    rates: Array.from({ length: 31 }, (_, i) => ([0, 5, 6].includes((i + 6) % 7) ? 620 : 550)),
  },
]

// --- Toast Interface ---
interface ToastMessage {
  id: number
  title: string
  text: string
}

function App() {
  // Navigation & Drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Lightbox
  const [lightbox, setLightbox] = useState<number | null>(null)

  // Amenity Tabs
  const [activeAmenityTab, setActiveAmenityTab] = useState<'indoor' | 'outdoor' | 'kitchen' | 'beach'>('indoor')

  // Reviews
  const [review, setReview] = useState(0)

  // Calendar State
  const [currentMonthIdx, setCurrentMonthIdx] = useState(1) // Start in June 2026
  const [selectedStart, setSelectedStart] = useState<{ monthIdx: number; day: number } | null>({
    monthIdx: 1,
    day: 8,
  })
  const [selectedEnd, setSelectedEnd] = useState<{ monthIdx: number; day: number } | null>({
    monthIdx: 1,
    day: 12,
  })

  // FAQ Accordion State (open FAQ indexes)
  const [openFaqs, setOpenFaqs] = useState<number[]>([0, 3])

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Contact Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    checkIn: '2026-06-08',
    checkOut: '2026-06-12',
    guests: 8,
    message: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Intersection Observer for .reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        }),
      { threshold: 0.12 },
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Scroll listener for Back to Top
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lightbox Keyboard Navigation
  useEffect(() => {
    if (lightbox === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightbox(null)
      } else if (e.key === 'ArrowRight') {
        setLightbox((prev) => (prev !== null ? (prev + 1) % photos.length : 0))
      } else if (e.key === 'ArrowLeft') {
        setLightbox((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : 0))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightbox])

  // Helper to show a Toast notification
  const showToast = (title: string, text: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, title, text }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5500)
  }

  // Handle Day Selection on Calendar
  const handleDayClick = (monthIdx: number, day: number) => {
    const currentMonth = calendarMonths[monthIdx]
    if (currentMonth.blocked.includes(day)) return

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // First click: select start date
      setSelectedStart({ monthIdx, day })
      setSelectedEnd(null)
    } else {
      // Second click: select end date
      const isAfter =
        monthIdx > selectedStart.monthIdx ||
        (monthIdx === selectedStart.monthIdx && day > selectedStart.day)

      if (isAfter) {
        setSelectedEnd({ monthIdx, day })

        // Pre-fill form dates
        const startM = String(monthIdx + 5).padStart(2, '0')
        const startD = String(selectedStart.day).padStart(2, '0')
        const endM = String(monthIdx + 5).padStart(2, '0')
        const endD = String(day).padStart(2, '0')

        setFormData((prev) => ({
          ...prev,
          checkIn: `2026-${startM}-${startD}`,
          checkOut: `2026-${endM}-${endD}`,
        }))

        showToast(
          'Dates Selected!',
          `Selected ${calendarMonths[selectedStart.monthIdx].name} ${selectedStart.day} to ${calendarMonths[monthIdx].name} ${day}. Rate calculated below.`,
        )
      } else {
        // Reset start date to clicked day
        setSelectedStart({ monthIdx, day })
        setSelectedEnd(null)
      }
    }
  }

  // Calculate nights and estimated total
  const calculateTotal = () => {
    if (!selectedStart || !selectedEnd) return null

    let nights = 0
    let subtotal = 0

    if (selectedStart.monthIdx === selectedEnd.monthIdx) {
      nights = selectedEnd.day - selectedStart.day
      const rates = calendarMonths[selectedStart.monthIdx].rates
      for (let d = selectedStart.day; d < selectedEnd.day; d++) {
        subtotal += rates[d - 1] || 550
      }
    } else {
      // Span across adjacent months
      const startDaysInM = calendarMonths[selectedStart.monthIdx].daysInMonth
      nights += startDaysInM - selectedStart.day
      nights += selectedEnd.day
      subtotal = nights * 595
    }

    const cleaningFee = 285
    const directSavings = Math.round(subtotal * 0.14) // ~14% third party fee saved!

    return {
      nights,
      subtotal,
      cleaningFee,
      total: subtotal + cleaningFee,
      directSavings,
    }
  }

  const bookingSummary = calculateTotal()

  // Apply dates from Hero Booking Bar
  const handleApplyDatesFromHero = (checkIn: string, checkOut: string, guests: number) => {
    setFormData((prev) => ({
      ...prev,
      checkIn,
      checkOut,
      guests,
    }))
    const contactEl = document.getElementById('contact')
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' })
    }
    showToast(
      'Dates Applied',
      `Check-in: ${checkIn}, Check-out: ${checkOut} for ${guests} guests. Ready to reserve direct!`,
    )
  }

  // FAQ Accordion Toggle
  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  // Contact Form Submission & Validation
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name.'
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please provide a valid email address.'
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      errors.phone = 'Please provide a direct contact phone number.'
    }
    if (!formData.checkIn) {
      errors.checkIn = 'Check-in date is required.'
    }
    if (!formData.checkOut) {
      errors.checkOut = 'Check-out date is required.'
    } else if (formData.checkIn && formData.checkOut <= formData.checkIn) {
      errors.checkOut = 'Check-out date must be after check-in date.'
    }

    setFormErrors(errors)

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true)

      // Simulate API integration delay
      setTimeout(() => {
        setIsSubmitting(false)
        showToast(
          'Inquiry Sent to Willie & Shelly!',
          `Thank you, ${formData.fullName}! Your direct booking inquiry has been received. We will respond within 24 hours.`,
        )
        // Reset form message
        setFormData((prev) => ({
          ...prev,
          message: '',
        }))
      }, 700)
    }
  }

  // Real Reviews for Tybee Island Beach House
  const reviews = [
    [
      '“Willie and Shelly have created the ultimate Tybee beach retreat! The house comfortably accommodated all 13 of us with space to spare. The dipping pool after long days on South Beach was pure heaven, and sunset from the rooftop deck is unforgettable. Already booked for next summer!”',
      'The Gallagher Family',
      'Atlanta, GA',
    ],
    [
      '“Booking directly with Willie and Shelly saved our family group over $600 in VRBO fees! The rolling beach carts, chairs, umbrellas, and the Low Country boil pot made our reunion effortless. You can walk to every great restaurant and the pier in minutes.”',
      'Marcus & Elena T.',
      'Charlotte, NC',
    ],
    [
      '“As Savannah natives, Willie and Shelly gave us the warmest Southern hospitality and the best local tips. The open loft master bedroom is gorgeous, the 75-inch TV was great for movie night, and the kitchen had everything we needed to cook for 14 people.”',
      'Sarah & David K.',
      'Nashville, TN',
    ],
    [
      '“Over 200 5-star reviews and now we completely understand why. Clean, historic character from 1984, incredible multi-level layout, and the beach is literally a 90-second stroll. This is the gold standard of Tybee vacation rentals.”',
      'The Henderson Clan',
      'Cincinnati, OH',
    ],
  ]

  // Amenities Categorized
  const amenityCategories = {
    indoor: [
      {
        icon: 'tv' as IconType,
        name: '75" Living Room 4K TV',
        desc: 'Plus satellite/cable and additional smart TVs in bedrooms.',
      },
      {
        icon: 'flame' as IconType,
        name: 'Wood-Burning Fireplace',
        desc: 'Cozy coastal evenings in the grand open-concept living area.',
      },
      {
        icon: 'sun' as IconType,
        name: 'Dual-Zone Air Conditioning & Heat',
        desc: 'Keeps all 3 floors perfectly cooled during warm Georgia summers.',
      },
      {
        icon: 'wifi' as IconType,
        name: 'High-Speed Wi-Fi',
        desc: 'Whole-home coverage for streaming, gaming, and remote work.',
      },
      {
        icon: 'check' as IconType,
        name: 'Washer & Dryer',
        desc: 'In-unit full laundry facilities in the renovated 1940s bath house.',
      },
      {
        icon: 'bed' as IconType,
        name: 'King Loft Suite',
        desc: 'Primary suite with double vanity, walk-in shower & open views.',
      },
      {
        icon: 'view' as IconType,
        name: 'Open Living Architecture',
        desc: '3-story handcrafted layout designed by owner Willie in 1984.',
      },
      {
        icon: 'check' as IconType,
        name: 'Linens & Bath Towels',
        desc: 'Crisp fresh bedding and fluffy towels provided for all guests.',
      },
    ],
    outdoor: [
      {
        icon: 'pool' as IconType,
        name: 'Private Dipping Pool',
        desc: 'Cool & refreshing in summer, gently heated during the winter months.',
      },
      {
        icon: 'view' as IconType,
        name: 'Rooftop Viewing Deck',
        desc: 'Panoramic vistas where the Savannah River meets the Atlantic Ocean.',
      },
      {
        icon: 'sun' as IconType,
        name: 'Second Floor Main Deck',
        desc: 'Spacious outdoor deck overlooking the sparkling pool patio.',
      },
      {
        icon: 'flame' as IconType,
        name: 'Large Gas BBQ Grill',
        desc: 'Ready for sunset cookouts and poolside dining.',
      },
      {
        icon: 'coffee' as IconType,
        name: 'Low Country Boil Pot & Burner',
        desc: 'Complete burner & giant pot for authentic coastal Georgia seafood boils.',
      },
      {
        icon: 'car' as IconType,
        name: 'Private On-Site Parking',
        desc: 'Complimentary off-street parking for multiple vehicles in South Beach.',
      },
      {
        icon: 'wave' as IconType,
        name: 'Covered Lounging Porch',
        desc: 'Comfortable seating to enjoy warm coastal ocean breezes.',
      },
      {
        icon: 'check' as IconType,
        name: 'Outdoor Shower Area',
        desc: 'Quick rinse off after a fun day on Tybee’s sunny sands.',
      },
    ],
    kitchen: [
      {
        icon: 'kitchen' as IconType,
        name: 'Full Chef’s Kitchen',
        desc: 'Fully equipped with oven, range, microwave, dishwasher & cookware.',
      },
      {
        icon: 'bed' as IconType,
        name: 'Dining Table for 6',
        desc: 'Comfortable dining room table just off the open kitchen concept.',
      },
      {
        icon: 'coffee' as IconType,
        name: 'Breakfast Nook (Seats 4)',
        desc: 'Bright morning dining corner for coffee and family breakfasts.',
      },
      {
        icon: 'sun' as IconType,
        name: '6 Kitchen Bar Stools',
        desc: 'Expansive breakfast bar island for casual meals and gathering.',
      },
      {
        icon: 'check' as IconType,
        name: 'Extra First Floor Fridge',
        desc: 'Second full-size refrigerator for chilled drinks, watermelon & ice.',
      },
      {
        icon: 'coffee' as IconType,
        name: 'Coffee Maker & Blender',
        desc: 'Drip coffee, Keurig, blender for smoothies & frozen drinks.',
      },
      {
        icon: 'check' as IconType,
        name: 'Half Bath off Dining',
        desc: 'Convenient powder room on the main entertaining level.',
      },
      {
        icon: 'flame' as IconType,
        name: 'Generous Dinnerware & Cutlery',
        desc: 'Complete sets of plates, glasses, and serving ware for 14+ guests.',
      },
    ],
    beach: [
      {
        icon: 'car' as IconType,
        name: 'Heavy-Duty Beach Carts',
        desc: 'Easy-rolling large beach wagons to haul gear effortlessly to the sand.',
      },
      {
        icon: 'sun' as IconType,
        name: 'Beach Chairs & Umbrellas',
        desc: 'Sturdy Tommy Bahama beach chairs and oversized shade umbrellas.',
      },
      {
        icon: 'wave' as IconType,
        name: 'Floats & Boogie Boards',
        desc: 'Fun ocean gear and pool floats ready for kids and adults.',
      },
      {
        icon: 'pool' as IconType,
        name: 'Large Beach Cooler',
        desc: 'Yeti-style cooler to keep drinks and beach snacks ice-cold.',
      },
      {
        icon: 'pin' as IconType,
        name: 'South Beach Footsteps Away',
        desc: 'Just 1 to 2 minute flat walk to the oceanfront and boardwalk.',
      },
      {
        icon: 'check' as IconType,
        name: 'Children Welcome',
        desc: 'Family-friendly layout with board games, high chair, and safe spaces.',
      },
      {
        icon: 'view' as IconType,
        name: 'Walk to Tybee Pier & Shops',
        desc: 'Stroll to restaurants, ice cream shops, surf shops, and night spots.',
      },
      {
        icon: 'check' as IconType,
        name: 'Allergy-Free (No Pets/Smoke)',
        desc: 'Strict non-smoking and no-pet policy keeps the home pristine.',
      },
    ],
  }

  // Real FAQs for Casa Oceano Rio
  const faqs = [
    {
      q: 'How do I book directly and avoid platform fees?',
      a: 'You can submit the contact form right on this website or call Willie directly at (912) 398-4113 or Shelly at (912) 398-6901. While we are a top-rated Premier Host on VRBO, reserving directly with us saves you up to 14%–18% in third-party platform service fees and guarantees personal Savannah hospitality from day one!',
    },
    {
      q: 'What is the cancellation policy?',
      a: 'We offer fair and flexible terms. Direct bookings cancelled 30 days or more prior to arrival receive a full refund minus a modest processing fee. Cancellations within 30 days receive credit towards future stays whenever dates can be re-booked.',
    },
    {
      q: 'Is Casa Oceano Rio pet-friendly?',
      a: 'To guarantee an immaculate, allergen-free environment for all of our visiting guests and children, pets are strictly not permitted on the property. Thank you for your understanding.',
    },
    {
      q: 'How far is the beach and what is the neighborhood like?',
      a: 'Casa Oceano Rio is situated in Tybee Island’s premier South Beach district at 1811a Butler Avenue. It is an easy 1-to-2 minute flat walk (less than 200 yards) straight to the sandy beach and ocean boardwalk. You can leave your car parked for your entire stay—restaurants, shops, cafes, and the famous Tybee Pier & Pavilion are all within easy walking distance!',
    },
    {
      q: 'What beach gear is included with our stay?',
      a: 'Everything you need for beach days is provided free of charge! We supply large rolling beach wagons/carts, comfortable Tommy Bahama beach chairs, sturdy umbrellas, boogie boards, pool floats, and a large cooler. Pack light and enjoy!',
    },
    {
      q: 'Is parking available on-site?',
      a: 'Yes! We provide complimentary private off-street parking directly at the property that easily accommodates up to 4 vehicles. Parking is heavily regulated and paid throughout Tybee Island, so having free private parking right on Butler Ave is a huge perk.',
    },
    {
      q: 'What are the check-in and check-out times?',
      a: 'Check-in is at 4:00 PM and check-out is at 10:00 AM. We offer contactless keyless entry codes tailored for each guest. Early check-in or late check-out can often be arranged depending on seasonal turnover schedules.',
    },
    {
      q: 'How many guests can Casa Oceano Rio accommodate?',
      a: 'The property sleeps 12 to 14 guests comfortably across 4 private bedrooms plus an open master loft. The bedding layout includes: 3rd floor Master Loft (King bed), 2nd floor Bedroom 1 (Queen + 2 Twins), 2nd floor Bedroom 2 (Queen bed), 1st floor Bedroom 1 (Queen + 2 Twins + Futon), and 1st floor Bedroom 2 (2 Queen beds + extra fridge). There are multiple living zones, 3.5 bathrooms, and dining seating for 16.',
    },
  ]

  const currentMonth = calendarMonths[currentMonthIdx]

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
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              aria-label="Close notification"
            >
              <Icon type="close" />
            </button>
          </div>
        ))}
      </div>

      {/* --- Floating Back to Top Button --- */}
      <button
        className={`back-to-top ${showBackToTop ? 'show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top of page"
      >
        <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>

      {/* --- Mobile Navigation Drawer --- */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-nav-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="mobile-nav-drawer" role="dialog" aria-modal="true">
            <div>
              <div className="mobile-nav-top">
                <a className="brand" href="#top" onClick={() => setMobileMenuOpen(false)}>
                  Casa Oceano Rio
                  <small className="location-tag">Tybee Island, Georgia</small>
                </a>
                <button
                  className="mobile-nav-close"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <Icon type="close" />
                </button>
              </div>

              <nav className="mobile-nav-links">
                <a href="#story" onClick={() => setMobileMenuOpen(false)}>
                  The Casa & Story <Icon type="arrow" />
                </a>
                <a href="#spaces" onClick={() => setMobileMenuOpen(false)}>
                  Rooms & Spaces <Icon type="arrow" />
                </a>
                <a href="#gallery" onClick={() => setMobileMenuOpen(false)}>
                  Photo Gallery <Icon type="arrow" />
                </a>
                <a href="#video" onClick={() => setMobileMenuOpen(false)}>
                  Tybee Video Tour <Icon type="arrow" />
                </a>
                <a href="#amenities" onClick={() => setMobileMenuOpen(false)}>
                  Amenities <Icon type="arrow" />
                </a>
                <a href="#location" onClick={() => setMobileMenuOpen(false)}>
                  South Beach Location <Icon type="arrow" />
                </a>
                <a href="#reviews" onClick={() => setMobileMenuOpen(false)}>
                  Guest Reviews <Icon type="arrow" />
                </a>
                <a href="#booking" onClick={() => setMobileMenuOpen(false)}>
                  Rates & Calendar <Icon type="arrow" />
                </a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)}>
                  FAQ <Icon type="arrow" />
                </a>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
                  Direct Reservation <Icon type="arrow" />
                </a>
              </nav>
            </div>

            <div className="mobile-nav-contacts">
              <p>Direct Hosts (Savannah Natives)</p>
              <div className="mobile-nav-phone-row">
                <a href="tel:9123984113">
                  <Icon type="phone" /> Willie: (912) 398-4113
                </a>
                <a href="tel:9123986901">
                  <Icon type="phone" /> Shelly: (912) 398-6901
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- Desktop & Mobile Header --- */}
      <header className="nav">
        <a className="brand" href="#top">
          Casa Oceano Rio
          <small className="location-tag">Tybee Island, Georgia</small>
        </a>

        <nav>
          <a href="#story">The Casa</a>
          <a href="#spaces">Spaces</a>
          <a href="#gallery">Gallery</a>
          <a href="#amenities">Amenities</a>
          <a href="#location">Location</a>
          <a href="#reviews">Reviews</a>
          <a href="#booking">Availability</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="nav-actions">
          <a className="nav-phone" href="tel:9123984113" title="Call Willie directly">
            <Icon type="phone" /> (912) 398-4113
          </a>
          <a className="nav-cta" href="#contact">
            Book direct
          </a>
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Icon type="menu" />
          </button>
        </div>
      </header>

      {/* --- Hero Section --- */}
      <div className="hero-wrap">
        <section className="hero" id="top">
          <div className="hero-bg" />
          <div className="hero-copy">
            <div className="hero-subhead">
              <p className="eyebrow light">Tybee Island, Georgia · South Beach</p>
            </div>
            <h1>
              Where the river
              <br />
              meets the ocean.
            </h1>
            <p className="intro">
              Handcrafted in 1984 by Savannah native Willie and family-cherished with Shelly. A
              3-story South Beach haven sleeping 12+ with private dipping pool, rooftop ocean-breeze
              deck, and beach gear included.
            </p>

            <div className="hero-direct-badge">
              <Icon type="check" />
              <span>Book directly with Willie & Shelly and skip the platform fees.</span>
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
            <strong>South Beachfront</strong>
            <span>Steps to sands & Tybee Pier</span>
          </div>
        </article>
        <article>
          <Icon type="bed" />
          <div>
            <strong>Sleeps 12+ Guests</strong>
            <span>4 Bedrooms + King Loft & Suites</span>
          </div>
        </article>
        <article>
          <Icon type="pool" />
          <div>
            <strong>Private Dipping Pool</strong>
            <span>Cool in summer · Heated winter</span>
          </div>
        </article>
        <article>
          <Icon type="view" />
          <div>
            <strong>Rooftop Viewing Deck</strong>
            <span>River & Atlantic ocean panoramas</span>
          </div>
        </article>
      </section>

      {/* --- Story Section: Willie & Shelly's Tybee Legacy --- */}
      <section className="story section reveal" id="story">
        <div className="section-head">
          <p className="eyebrow">A Savannah family legacy since 1984</p>
          <h2>
            Built by hand in 1984.
            <br />
            Hosting guests since 2010.
          </h2>
        </div>

        <div className="story-layout">
          <div className="story-copy">
            <p className="lead">
              Willie built this coastal home with his own hands as a private residence in 1984. In
              2010, Willie and Shelly opened Casa Oceano Rio to welcoming guests from around the world.
            </p>
            <p>
              Located in Tybee’s coveted South Beach district at 1811a Butler Avenue, Casa Oceano Rio
              is where the tranquil Savannah River estuary converges with the rolling Atlantic Ocean.
              Stroll one minute to the beach, swim in your private dipping pool, or watch coastal
              sunsets from the panoramic rooftop deck.
            </p>

            <div className="owner-badge">
              <div className="owner-badge-text">
                <strong>Savannah Natives Willie & Shelly</strong>
                <span>Direct owners & hosts · welcoming guests since 2010</span>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <b>1984</b>
                <span>Year Built</span>
              </div>
              <div className="stat-item">
                <b>200+</b>
                <span>5-Star Reviews</span>
              </div>
              <div className="stat-item">
                <b>12+</b>
                <span>Guests Hosted</span>
              </div>
            </div>

            <a className="text-link" href="#contact">
              Inquire directly with Willie & Shelly <Icon type="arrow" />
            </a>
          </div>

          <div className="overlap">
            <img
              className="main-photo"
              src={photos[1].src}
              alt="Casa Oceano Rio private dipping pool and deck"
            />
            <img
              className="float-photo"
              src={photos[2].src}
              alt="Spacious living room with 75 inch TV and fireplace"
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

        <div className="spaces-grid">
          <div className="space-card">
            <div className="space-card-top">
              <span className="space-tag">Third Floor Penthouse</span>
              <h3>Primary Loft King Suite</h3>
              <p>
                A soaring open loft featuring a King bed, adjoining luxury primary bath with two
                vanities, make-up area, and a large walk-in glass shower.
              </p>
            </div>
            <ul className="space-features">
              <li>Open loft concept overlooking main floor</li>
              <li>Dual vanities & dedicated vanity mirror</li>
              <li>Large walk-in shower & cathedral ceilings</li>
            </ul>
          </div>

          <div className="space-card">
            <div className="space-card-top">
              <span className="space-tag">Second Floor Gathering</span>
              <h3>Living Room & Fireplace</h3>
              <p>
                Open-concept main living space anchored by a 75” 4K Smart TV and wood-burning
                fireplace. Architectural stairs lead up to the 3rd-floor loft.
              </p>
            </div>
            <ul className="space-features">
              <li>75” 4K TV with cable & streaming</li>
              <li>Genuine wood-burning fireplace</li>
              <li>Direct access to pool-view main deck</li>
            </ul>
          </div>

          <div className="space-card">
            <div className="space-card-top">
              <span className="space-tag">Gourmet Entertaining</span>
              <h3>Chef’s Kitchen & Dining</h3>
              <p>
                Full kitchen ready for feast preparation. Dining table seats 6, breakfast nook
                seats 4, plus 6 bar stools at the expansive granite kitchen counter.
              </p>
            </div>
            <ul className="space-features">
              <li>Total seating for 16 guests together</li>
              <li>Half bath conveniently located off dining</li>
              <li>Low Country boil pot & outdoor gas burner</li>
            </ul>
          </div>

          <div className="space-card">
            <div className="space-card-top">
              <span className="space-tag">Second Floor Suites</span>
              <h3>Second Floor Family Rooms</h3>
              <p>
                Two generous bedrooms including Bedroom 1 (Queen bed + 2 Twins) and Bedroom 2 (Queen
                bed), with shared bathroom and peaceful natural light.
              </p>
            </div>
            <ul className="space-features">
              <li>Queen beds with premium coastal linens</li>
              <li>Twin beds ideal for kids or siblings</li>
              <li>Shared full ceramic-tile bath</li>
            </ul>
          </div>

          <div className="space-card">
            <div className="space-card-top">
              <span className="space-tag">First Floor Living</span>
              <h3>Ground Level Guest Suites</h3>
              <p>
                First Floor Bedroom 1 (Queen + 2 Twins + Futon) and Bedroom 2 (2 Queen beds, TV,
                extra refrigerator for drinks). Plus 2 full baths (one with laundry facilities in
                renovated 1940s bath house).
              </p>
            </div>
            <ul className="space-features">
              <li>Extra full-size refrigerator on 1st floor</li>
              <li>Washer & dryer laundry room</li>
              <li>Renovated historic 1940s bath house styling</li>
            </ul>
          </div>

          <div className="space-card">
            <div className="space-card-top">
              <span className="space-tag">Private Oasis & Decks</span>
              <h3>Dipping Pool & Rooftop</h3>
              <p>
                Your private dipping pool is cool in the summer and heated in the winter. Soak up the
                sun on the 2nd-floor main deck or climb to the rooftop deck for 360° island breezes.
              </p>
            </div>
            <ul className="space-features">
              <li>Heated in winter, refreshing in summer</li>
              <li>Large gas BBQ grill on poolside deck</li>
              <li>Rooftop deck for sunrises and starlight</li>
            </ul>
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
                loading={i > 1 ? 'lazy' : 'eager'}
              />
              <div className="gallery-caption">
                <span className="title">{photo.title}</span>
                <span className="index">0{i + 1} / 0{photos.length}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="gallery-more-btn-wrap">
          <button
            className="primary"
            style={{ margin: '0 auto' }}
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
              e.stopPropagation()
              setLightbox((lightbox - 1 + photos.length) % photos.length)
            }}
            aria-label="Previous image"
          >
            <Icon type="chevron-left" />
          </button>

          <button
            className="lightbox-nav-btn lightbox-next"
            onClick={(e) => {
              e.stopPropagation()
              setLightbox((lightbox + 1) % photos.length)
            }}
            aria-label="Next image"
          >
            <Icon type="chevron-right" />
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
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
                  className={`lightbox-dot ${idx === lightbox ? 'active' : ''}`}
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
          <p className="eyebrow light">Coastal Georgia paradise</p>
          <h2>Explore Tybee Island.</h2>
          <p
            className="intro"
            style={{ margin: '16px auto 36px', maxWidth: '640px', textAlign: 'center' }}
          >
            Take a bird’s-eye drone tour of our barrier island home. From sandy South Beach and the
            famed Tybee Pier right down our street, to lighthouses, dolphin estuaries, and coastal
            marshes.
          </p>

          <div className="video-player-wrap">
            <iframe
              src="https://www.youtube.com/embed/VPBE2E0TaS8?rel=0&modestbranding=1"
              title="Tybee Island Drone Tour Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="video-badges">
            <span className="video-badge">Dolphins in the estuaries</span>
            <span className="video-badge">Walking distance to South Beach</span>
            <span className="video-badge">Tybee Beach Pier & Pavilion</span>
            <span className="video-badge">Fort Screven & the lighthouse</span>
            <span className="video-badge">Fresh Low Country seafood</span>
          </div>
        </div>
      </section>

      {/* --- Amenity Categories with Tabs --- */}
      <section className="amenities section reveal" id="amenities">
        <div className="section-head">
          <p className="eyebrow">Every comfort anticipated</p>
          <h2>Effortless coastal living.</h2>
        </div>

        {/* Tab Buttons */}
        <div className="amenity-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeAmenityTab === 'indoor'}
            className={`amenity-tab-btn ${activeAmenityTab === 'indoor' ? 'active' : ''}`}
            onClick={() => setActiveAmenityTab('indoor')}
          >
            Indoor Comforts
          </button>
          <button
            role="tab"
            aria-selected={activeAmenityTab === 'outdoor'}
            className={`amenity-tab-btn ${activeAmenityTab === 'outdoor' ? 'active' : ''}`}
            onClick={() => setActiveAmenityTab('outdoor')}
          >
            Outdoor & Pool
          </button>
          <button
            role="tab"
            aria-selected={activeAmenityTab === 'kitchen'}
            className={`amenity-tab-btn ${activeAmenityTab === 'kitchen' ? 'active' : ''}`}
            onClick={() => setActiveAmenityTab('kitchen')}
          >
            Kitchen & Dining
          </button>
          <button
            role="tab"
            aria-selected={activeAmenityTab === 'beach'}
            className={`amenity-tab-btn ${activeAmenityTab === 'beach' ? 'active' : ''}`}
            onClick={() => setActiveAmenityTab('beach')}
          >
            Beach Gear & Fun
          </button>
        </div>

        {/* Amenity Grid */}
        <div className="amenity-grid">
          {amenityCategories[activeAmenityTab].map((item) => (
            <div key={item.name} className="amenity-item">
              <div className="amenity-item-top">
                <Icon type={item.icon} />
              </div>
              <div>
                <strong>{item.name}</strong>
                <p className="desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="amenities-note">
          <span>
            <b>No smoking</b> anywhere on the property
          </span>
          <span>
            <b>No pets</b>, which keeps the home allergen-free
          </span>
          <span>
            <b>Children welcome</b>
          </span>
          <span>
            <b>Free on-site parking</b> for up to 4 vehicles
          </span>
        </div>
      </section>

      {/* --- Location Section: Tybee Island & South Beach --- */}
      <section className="location section reveal" id="location">
        <div className="location-copy">
          <p className="eyebrow light">Tybee Island · South Beach District</p>
          <h2>One block from the sand.</h2>
          <p>
            Casa Oceano Rio is nestled in Tybee Island’s beloved South Beach neighborhood at{' '}
            <b>1811a Butler Avenue</b>. Leave your car behind in our private driveway—stroll in
            moments to the sand, beachside boutiques, open-air seafood eateries, and lively evening
            entertainment.
          </p>

          <div className="location-address">
            <Icon type="pin" />
            <div>
              <b>1811a Butler Ave, Tybee Island, GA 31328</b>
              <br />
              <span style={{ fontSize: '13px', opacity: 0.85 }}>
                Coordinates: 31.9974° N, 80.8504° W
              </span>
            </div>
          </div>

          <ul>
            <li>
              South Beach Sand & Ocean <b>1 min walk (200 yards)</b>
            </li>
            <li>
              Tybee Beach Pier & Pavilion <b>5 min walk</b>
            </li>
            <li>
              South Beach Dining, Cafes & Nightclubs <b>3 min walk</b>
            </li>
            <li>
              Tybee Island Light Station & Museum <b>8 min drive</b>
            </li>
            <li>
              Historic Fort Screven <b>7 min drive</b>
            </li>
            <li>
              Savannah Historic District (River St & Squares) <b>20 min drive</b>
            </li>
          </ul>
        </div>

        <div className="location-map">
          <div className="map-card">
            <iframe
              title="Map of Casa Oceano Rio, 1811a Butler Ave, Tybee Island, Georgia"
              src="https://www.google.com/maps?q=1811a%20Butler%20Ave%2C%20Tybee%20Island%2C%20GA%2031328&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <a
            className="map-link"
            href="https://www.google.com/maps/search/?api=1&query=1811a+Butler+Ave,+Tybee+Island,+GA+31328"
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps <Icon type="arrow" />
          </a>
        </div>
      </section>

      {/* --- Reviews Section --- */}
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
              className={`indicator ${i === review ? 'active' : ''}`}
              onClick={() => setReview(i)}
            />
          ))}
        </div>

        <div className="review-nav-arrows">
          <button
            className="review-arrow-btn"
            onClick={() => setReview((review - 1 + reviews.length) % reviews.length)}
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
      </section>

      {/* --- Interactive Calendar & Rate Estimator --- */}
      <section className="calendar-section section reveal" id="booking">
        <div className="calendar-intro">
          <p className="eyebrow">Direct availability & rates</p>
          <h2>Plan your stay.</h2>
          <p>
            Select your check-in and check-out dates to calculate your live stay estimate. Direct
            bookings avoid third-party platform service fees!
          </p>

          <div className="legend">
            <span>
              <i className="available" /> Available
            </span>
            <span>
              <i className="selected-dot" /> Selected
            </span>
            <span>
              <i className="unavailable" /> Reserved
            </span>
          </div>

          {bookingSummary ? (
            <div className="booking-summary-card" style={{ marginTop: '30px' }}>
              <div className="booking-summary-info">
                <h4>
                  {bookingSummary.nights} Nights at Casa Oceano Rio
                </h4>
                <p>
                  Nightly subtotal: ${bookingSummary.subtotal}
                  <br />
                  Cleaning & linen: ${bookingSummary.cleaningFee}
                </p>
              </div>
              <div className="booking-summary-price">
                <b>${bookingSummary.total} total</b>
                <small>Saves ~${bookingSummary.directSavings} in platform fees</small>
              </div>
              <button
                className="primary"
                style={{ width: '100%', marginTop: '14px' }}
                onClick={() => {
                  const contactEl = document.getElementById('contact')
                  if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Inquire with these dates <Icon type="arrow" />
              </button>
            </div>
          ) : (
            <div className="hint-note">
              Select a check-in day, then a check-out day to see your exact direct rate.
            </div>
          )}
        </div>

        <div className="calendar">
          {/* Calendar Month Navigation Header */}
          <div className="calendar-controls">
            <span className="month-heading">
              {currentMonth.name} {currentMonth.year}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="month-nav-btn"
                disabled={currentMonthIdx === 0}
                onClick={() => setCurrentMonthIdx((prev) => Math.max(0, prev - 1))}
                aria-label="Previous month"
              >
                ← Prev
              </button>
              <button
                className="month-nav-btn"
                disabled={currentMonthIdx === calendarMonths.length - 1}
                onClick={() =>
                  setCurrentMonthIdx((prev) => Math.min(calendarMonths.length - 1, prev + 1))
                }
                aria-label="Next month"
              >
                Next →
              </button>
            </div>
          </div>

          <div className="week">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>

          <div className="days">
            {/* Blank leading slots based on firstDayOffset */}
            {Array.from({ length: currentMonth.firstDayOffset }).map((_, i) => (
              <span key={`blank-${i}`} />
            ))}

            {/* Days of the month */}
            {Array.from({ length: currentMonth.daysInMonth }).map((_, idx) => {
              const day = idx + 1
              const isBlocked = currentMonth.blocked.includes(day)
              const rate = currentMonth.rates[idx] || 550

              const isSelectedStart =
                selectedStart &&
                selectedStart.monthIdx === currentMonthIdx &&
                selectedStart.day === day

              const isSelectedEnd =
                selectedEnd &&
                selectedEnd.monthIdx === currentMonthIdx &&
                selectedEnd.day === day

              // Check if inside selected range
              let isInRange = false
              if (selectedStart && selectedEnd) {
                if (selectedStart.monthIdx === selectedEnd.monthIdx) {
                  isInRange =
                    currentMonthIdx === selectedStart.monthIdx &&
                    day > selectedStart.day &&
                    day < selectedEnd.day
                } else if (currentMonthIdx === selectedStart.monthIdx) {
                  isInRange = day > selectedStart.day
                } else if (currentMonthIdx === selectedEnd.monthIdx) {
                  isInRange = day < selectedEnd.day
                }
              }

              let btnClass = ''
              if (isBlocked) btnClass = 'blocked'
              else if (isSelectedStart) btnClass = 'selected-start'
              else if (isSelectedEnd) btnClass = 'selected-end'
              else if (isInRange) btnClass = 'in-range'

              return (
                <button
                  key={day}
                  className={btnClass}
                  disabled={isBlocked}
                  onClick={() => handleDayClick(currentMonthIdx, day)}
                  type="button"
                >
                  <b>{day}</b>
                  <small>{isBlocked ? '—' : `$${rate}`}</small>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* --- FAQ Accordion Section --- */}
      <section className="faq-section section reveal" id="faq">
        <div className="section-head" style={{ textAlign: 'center' }}>
          <p className="eyebrow">Everything you need to know</p>
          <h2>Frequently asked questions.</h2>
        </div>

        <div className="faq-list">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqs.includes(idx)
            return (
              <div key={faq.q} className={`faq-item ${isOpen ? 'open' : ''}`}>
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
            )
          })}
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
                We are Savannah locals who built and cherish this home. You skip all third-party
                booking fees and receive personal assistance with your trip.
              </p>
              <ul>
                <li>Save 14% to 18% in VRBO / third-party traveler fees</li>
                <li>Best rate guarantee for multi-night and week-long stays</li>
                <li>Direct communication with hosts Willie & Shelly</li>
                <li>Flexible check-in / check-out options when available</li>
                <li>Complimentary beach cart, umbrellas, cooler & dipping pool heat</li>
              </ul>
            </div>

            <div className="host-cards">
              <div className="host-card">
                <span className="role">Host & builder</span>
                <strong>Willie</strong>
                <a className="phone-link" href="tel:9123984113">
                  <Icon type="phone" /> (912) 398-4113
                </a>
              </div>
              <div className="host-card">
                <span className="role">Host & co-owner</span>
                <strong>Shelly</strong>
                <a className="phone-link" href="tel:9123986901">
                  <Icon type="phone" /> (912) 398-6901
                </a>
              </div>
            </div>

            <div className="contact-note">
              <Icon type="pin" />
              <div>
                <b>1811a Butler Ave, Tybee Island, GA 31328</b>
                <br />
                Prefer email? Reach us at{' '}
                <a href="mailto:stay@casaoceanorio.com">stay@casaoceanorio.com</a>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <h3>Direct reservation inquiry</h3>
            <p className="form-subtitle">
              Fill out this quick form and we’ll get back to you within 24 hours with confirmed
              direct rates and availability.
            </p>

            <form onSubmit={handleFormSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="fullName">Your full name *</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Sarah Jenkins"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  {formErrors.fullName && <span className="error-msg">{formErrors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email address *</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="sarah@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {formErrors.email && <span className="error-msg">{formErrors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone number *</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="(912) 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  {formErrors.phone && <span className="error-msg">{formErrors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="formCheckIn">Check-in date *</label>
                  <input
                    id="formCheckIn"
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  />
                  {formErrors.checkIn && <span className="error-msg">{formErrors.checkIn}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="formCheckOut">Check-out date *</label>
                  <input
                    id="formCheckOut"
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  />
                  {formErrors.checkOut && <span className="error-msg">{formErrors.checkOut}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="guests">Number of guests (sleeps 12+)</label>
                  <select
                    id="guests"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                  >
                    {[2, 4, 6, 8, 10, 12, 14].map((n) => (
                      <option key={n} value={n}>
                        {n} Guests
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="message">Message or questions (optional)</label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Tell us about your family vacation, celebration, or any questions about Casa Oceano Rio..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
              </div>

              <button className="primary submit-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Sending Inquiry...'
                ) : (
                  <>
                    Send booking inquiry <Icon type="arrow" />
                  </>
                )}
              </button>

              <p className="form-fineprint">
                No obligation. We never share your contact details, and your direct rate is
                guaranteed.
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
            <a className="brand" href="#top" style={{ color: 'white' }}>
              Casa Oceano Rio
              <small className="location-tag">Tybee Island, Georgia</small>
            </a>
            <p style={{ marginTop: '14px' }}>
              A three-story South Beach home, built by hand in 1984 by Savannah native Willie and
              run with Shelly, welcoming guests since 2010.
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
                <a href="mailto:stay@casaoceanorio.com">stay@casaoceanorio.com</a>
              </li>
              <li>1811a Butler Ave, Tybee Island, GA 31328</li>
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
              <li>Check-in: 4:00 PM</li>
              <li>Check-out: 10:00 AM</li>
              <li>Sleeps 12–14 guests</li>
              <li>No Pets / No Smoking</li>
              <li>VRBO Premier Host</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <small>© {new Date().getFullYear()} Casa Oceano Rio · Tybee Island, Georgia. All rights reserved.</small>
          <small>Savannah hospitality · Book direct to save</small>
        </div>
      </footer>

      {/* --- Sticky Mobile Book Bar & Sheet --- */}
      <button className="mobile-book" onClick={() => setSheet(true)} type="button">
        Check availability <span>Sleeps 12+ · South Beach</span>
      </button>

      {sheet && (
        <div className="sheet-wrap" onClick={() => setSheet(false)} role="dialog" aria-modal="true">
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
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px' }}>
              1811a Butler Ave, Tybee Island, GA. Book directly with Willie & Shelly to skip the
              third-party fees.
            </p>
            <BookingBar
              mobile
              onApplyDates={(inDate, outDate, g) => {
                setSheet(false)
                handleApplyDatesFromHero(inDate, outDate, g)
              }}
            />
          </div>
        </div>
      )}
    </main>
  )
}

export default App
