import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  FaChartPie,
  FaEdit,
  FaBed,
  FaCalendarAlt,
  FaUserCircle,
  FaTags,
  FaUserPlus,
  FaSignOutAlt,
  FaHotel,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

// ---- Design tokens (matches Login.jsx / Register.jsx) ----
const COLORS = {
  ink: '#0D2B26',
  emerald: '#1F5D4F',
  emeraldDark: '#123028',
  emeraldSoft: 'rgba(31,93,79,0.08)',
  brass: '#C6A15B',
  ivory: '#FBF8F1',
  pageBg: '#F6F4EE',
  border: 'rgba(13,43,38,0.09)',
  muted: '#5B6763',
  rose: '#B3413B',
  roseSoft: '#FFF2F1',
  roseBorder: '#F3C9C6',
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

  .hb-dash * { box-sizing: border-box; }

  .hb-navlink:not(.hb-navlink-active):hover {
    background-color: rgba(13,43,38,0.05) !important;
    color: ${COLORS.ink} !important;
  }
  .hb-navlink:focus-visible {
    outline: 2px solid ${COLORS.emerald};
    outline-offset: -2px;
  }

  .hb-logout:hover {
    background-color: ${COLORS.rose} !important;
    border-color: ${COLORS.rose} !important;
    color: ${COLORS.ivory} !important;
  }
  .hb-logout:focus-visible {
    outline: 2px solid ${COLORS.emerald};
    outline-offset: 2px;
  }

  .hb-hamburger { display: none; }
  .hb-hamburger:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 2px; }

  @media (max-width: 900px) {
    .hb-topbar { display: flex !important; }
    .hb-hamburger { display: inline-flex !important; }
    .hb-close { display: inline-flex !important; }

    .hb-sidebar {
      position: fixed !important;
      top: 0; left: 0; bottom: 0;
      height: 100vh !important;
      transform: translateX(-100%);
      transition: transform 0.25s ease;
      z-index: 50;
      box-shadow: 8px 0 24px rgba(0,0,0,0.15);
    }
    .hb-sidebar.hb-open { transform: translateX(0); }

    .hb-main { padding: 24px 16px !important; }
    .hb-content { max-width: none !important; }
  }
`;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const userRole = localStorage.getItem('userRole') || 'Customer';

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      marginBottom: '4px',
      color: isActive ? COLORS.emerald : '#495057',
      backgroundColor: isActive ? COLORS.emeraldSoft : 'transparent',
      textDecoration: 'none',
      borderRadius: '8px',
      fontWeight: isActive ? 700 : 500,
      fontSize: '14.5px',
      fontFamily: "'Inter', sans-serif",
      transition: 'background-color 0.15s, color 0.15s',
      borderLeft: `4px solid ${isActive ? COLORS.emerald : 'transparent'}`,
    };
  };

  const navLinkClass = (path) =>
    `hb-navlink${location.pathname === path ? ' hb-navlink-active' : ''}`;

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="hb-dash" style={{ display: 'flex', minHeight: '100vh', backgroundColor: COLORS.pageBg, fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* MOBILE TOPBAR */}
      <div
        className="hb-topbar"
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: '60px',
          padding: '0 16px',
          backgroundColor: COLORS.ivory,
          borderBottom: `1px solid ${COLORS.border}`,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', backgroundColor: COLORS.emerald, borderRadius: '7px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: COLORS.ivory }}>
            <FaHotel size={15} />
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 700, color: COLORS.ink }}>HotelBook</span>
        </div>
        <button
          className="hb-hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.ink, padding: '6px', borderRadius: '6px' }}
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* BACKDROP (mobile only, shown while menu is open) */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(13,43,38,0.45)', zIndex: 45 }}
        />
      )}

      {/* SIDEBAR */}
      <nav
        className={`hb-sidebar${menuOpen ? ' hb-open' : ''}`}
        style={{
          width: '260px',
          backgroundColor: COLORS.ivory,
          borderRight: `1px solid ${COLORS.border}`,
          padding: '25px 20px',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxSizing: 'border-box',
        }}
      >
        {/* LOGO AREA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', paddingLeft: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '35px', height: '35px', backgroundColor: COLORS.emerald, borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: COLORS.ivory }}>
              <FaHotel size={18} />
            </div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', margin: 0, color: COLORS.ink, fontWeight: 700, letterSpacing: '-0.3px' }}>
              HotelBook
            </h1>
          </div>
          <button
            className="hb-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.muted, padding: '4px' }}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* MENU LINKS */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '11px', color: '#adb5bd', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '5px' }}>Main Menu</div>
          <Link to="/" onClick={() => setMenuOpen(false)} className={navLinkClass('/')} style={getLinkStyle('/')} aria-current={location.pathname === '/' ? 'page' : undefined}>
            <FaChartPie size={18} /> Overview
          </Link>
          <Link to="/book-room" onClick={() => setMenuOpen(false)} className={navLinkClass('/book-room')} style={getLinkStyle('/book-room')} aria-current={location.pathname === '/book-room' ? 'page' : undefined}>
            <FaEdit size={18} /> Book a Room
          </Link>
          <Link to="/rooms" onClick={() => setMenuOpen(false)} className={navLinkClass('/rooms')} style={getLinkStyle('/rooms')} aria-current={location.pathname === '/rooms' ? 'page' : undefined}>
            <FaBed size={18} /> Manage Rooms
          </Link>
          <Link to="/reservations" onClick={() => setMenuOpen(false)} className={navLinkClass('/reservations')} style={getLinkStyle('/reservations')} aria-current={location.pathname === '/reservations' ? 'page' : undefined}>
            <FaCalendarAlt size={18} /> Reservations
          </Link>
          <Link to="/profile" onClick={() => setMenuOpen(false)} className={navLinkClass('/profile')} style={getLinkStyle('/profile')} aria-current={location.pathname === '/profile' ? 'page' : undefined}>
            <FaUserCircle size={18} /> My Profile
          </Link>

          {/* ADMIN TOOLS */}
          {userRole === 'Admin' && (
            <>
              <div style={{ fontSize: '11px', color: '#adb5bd', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: '30px 0 10px 0', paddingLeft: '5px' }}>Administration</div>
              <Link to="/prices" onClick={() => setMenuOpen(false)} className={navLinkClass('/prices')} style={getLinkStyle('/prices')} aria-current={location.pathname === '/prices' ? 'page' : undefined}>
                <FaTags size={18} /> Manage Prices
              </Link>
              <Link to="/staff" onClick={() => setMenuOpen(false)} className={navLinkClass('/staff')} style={getLinkStyle('/staff')} aria-current={location.pathname === '/staff' ? 'page' : undefined}>
                <FaUserPlus size={18} /> Register Staff
              </Link>
            </>
          )}
        </div>

        {/* BOTTOM ACTION AREA */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: `1px solid ${COLORS.border}` }}>
          <button
            onClick={handleLogout}
            className="hb-logout"
            style={{
              width: '100%', padding: '14px', backgroundColor: COLORS.roseSoft, color: COLORS.rose,
              border: `1px solid ${COLORS.roseBorder}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px',
              fontFamily: "'Inter', sans-serif", transition: 'all 0.2s ease',
            }}
          >
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="hb-main" style={{ flex: 1, padding: '40px', overflowX: 'hidden' }}>
        <div className="hb-content" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}