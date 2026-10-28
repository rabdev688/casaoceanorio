import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";

import { Navbar } from "@/components/navbar";
import { BookingBar } from "@/components/booking-bar";
import { Icon } from "@/components/icon";

import { Home } from "@/pages/Home";
import { Gallery } from "@/pages/Gallery";
import { About } from "@/pages/About";
import { Amenities } from "@/pages/Amenities";
import { Location } from "@/pages/Location";
import { Book } from "@/pages/Book";

// Scrolls to the top of the page on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

interface ToastMessage {
  id: number;
  title: string;
  text: string;
}

function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Scroll listener for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <ScrollToTop />

      {/* --- Page Routes --- */}
      <div className={pathname === "/" ? undefined : "page-offset"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/amenities" element={<Amenities />} />
          <Route path="/location" element={<Location />} />
          <Route path="/book" element={<Book />} />
        </Routes>
      </div>

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
          <Link className="footer-book" to="/book">
            Check availability
            <Icon type="arrow" />
          </Link>
        </div>

        <div className="footer-main-grid">
          <div className="footer-col">
            <Link className="brand" to="/" style={{ color: "white" }}>
              Casa Oceano Rio
              <small className="location-tag">Tybee Island, Georgia</small>
            </Link>
            <p style={{ marginTop: "14px" }}>
              Willie and Shelly have welcomed guests to this South Beach house since 2010.
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
                <a href={`mailto:${import.meta.env.VITE_CONTACT_EMAIL}`}>
                  {import.meta.env.VITE_CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a href="mailto:tybeeshelly@yahoo.com">tybeeshelly@yahoo.com</a>
              </li>
              <li>{import.meta.env.VITE_ADDRESS}</li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Quick links</h5>
            <ul>
              <li>
                <Link to="/about">Our story</Link>
              </li>
              <li>
                <Link to="/amenities">Rooms & spaces</Link>
              </li>
              <li>
                <Link to="/gallery">Photo gallery</Link>
              </li>
              <li>
                <Link to="/gallery">Tybee video tour</Link>
              </li>
              <li>
                <Link to="/amenities">All amenities</Link>
              </li>
              <li>
                <Link to="/location">Location & area</Link>
              </li>
            </ul>
          </div>


        </div>

        <div className="footer-bottom">
          <small>
            © {new Date().getFullYear()} Casa Oceano Rio · Tybee Island,
            Georgia. All rights reserved.
          </small>
        </div>
      </footer>

      {/* --- Sticky Mobile Book Bar & Sheet --- */}
      <button
        className="mobile-book"
        onClick={() => setSheet(true)}
        type="button"
      >
        Check availability <span>Steps to the beach · South Beach, Tybee</span>
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
              {import.meta.env.VITE_ADDRESS}. Book directly with
              Willie and Shelly. We reply within 24 hours with availability.
            </p>
            <BookingBar
              mobile
              onApplyDates={() => {
                setSheet(false);
                if (pathname === "/") {
                  document
                    .getElementById("booking")
                    ?.scrollIntoView({ behavior: "smooth" });
                } else {
                  navigate("/book");
                }
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
