import { useEffect, useState } from 'react'

const photos = [
  'https://images.unsplash.com/photo-1790276319738-f7b19d7f7e8c?auto=format&fit=crop&w=1800&q=85',
  'https://images.unsplash.com/photo-1790276319577-6fd4992ada4f?auto=format&fit=crop&w=1200&q=82',
  'https://images.unsplash.com/photo-1790276317950-cd0cad99655d?auto=format&fit=crop&w=1200&q=82',
  'https://images.unsplash.com/photo-1790276319469-e495208bfd45?auto=format&fit=crop&w=1200&q=82',
  'https://images.unsplash.com/photo-1790276319296-1a47fce989ff?auto=format&fit=crop&w=1200&q=82',
]

const Icon = ({ type }: { type: 'wave' | 'bed' | 'pool' | 'view' | 'menu' | 'close' | 'arrow' | 'pin' }) => {
  const paths = {
    wave: <path d="M2 13c3-4 6 4 10 0s7 4 10 0M2 8c3-4 6 4 10 0s7 4 10 0" />,
    bed: <path d="M3 18v-8m18 8v-6H3v6m3-6V7h7a4 4 0 0 1 4 4v1" />,
    pool: <path d="M2 15c3-3 5 3 8 0s5 3 8 0 4 0 4 0M2 19c3-3 5 3 8 0s5 3 8 0 4 0 4 0M7 14V5a2 2 0 0 1 4 0m0 4h6" />,
    view: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2" /></>,
  }
  return <svg aria-hidden="true" className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">{paths[type]}</svg>
}

function BookingBar({ mobile = false }: { mobile?: boolean }) {
  const [guests, setGuests] = useState(2)
  return (
    <div className={mobile ? 'booking booking-mobile' : 'booking'}>
      <label><span>Check-in</span><input aria-label="Check-in" type="date" defaultValue="2025-12-12" /></label>
      <label><span>Check-out</span><input aria-label="Check-out" type="date" defaultValue="2025-12-17" /></label>
      <label><span>Guests</span><select aria-label="Guests" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>{[1,2,3,4,5,6,7,8].map(n => <option key={n}>{n}</option>)}</select></label>
      <button className="primary">Check availability <Icon type="arrow" /></button>
    </div>
  )
}

const blocked = [3, 4, 10, 11, 18, 19, 20, 27]
const prices = [520, 520, 560, 560, 580, 580, 540, 520, 520, 560, 560, 580, 580, 540, 520, 520, 560, 560, 580, 580, 540, 520, 520, 560, 560, 580, 580, 540, 520, 520, 560]

function App() {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [review, setReview] = useState(0)
  const [sheet, setSheet] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('visible')), { threshold: .12 })
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const reviews = [
    ['“The kind of place that resets your sense of time. Mornings in the pool, afternoons on the sand, and every sunset felt cinematic.”', 'Marina & Lucas', 'São Paulo'],
    ['“Beautifully considered, incredibly private, and even better than the photographs. We extended our stay before the first night was over.”', 'Sophie R.', 'London'],
    ['“The ocean is the soundtrack here. The house is warm, elegant and effortless — a true Rio escape.”', 'Andre M.', 'New York'],
  ]

  return (
    <main>
      <header className="nav">
        <a className="brand" href="#top"><span>CASA</span> OCEANO <em>RIO</em></a>
        <nav><a href="#story">The casa</a><a href="#gallery">Gallery</a><a href="#stay">Your stay</a></nav>
        <a className="nav-cta" href="#booking">Book your stay</a>
      </header>

      <div className="hero-wrap">
        <section className="hero" id="top">
          <div className="hero-bg" />
          <div className="hero-copy">
            <p className="eyebrow light">Joá · Rio de Janeiro</p>
            <h1>Where the ocean<br /><i>comes home.</i></h1>
            <p className="intro">A private beachfront retreat made for slow mornings, salt air and unforgettable stays.</p>
          </div>
          <div className="scroll-note"><span /> Scroll to feel the casa</div>
        </section>
        <BookingBar />
      </div>

      <section className="highlights reveal">
        {[['wave','Beachfront','Private ocean access'],['bed','Sleeps 8','Four ensuite bedrooms'],['pool','Infinity pool','Heated year-round'],['view','Endless views','Atlantic panoramas']].map(([icon,title,desc]) => (
          <article key={title}><Icon type={icon as 'wave'} /><div><strong>{title}</strong><span>{desc}</span></div></article>
        ))}
      </section>

      <section className="story section reveal" id="story">
        <div className="section-head">
          <p className="eyebrow">The spirit of Casa Oceano</p>
          <h2>Made for the rhythm<br />of <i>Rio.</i></h2>
        </div>
        <div className="story-layout">
          <div className="story-copy">
            <p className="lead">Perched where the rainforest meets the Atlantic, Casa Oceano is a sun-soaked sanctuary with the city’s most spectacular view.</p>
            <p>Wake to the sound of waves. Drift from breakfast on the terrace to a swim above the sea. Here, indoor and outdoor living blur into one generous, unhurried day.</p>
            <a className="text-link" href="#gallery">Discover the casa <Icon type="arrow" /></a>
          </div>
          <div className="overlap">
            <img className="main-photo" src={photos[1]} alt="Infinity pool overlooking the ocean" />
            <img className="float-photo" src={photos[2]} alt="Open living space facing the sea" />
            <span className="stamp">23° S<br />RIO</span>
          </div>
        </div>
      </section>

      <section className="gallery section" id="gallery">
        <div className="section-head reveal"><p className="eyebrow">A glimpse inside</p><h2>Space to <i>breathe.</i></h2></div>
        <div className="gallery-grid reveal">
          {photos.slice(0,5).map((src, i) => <button key={src} className={`gallery-item item-${i+1}`} onClick={() => setLightbox(i)}><img src={src} alt={['Oceanfront terrace','Pool above the sea','Living room with a view','Dining room in the trees','Beachfront exterior'][i]} loading={i > 1 ? 'lazy' : 'eager'} /><span>0{i+1}</span></button>)}
        </div>
      </section>

      <section className="location section reveal">
        <div className="location-copy"><p className="eyebrow light">Between forest & sea</p><h2>Your own side<br />of <i>Rio.</i></h2><p>Hidden in Joá, Casa Oceano feels worlds away while remaining close to Rio’s best beaches, restaurants and energy.</p><ul><li>São Conrado Beach <b>8 min</b></li><li>Leblon & Ipanema <b>20 min</b></li><li>Christ the Redeemer <b>35 min</b></li></ul></div>
        <div className="map-card">
          <div className="map-lines" />
          <span className="map-label rio">RIO DE JANEIRO</span><span className="map-label joa"><Icon type="pin" /> Casa Oceano<br /><small>Joá</small></span>
          <span className="map-label ocean">ATLANTIC OCEAN</span>
        </div>
      </section>

      <section className="amenities section reveal" id="stay">
        <div className="section-head"><p className="eyebrow">Everything you need</p><h2>Effortless <i>days.</i></h2></div>
        <div className="amenity-grid">
          {['Infinity pool','Private beach access','Daily housekeeping','Private chef on request','High-speed Wi-Fi','Air-conditioned suites','Outdoor barbecue','Airport transfer'].map((x,i) => <div key={x}><span>0{i+1}</span><strong>{x}</strong></div>)}
        </div>
      </section>

      <section className="reviews section reveal">
        <p className="eyebrow light">Notes from our guests</p>
        <div className="review-stars">★★★★★</div>
        <blockquote>{reviews[review][0]}</blockquote>
        <p><strong>{reviews[review][1]}</strong> · {reviews[review][2]}</p>
        <div className="review-nav">{reviews.map((_,i) => <button aria-label={`Review ${i+1}`} className={i === review ? 'active' : ''} onClick={() => setReview(i)} key={i} />)}</div>
      </section>

      <section className="calendar-section section reveal" id="booking">
        <div className="calendar-intro"><p className="eyebrow">Plan your escape</p><h2>December<br /><i>2025</i></h2><p>Choose your dates to see your exact stay total. A 3-night minimum applies.</p><div className="legend"><span><i className="available" /> Available</span><span><i className="unavailable" /> Unavailable</span></div></div>
        <div className="calendar">
          <div className="week">{['SUN','MON','TUE','WED','THU','FRI','SAT'].map(x => <span key={x}>{x}</span>)}</div>
          <div className="days">{Array.from({length:35},(_,i) => i < 1 || i > 31 ? <span key={i} /> : <button className={blocked.includes(i) ? 'blocked' : ''} disabled={blocked.includes(i)} key={i}><b>{i}</b><small>{blocked.includes(i) ? '—' : `$${prices[i-1]}`}</small></button>)}</div>
        </div>
      </section>

      <footer>
        <div className="footer-top"><div><p className="eyebrow light">The ocean is waiting</p><h2>See you in <i>Rio.</i></h2></div><a className="footer-book" href="#booking">Book your stay <Icon type="arrow" /></a></div>
        <div className="footer-bottom"><a className="brand" href="#top"><span>CASA</span> OCEANO <em>RIO</em></a><div><a href="mailto:hello@casaoceanorio.com">hello@casaoceanorio.com</a><a href="#">Instagram</a><a href="#">WhatsApp</a></div><small>© 2025 Casa Oceano Rio</small></div>
      </footer>

      <button className="mobile-book" onClick={() => setSheet(true)}>Check dates <span>from $520 / night</span></button>
      {sheet && <div className="sheet-wrap" onClick={() => setSheet(false)}><div className="sheet" onClick={e => e.stopPropagation()}><button className="sheet-close" onClick={() => setSheet(false)}><Icon type="close" /></button><p className="eyebrow">Book Casa Oceano</p><h2>Your stay in Rio</h2><BookingBar mobile /></div></div>}
      {lightbox !== null && <div className="lightbox" onClick={() => setLightbox(null)}><button aria-label="Close"><Icon type="close" /></button><img src={photos[lightbox]} alt="Casa Oceano gallery" /></div>}
    </main>
  )
}

export default App
