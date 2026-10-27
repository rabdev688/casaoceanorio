import { Icon } from "@/components/icon";
import { useReveal } from "@/lib/useReveal";

export function Location() {
  useReveal();

  return (
    <>
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
            <li>3 minute walk to Tybee Island Beach</li>
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
    </>
  );
}
