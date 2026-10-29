import { Link } from "react-router-dom";
import { Icon } from "@/components/icon";
import { photos } from "@/data/photos";
import { useReveal } from "@/lib/useReveal";

export function About() {
  useReveal();

  return (
    <>
      {/* --- Story Section: Willie & Shelly's Tybee Legacy --- */}
      <section className="story section reveal" id="story">
        <div className="story-layout">
          <div className="story-copy">
            <div className="section-head">
              <p className="eyebrow">Where the river meets the ocean</p>
              <h2>Welcoming guests since 2010.</h2>
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
              Willie and Shelly were married in 1993 and raised their two boys
              on Tybee Island. After the kids went off to college, they moved to
              a home in Savannah's Historic District. In 2010 the residence
              became Casa Oceano Rio. Willie and Shelly still manage it
              themselves.
            </p>

            <div className="stats-grid">
              <div className="stat-item">
                <b>200+</b>
                <span>Five-star reviews</span>
              </div>
              <div className="stat-item">
                <b>9.8</b>
                <span>Vrbo guest score</span>
              </div>
            </div>

            <Link className="text-link" to="/book">
              Inquire directly with Willie & Shelly <Icon type="arrow" />
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
              src="/gallery/willie-shelly.webp"
              alt="Willie and Shelly, owners of Casa Oceano Rio"
            />
          </div>
        </div>
      </section>
    </>
  );
}
