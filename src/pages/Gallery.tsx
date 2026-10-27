import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/icon";
import { photos } from "@/data/photos";
import { useReveal } from "@/lib/useReveal";

export function Gallery() {
  useReveal();

  const [lightbox, setLightbox] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightbox === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
      } else if (e.key === "ArrowRight") {
        setLightbox((prev) =>
          prev !== null ? (prev + 1) % photos.length : 0,
        );
      } else if (e.key === "ArrowLeft") {
        setLightbox((prev) =>
          prev !== null ? (prev - 1 + photos.length) % photos.length : 0,
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox]);

  return (
    <>
      {/* --- Full Photo Gallery --- */}
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

          {/* 6th tile with view-all overlay */}
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

        {/* Mobile-only standalone button */}
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

      {/* --- YouTube Video Tour --- */}
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

      {/* --- Lightbox Modal --- */}
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
    </>
  );
}
