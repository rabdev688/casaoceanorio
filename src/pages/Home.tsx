import { Link } from "react-router-dom";
import { BookingBar } from "@/components/booking-bar";
import { Icon } from "@/components/icon";
import { amenityColumns } from "@/data/amenities";
import { photos } from "@/data/photos";
import { spacesData } from "@/data/spaces";
import { useReveal } from "@/lib/useReveal";
import { Book } from "@/pages/Book";

export function Home() {
  useReveal();

  return (
    <>
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
              included.
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
        <BookingBar
          onApplyDates={() => {
            document
              .getElementById("booking")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        />
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
          <Icon type="air" />
          <div>
            <strong>Air conditioning  </strong>
            <span>Keep your home cool and comfortable</span>
          </div>
        </article>
        <article>
          <Icon type="pool" />
          <div>
            <strong>Dipping pool</strong>
            <span>Perfect for cooling off after beach days</span>
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

      {/* --- Story Teaser --- */}
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
              take a personal interest in every stay.
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
            
            </div>

            <Link className="text-link" to="/about">
              Our full story <Icon type="arrow" />
            </Link>
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

      {/* --- Rooms teaser --- */}
      <section className="spaces-section section reveal" id="spaces">
        <div className="section-head-row">
          <div className="section-head">
            <p className="eyebrow">Thoughtful multi-level design</p>
            <h2>Rooms & spaces made to gather.</h2>
          </div>
          <Link className="text-link" to="/amenities">
            All rooms & amenities <Icon type="arrow" />
          </Link>
        </div>

        <div className="spaces-preview">
          {spacesData.slice(0, 3).map((space) => (
            <article className="spaces-card-inner" key={space.title}>
              <div className="spaces-card-img-wrap">
                <img src={space.img} alt={space.title} loading="lazy" />
                <div className="spaces-card-img-overlay" />
              </div>
              <div className="spaces-card-body">
                <h3>{space.title}</h3>
                <p>{space.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* --- Gallery Teaser (4 photos) --- */}
      <section className="gallery section" id="gallery">
        <div className="section-head reveal">
          <p className="eyebrow">Explore every corner</p>
          <h2>Space to unwind on Tybee.</h2>
        </div>

        <div className="gallery-grid reveal">
          {photos.slice(0, 4).map((photo, i) => (
            <Link
              key={photo.src}
              className={`gallery-item item-${i + 1}`}
              to="/gallery"
              aria-label={`View gallery: ${photo.title}`}
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
            </Link>
          ))}

          {/* 5th tile with view-all overlay */}
          <Link
            className="gallery-item item-5"
            to="/gallery"
            aria-label="View all photos"
          >
            <img src={photos[4].src} alt={photos[4].title} loading="lazy" />
            <div className="gallery-caption">
              <span className="title">{photos[4].title}</span>
              <span className="index">
                05 / {String(photos.length).padStart(2, "0")}
              </span>
            </div>
          </Link>

          {/* 6th tile with view-all overlay */}
          <Link
            className="gallery-item item-6"
            to="/gallery"
            aria-label="View all photos"
          >
            <img src={photos[5].src} alt={photos[5].title} loading="lazy" />
            <div className="gallery-caption">
              <span className="title">{photos[5].title}</span>
              <span className="index">
                06 / {String(photos.length).padStart(2, "0")}
              </span>
            </div>
            <div className="gallery-viewall-overlay">
              <Link className="primary gallery-viewall-btn" to="/gallery">
                View all {photos.length} photos <Icon type="arrow" />
              </Link>
            </div>
          </Link>
        </div>

        {/* Mobile-only standalone button */}
        <div className="gallery-more-btn-wrap">
          <Link className="primary" to="/gallery" style={{ margin: "0 auto" }}>
            View all {photos.length} photos <Icon type="arrow" />
          </Link>
        </div>
      </section>

      {/* --- Video teaser --- */}
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
            Just flying around with my drone during my recent vacation to Tybee
            Island, Georgia. Awesome place!
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

      {/* --- Amenities teaser --- */}
      <section className="amenities section reveal" id="amenities">
        <div className="section-head-row">
          <div className="section-head">
            <p className="eyebrow">We are here for you!</p>
            <h2>Featured Amenities</h2>
          </div>
          <Link className="text-link" to="/amenities">
            See every amenity <Icon type="arrow" />
          </Link>
        </div>

        <div className="amenity-preview">
          {amenityColumns.map((column) => {
            const item = column.items[0];
            return (
              <article className="amenity-preview-card" key={column.label}>
                <Icon type={item.icon} />
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.desc}</span>
                </div>
              </article>
            );
          })}
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

      {/* --- Location teaser --- */}
      <section className="location section reveal" id="location">
        <div className="location-copy">
          <p className="eyebrow light">Tybee Island · South Beach</p>
          <h2>Where the river meets the ocean.</h2>
          <p>
            Casa Oceano Rio is in the exclusive South Beach area of Tybee, at{" "}
            <b>1811a Butler Ave</b>. Shops, restaurants, and nightclubs are
            within walking distance.
          </p>
          <div className="location-address">
            <Icon type="pin" />
            <div>
              <b>1811a Butler Ave, Tybee Island, Ga 31328</b>
            </div>
          </div>
          <Link className="text-link on-dark" to="/location">
            Area guide <Icon type="arrow" />
          </Link>
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
        </div>
      </section>

      {/* --- Booking calendar and inquiry form --- */}
      <Book />
    </>
  );
}
