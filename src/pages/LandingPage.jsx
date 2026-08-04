import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBed, FaBars, FaTimes, FaUsers } from 'react-icons/fa';

// ---- Design tokens (extends Login/Register boutique key-tag identity) ----
const COLORS = {
  ink: '#0D2B26',
  emerald: '#1F5D4F',
  emeraldDark: '#123028',
  emeraldSoft: '#E5EFEA',
  brass: '#C6A15B',
  brassLight: '#E4CD98',
  brassSoft: '#F7EFDD',
  ivory: '#FBF8F1',
  sand: '#EFE6D0',
  border: '#eeece4',
  muted: 'rgba(13,43,38,0.55)',
  amber: '#B78103',
  amberSoft: '#FFF3CD',
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

  .hb-land * { box-sizing: border-box; }

  .hb-tag {
    animation: hb-sway 6s ease-in-out infinite;
    transform-origin: top center;
  }
  .hb-tag-slow {
    animation: hb-sway 7.5s ease-in-out infinite;
    animation-delay: -1.5s;
    transform-origin: top center;
  }
  @keyframes hb-sway {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .hb-tag, .hb-tag-slow { animation: none; }
  }

  .hb-navlink { position: relative; }
  .hb-navlink::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: -4px; height: 2px;
    background: ${COLORS.brass}; transform: scaleX(0); transition: transform 0.15s ease;
  }
  .hb-navlink:hover::after { transform: scaleX(1); }
  .hb-navlink:focus-visible, .hb-link:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 3px; border-radius: 3px; }

  .hb-btn-primary { transition: background-color 0.15s, transform 0.15s, box-shadow 0.15s; }
  .hb-btn-primary:hover { background-color: ${COLORS.emeraldDark} !important; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(13,43,38,0.22); }
  .hb-btn-primary:focus-visible { outline: 2px solid ${COLORS.ivory}; outline-offset: 2px; }

  .hb-btn-ghost { transition: background-color 0.15s, transform 0.15s; }
  .hb-btn-ghost:hover { background-color: rgba(251,248,241,0.12) !important; transform: translateY(-1px); }
  .hb-btn-ghost:focus-visible { outline: 2px solid ${COLORS.ivory}; outline-offset: 2px; }

  .hb-search-btn { transition: filter 0.15s, transform 0.15s; }
  .hb-search-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }

  .hb-room-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .hb-room-card:hover { transform: translateY(-4px); box-shadow: 0 14px 30px rgba(13,43,38,0.1); }
  .hb-room-btn:hover { filter: brightness(1.08); }

  .hb-testi-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .hb-testi-card:hover { transform: translateY(-3px); box-shadow: 0 12px 26px rgba(13,43,38,0.08); }

  .hb-footer-link:hover { color: ${COLORS.brassLight} !important; }
  .hb-footer-link:focus-visible { outline: 2px solid ${COLORS.brassLight}; outline-offset: 2px; }

  .hb-mobile-toggle:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 2px; }

  @media (max-width: 860px) {
    .hb-desktop-nav { display: none !important; }
    .hb-mobile-toggle { display: inline-flex !important; }
    .hb-hero-grid { grid-template-columns: 1fr !important; text-align: center; }
    .hb-hero-visual { margin: 0 auto; }
    .hb-hero-copy { align-items: center !important; }
    .hb-search-card { flex-direction: column !important; }
    .hb-search-field { width: 100% !important; }
  }
`;

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m20.59 13.41-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
      <circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function CompassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="m14.5 9.5-2 5-3-3 5-2Z" />
    </svg>
  );
}
function QuoteMark() {
  return (
    <svg width="30" height="24" viewBox="0 0 40 32" fill="none">
      <path d="M0 32V19.2C0 8.533 6.4 1.6 17.067 0l2.4 4.8C12.267 6.4 8 10.667 8 17.067h9.067V32H0Zm22.933 0V19.2c0-10.667 6.4-17.6 17.067-19.2L42.4 4.8C35.2 6.4 30.933 10.667 30.933 17.067H40V32H22.933Z" fill="currentColor" />
    </svg>
  );
}

const FEATURES = [
  { icon: CompassIcon, title: 'Curated boutique stays', text: 'Every property is hand-picked for character, comfort, and a sense of place.' },
  { icon: TagIcon, title: 'Best rate guarantee', text: 'Book directly with us and never pay more than the room is worth.' },
  { icon: ClockIcon, title: '24/7 concierge', text: 'Real people, day or night, for anything from late check-in to local tips.' },
  { icon: ShieldIcon, title: 'Secure booking', text: 'Your details and payments are protected at every step of the stay.' },
];

const FALLBACK_ROOMS = [
  { id: 'sample-1', name: 'Garden Suite', capacity: 2, basePrice: 3200 },
  { id: 'sample-2', name: 'Emerald Loft', capacity: 3, basePrice: 4500 },
  { id: 'sample-3', name: 'The Brass Room', capacity: 4, basePrice: 5800 },
];

const TESTIMONIALS = [
  { quote: 'It felt less like a hotel and more like someone had handed me the keys to their favourite room.', name: 'Marisol A.', place: 'Cebu, PH' },
  { quote: 'Booking took two minutes and the concierge remembered my name at check-in. Small hotel, big attention.', name: 'Devon R.', place: 'Singapore' },
  { quote: 'The rate guarantee was real — found the same room cheaper here than anywhere else I checked.', name: 'Priya K.', place: 'Manila, PH' },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rooms, setRooms] = useState(FALLBACK_ROOMS);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!apiUrl) return;
    axios.get(`${apiUrl}/api/RoomTypes`)
      .then(res => {
        const data = res.data.$values || res.data;
        if (Array.isArray(data) && data.length > 0) setRooms(data.slice(0, 3));
      })
      .catch(() => { /* keep fallback sample rooms */ });
  }, []);

  return (
    <div className="hb-land" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.ink, backgroundColor: COLORS.ivory }}>
      <style>{globalStyles}</style>

      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: COLORS.ivory, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: COLORS.emerald, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.ivory, fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '14px' }}>HB</div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '19px', fontWeight: 700, color: COLORS.ink }}>HotelBook</span>
          </div>

          <nav className="hb-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '34px' }}>
            <a href="#rooms" className="hb-navlink" style={{ color: COLORS.ink, textDecoration: 'none', fontSize: '14.5px', fontWeight: 600 }}>Rooms</a>
            <a href="#why" className="hb-navlink" style={{ color: COLORS.ink, textDecoration: 'none', fontSize: '14.5px', fontWeight: 600 }}>Why HotelBook</a>
            <a href="#stories" className="hb-navlink" style={{ color: COLORS.ink, textDecoration: 'none', fontSize: '14.5px', fontWeight: 600 }}>Guest Stories</a>
          </nav>

          <div className="hb-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <Link to="/login" className="hb-link" style={{ color: COLORS.ink, textDecoration: 'none', fontSize: '14.5px', fontWeight: 600 }}>Sign in</Link>
            <Link to="/register" style={{ padding: '10px 20px', backgroundColor: COLORS.emerald, color: COLORS.ivory, borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
              Get Your Key
            </Link>
          </div>

          <button
            className="hb-mobile-toggle"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.ink, padding: '6px' }}
          >
            {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <a href="#rooms" onClick={() => setMobileOpen(false)} style={{ color: COLORS.ink, textDecoration: 'none', fontWeight: 600 }}>Rooms</a>
            <a href="#why" onClick={() => setMobileOpen(false)} style={{ color: COLORS.ink, textDecoration: 'none', fontWeight: 600 }}>Why HotelBook</a>
            <a href="#stories" onClick={() => setMobileOpen(false)} style={{ color: COLORS.ink, textDecoration: 'none', fontWeight: 600 }}>Guest Stories</a>
            <Link to="/login" style={{ color: COLORS.ink, textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
            <Link to="/register" style={{ padding: '12px', backgroundColor: COLORS.emerald, color: COLORS.ivory, borderRadius: '8px', textDecoration: 'none', fontWeight: 700, textAlign: 'center' }}>
              Get Your Key
            </Link>
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(251,248,241,0.09) 1px, transparent 0), linear-gradient(160deg, ${COLORS.emerald} 0%, ${COLORS.emeraldDark} 100%)`,
          backgroundSize: '24px 24px, cover',
          color: COLORS.ivory,
          paddingTop: '76px',
          paddingBottom: '150px',
        }}
      >
        <div className="hb-hero-grid" style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '40px', alignItems: 'center' }}>

          <div className="hb-hero-copy" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.brassLight, fontWeight: 700, marginBottom: '18px' }}>
              Boutique stays, worldwide
            </span>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 600, lineHeight: 1.08, margin: '0 0 20px 0' }}>
              Every stay should<br />feel like your own key.
            </h1>
            <p style={{ fontSize: '17px', lineHeight: 1.65, opacity: 0.85, maxWidth: '440px', margin: '0 0 32px 0' }}>
              HotelBook gathers independent, character-filled hotels and hands you a single, simple way to book them — no crowds, no chains, no guesswork.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/register" className="hb-btn-primary" style={{ padding: '15px 26px', backgroundColor: COLORS.emerald, color: COLORS.ivory, borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', border: `1px solid rgba(251,248,241,0.18)` }}>
                Create free account
              </Link>
              <a href="#rooms" className="hb-btn-ghost" style={{ padding: '15px 26px', backgroundColor: 'transparent', color: COLORS.ivory, borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', border: '1px solid rgba(251,248,241,0.35)' }}>
                Browse rooms
              </a>
            </div>
          </div>

          {/* KEY TAG RACK — signature visual */}
          <div className="hb-hero-visual" style={{ position: 'relative', height: '300px', width: '280px' }}>
            <div aria-hidden="true" className="hb-tag-slow" style={{
              position: 'absolute', left: '4px', top: '46px', width: '92px', height: '128px',
              backgroundColor: COLORS.brassLight, opacity: 0.32, borderRadius: '10px', transform: 'rotate(-11deg)',
            }} />
            <div aria-hidden="true" style={{
              position: 'absolute', right: '10px', top: '10px', width: '80px', height: '112px',
              backgroundColor: COLORS.ivory, opacity: 0.15, borderRadius: '10px', transform: 'rotate(9deg)',
            }} />
            <div aria-hidden="true" className="hb-tag" style={{
              position: 'absolute', left: '78px', top: '0px', width: '112px', height: '156px',
              backgroundColor: COLORS.brass, borderRadius: '12px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 34px rgba(0,0,0,0.3)',
            }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: COLORS.emeraldDark, marginBottom: '12px' }} />
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: '30px', fontWeight: 600, color: COLORS.emeraldDark }}>HB</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px', letterSpacing: '0.08em', color: COLORS.emeraldDark, opacity: 0.7, marginTop: '10px' }}>ROOM 214</span>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING SEARCH CARD */}
      <div style={{ maxWidth: '1180px', margin: '-92px auto 0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div className="hb-search-card" style={{
          display: 'flex', gap: '16px', backgroundColor: COLORS.ivory, borderRadius: '18px',
          border: `1px solid ${COLORS.border}`, boxShadow: '0 26px 60px rgba(13,43,38,0.16)',
          padding: '26px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: COLORS.brass }} />

          <div className="hb-search-field" style={{ flex: 1 }}>
            <label style={searchLabelStyle}>Check-in</label>
            <input type="date" style={searchInputStyle} />
          </div>
          <div className="hb-search-field" style={{ flex: 1 }}>
            <label style={searchLabelStyle}>Check-out</label>
            <input type="date" style={searchInputStyle} />
          </div>
          <div className="hb-search-field" style={{ flex: 1 }}>
            <label style={searchLabelStyle}>Guests</label>
            <select style={searchInputStyle} defaultValue="2">
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4+ Guests</option>
            </select>
          </div>
          <div className="hb-search-field" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => navigate('/register')}
              className="hb-search-btn"
              style={{ padding: '14px 28px', backgroundColor: COLORS.emerald, color: COLORS.ivory, border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14.5px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}
            >
              Check Availability
            </button>
          </div>
        </div>
      </div>

      {/* FEATURE STRIP */}
      <section id="why" style={{ maxWidth: '1180px', margin: '0 auto', padding: '110px 24px 80px 24px' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto 50px auto', textAlign: 'center' }}>
          <span style={{ fontSize: '12.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.emerald, fontWeight: 700 }}>Why HotelBook</span>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: 600, color: COLORS.ink, margin: '10px 0 0 0' }}>
            Booked simply. Stayed well.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px' }}>
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} style={{ padding: '30px 26px', backgroundColor: 'white', borderRadius: '14px', border: `1px solid ${COLORS.border}` }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: COLORS.emeraldSoft, color: COLORS.emerald, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Icon />
              </div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 600, color: COLORS.ink, margin: '0 0 8px 0' }}>{title}</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: COLORS.muted, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED ROOMS */}
      <section id="rooms" style={{ backgroundColor: COLORS.sand, padding: '80px 24px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
            <div>
              <span style={{ fontSize: '12.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.emerald, fontWeight: 700 }}>Explore</span>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: 600, color: COLORS.ink, margin: '10px 0 0 0' }}>
                A few rooms worth waking up in
              </h2>
            </div>
            <Link to="/register" className="hb-link" style={{ color: COLORS.emerald, fontWeight: 700, textDecoration: 'none', fontSize: '14.5px' }}>
              View all rooms →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {rooms.map(room => (
              <div key={room.id} className="hb-room-card" style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 15px rgba(13,43,38,0.05)' }}>
                <div style={{ height: '130px', background: `linear-gradient(135deg, ${COLORS.emeraldSoft}, ${COLORS.brassSoft})`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: COLORS.emerald }}>
                  <FaBed size={38} />
                </div>
                <div style={{ padding: '22px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: COLORS.ink, fontSize: '18px', fontFamily: "'Fraunces', serif", fontWeight: 700 }}>{room.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', marginBottom: '18px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: COLORS.muted }}><FaUsers size={12} /> {room.capacity} Pax</span>
                    <span style={{ color: COLORS.emerald, fontWeight: 700 }}>₱{room.basePrice} /night</span>
                  </div>
                  <button
                    onClick={() => navigate('/register')}
                    className="hb-room-btn"
                    style={{ width: '100%', padding: '12px', backgroundColor: COLORS.emerald, color: COLORS.ivory, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: "'Inter', sans-serif" }}
                  >
                    Reserve This Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GUEST STORIES */}
      <section id="stories" style={{ maxWidth: '1180px', margin: '0 auto', padding: '90px 24px' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto 50px auto', textAlign: 'center' }}>
          <span style={{ fontSize: '12.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.emerald, fontWeight: 700 }}>Guest Stories</span>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: 600, color: COLORS.ink, margin: '10px 0 0 0' }}>
            What it feels like to stay
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="hb-testi-card" style={{ backgroundColor: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '16px', padding: '28px' }}>
              <div style={{ color: COLORS.brass, marginBottom: '14px' }}><QuoteMark /></div>
              <p style={{ fontFamily: "'Fraunces', serif", fontSize: '16.5px', fontStyle: 'italic', lineHeight: 1.6, color: COLORS.ink, margin: '0 0 20px 0' }}>
                {t.quote}
              </p>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: COLORS.ink }}>{t.name}</div>
              <div style={{ fontSize: '12.5px', color: COLORS.muted }}>{t.place}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ backgroundColor: COLORS.emeraldDark, padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: 600, color: COLORS.ivory, margin: '0 0 14px 0' }}>
          Ready to find your key?
        </h2>
        <p style={{ color: 'rgba(251,248,241,0.75)', fontSize: '16px', margin: '0 0 30px 0' }}>
          Create a free account and start saving stays in under a minute.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="hb-btn-primary" style={{ padding: '15px 28px', backgroundColor: COLORS.emerald, color: COLORS.ivory, borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', border: '1px solid rgba(251,248,241,0.18)' }}>
            Create free account
          </Link>
          <Link to="/login" className="hb-btn-ghost" style={{ padding: '15px 28px', backgroundColor: 'transparent', color: COLORS.ivory, borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', border: '1px solid rgba(251,248,241,0.35)' }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: COLORS.ink, color: 'rgba(251,248,241,0.65)', padding: '56px 24px 28px 24px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', paddingBottom: '36px', borderBottom: '1px solid rgba(251,248,241,0.12)' }}>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '30px', height: '30px', backgroundColor: COLORS.brass, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.emeraldDark, fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '13px' }}>HB</div>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 700, color: COLORS.ivory }}>HotelBook</span>
              </div>
              <p style={{ fontSize: '13.5px', lineHeight: 1.6, maxWidth: '220px', margin: 0 }}>
                Independent, character-filled hotels — booked the simple way.
              </p>
            </div>

            <div>
              <div style={footerHeadingStyle}>Explore</div>
              <a href="#rooms" className="hb-footer-link" style={footerLinkStyle}>Rooms</a>
              <a href="#why" className="hb-footer-link" style={footerLinkStyle}>Why HotelBook</a>
              <a href="#stories" className="hb-footer-link" style={footerLinkStyle}>Guest Stories</a>
            </div>

            <div>
              <div style={footerHeadingStyle}>Account</div>
              <Link to="/login" className="hb-footer-link" style={footerLinkStyle}>Sign in</Link>
              <Link to="/register" className="hb-footer-link" style={footerLinkStyle}>Create account</Link>
            </div>

            <div>
              <div style={footerHeadingStyle}>Contact</div>
              <span style={{ ...footerLinkStyle, cursor: 'default' }}>hello@hotelbook.com</span>
              <span style={{ ...footerLinkStyle, cursor: 'default' }}>+63 900 000 0000</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '24px', fontSize: '12.5px' }}>
            <span>© {new Date().getFullYear()} HotelBook. All rights reserved.</span>
            <span>Made for travelers who like their own key.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Reusable Inline Styles ---
const searchLabelStyle = {
  display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: COLORS.ink,
  textTransform: 'uppercase', letterSpacing: '0.04em',
};

const searchInputStyle = {
  width: '100%', padding: '11px 12px', borderRadius: '8px', border: `1.5px solid ${COLORS.border}`,
  fontSize: '14px', fontFamily: "'Inter', sans-serif", backgroundColor: COLORS.ivory, color: COLORS.ink,
  boxSizing: 'border-box', outline: 'none',
};

const footerHeadingStyle = {
  fontSize: '12.5px', fontWeight: 700, color: COLORS.ivory, textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: '14px',
};

const footerLinkStyle = {
  display: 'block', color: 'rgba(251,248,241,0.65)', textDecoration: 'none', fontSize: '14px',
  marginBottom: '10px', transition: 'color 0.15s',
};