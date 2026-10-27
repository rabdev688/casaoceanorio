import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/icon";
import { spacesData } from "@/data/spaces";
import { amenityColumns, amenityRowCount } from "@/data/amenities";
import { useReveal } from "@/lib/useReveal";

export function Amenities() {
  useReveal();

  // Spaces Carousel state
  const [spacesIdx, setSpacesIdx] = useState(0);
  const [spacesPerView, setSpacesPerView] = useState(3);
  const spacesAutoPlay = useRef(true);
  const spacesTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const spacesTouchStartX = useRef<number | null>(null);

  // Responsive per-view & auto-play
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

  return (
    <>
      {/* --- Rooms & Spaces Carousel --- */}
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

          {/* Controls: prev — dots — next */}
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

      {/* --- Amenities Board --- */}
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
    </>
  );
}
