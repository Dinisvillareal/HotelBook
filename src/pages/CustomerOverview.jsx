import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaBed, FaArrowRight, FaConciergeBell, FaUsers, FaHeart, FaRegHeart } from 'react-icons/fa';

// ---- Design tokens (matches Login/Register/AdminLayout/Overview/ManageReservations) ----
const COLORS = {
  ink: '#0D2B26',
  emerald: '#1F5D4F',
  emeraldDark: '#123028',
  emeraldSoft: '#E5EFEA',
  brass: '#C6A15B',
  brassSoft: '#F7EFDD',
  ivory: '#FBF8F1',
  pageBg: '#F6F4EE',
  border: '#eeece4',
  muted: '#8a8f89',
  text: '#495057',
  rose: '#B3413B',
  roseSoft: '#FDEEED',
  amber: '#B78103',
  amberSoft: '#FFF3CD',
  sky: '#3E6FB0',
  skySoft: '#E3ECF8',
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
  .hb-cust-overview * { box-sizing: border-box; }
  .hb-quick-btn { transition: background-color 0.15s, transform 0.15s, box-shadow 0.15s; }
  .hb-quick-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(13,43,38,0.08); }
  .hb-quick-btn:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 2px; }
  .hb-room-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .hb-room-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(13,43,38,0.1); }
  .hb-room-btn:hover { filter: brightness(1.08); }
  .hb-cta-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .hb-cta-btn { transition: filter 0.15s, transform 0.15s; }
  .hb-detail-link:hover { background-color: ${COLORS.emeraldSoft} !important; color: ${COLORS.emeraldDark} !important; }
`;

const formatBeautifulDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function CustomerOverview() {
  const [userData, setUserData] = useState({ fullName: 'Guest' });
  const [upcomingStay, setUpcomingStay] = useState(null);
  const [totalBookings, setTotalBookings] = useState(0);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userRes, bookingsRes, roomsRes, favsRes] = await Promise.all([
          axios.get(`${apiUrl}/api/Auth/me`, authConfig).catch(() => ({ data: { fullName: 'Guest' } })),
          axios.get(`${apiUrl}/api/Reservations/my-reservations`, authConfig).catch(() => ({ data: [] })),
          axios.get(`${apiUrl}/api/RoomTypes`).catch(() => ({ data: [] })),
          axios.get(`${apiUrl}/api/Favorites`, authConfig).catch(() => ({ data: [] })),
        ]);

        setUserData(userRes.data);
        setFavorites(favsRes.data);

        const myBookings = bookingsRes.data.$values || bookingsRes.data || [];
        const types = roomsRes.data.$values || roomsRes.data || [];

        setTotalBookings(myBookings.length);
        setRoomTypes(types);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const futureStays = myBookings
          .filter(b => b.status === 'Confirmed' && new Date(b.checkInDate) >= today)
          .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));

        if (futureStays.length > 0) {
          setUpcomingStay(futureStays[0]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
const toggleFavorite = async (roomId) => {
    try {
      await axios.post(`${apiUrl}/api/Favorites/${roomId}/toggle`, {}, authConfig);
      // Instantly update the UI so the heart fills in or empties
      setFavorites(prev => 
        prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
      );
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };
  if (isLoading) {
    return (
      <div className="hb-cust-overview" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: COLORS.muted, fontFamily: "'Inter', sans-serif" }}>
        <style>{globalStyles}</style>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Loading your dashboard…</h2>
      </div>
    );
  }

  const firstName = (userData.fullName || 'Guest').split(' ')[0];

  return (
    <div className="hb-cust-overview" style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* 1. WELCOME HEADER */}
      <div style={{ marginBottom: '30px', borderBottom: `2px solid ${COLORS.border}`, paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, margin: '0 0 6px 0', fontSize: '30px', fontWeight: 700 }}>Welcome back, {firstName}!</h1>
          <p style={{ color: COLORS.muted, margin: 0, fontSize: '16px' }}>Ready for your next getaway?</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: '28px', fontWeight: 700, color: COLORS.emerald }}>{totalBookings}</div>
          <div style={{ fontSize: '12px', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Lifetime Stays</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>

        {/* 2. UPCOMING STAY HIGHLIGHT CARD */}
        <div style={{ flex: '1 1 400px', backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(13,43,38,0.04)', border: `1px solid ${COLORS.border}`, borderLeft: `5px solid ${COLORS.emerald}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontSize: '100px', opacity: 0.04, color: COLORS.emerald }}><FaConciergeBell /></div>

          <h3 style={{ margin: '0 0 20px 0', color: COLORS.ink, display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 600 }}>
            <FaCalendarAlt color={COLORS.emerald} /> Your Next Stay
          </h3>

          {upcomingStay ? (
            <div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '18px' }}>
                <div style={{ flex: 1, backgroundColor: COLORS.pageBg, padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Check-In</div>
                  <div style={{ fontWeight: 700, color: COLORS.ink, fontSize: '16px', marginTop: '4px' }}>{formatBeautifulDate(upcomingStay.checkInDate)}</div>
                </div>
                <div style={{ flex: 1, backgroundColor: COLORS.pageBg, padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Check-Out</div>
                  <div style={{ fontWeight: 700, color: COLORS.ink, fontSize: '16px', marginTop: '4px' }}>{formatBeautifulDate(upcomingStay.checkOutDate)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <strong style={{ color: COLORS.ink, fontSize: '15px' }}>Room {upcomingStay.roomNumber || 'Assigned at check-in'}</strong>
                  <div style={{ color: COLORS.muted, fontSize: '14px', marginTop: '2px' }}>{upcomingStay.roomTypeName || 'Standard'} • {upcomingStay.guestsCount} Guest(s)</div>
                </div>
                <Link to="/customer/reservations" className="hb-detail-link" style={{ padding: '9px 16px', backgroundColor: COLORS.pageBg, color: COLORS.text, textDecoration: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: 700, transition: 'background-color 0.15s, color 0.15s' }}>
                  View Details
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: COLORS.muted, marginBottom: '16px', fontSize: '15px' }}>You don't have any upcoming trips planned yet.</p>
              <Link to="/customer/book" className="hb-cta-btn" style={{ display: 'inline-block', padding: '11px 22px', backgroundColor: COLORS.emerald, color: COLORS.ivory, textDecoration: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14.5px', boxShadow: '0 4px 12px rgba(31,93,79,0.2)' }}>
                Book a Room Now
              </Link>
            </div>
          )}
        </div>

        {/* 3. QUICK ACTIONS CARD */}
        <div style={{ flex: '1 1 250px', backgroundColor: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 15px rgba(13,43,38,0.04)', border: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: '0 0 4px 0', color: COLORS.ink, fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 600 }}>Quick Actions</h3>

          <button onClick={() => navigate('/customer/book')} className="hb-quick-btn" style={quickActionBtnStyle(COLORS.emerald, COLORS.emeraldSoft)}>
            <FaBed size={17} /> Book a New Stay <FaArrowRight style={{ marginLeft: 'auto' }} size={13} />
          </button>

          <button onClick={() => navigate('/customer/reservations')} className="hb-quick-btn" style={quickActionBtnStyle(COLORS.sky, COLORS.skySoft)}>
            <FaCalendarAlt size={17} /> View Booking History <FaArrowRight style={{ marginLeft: 'auto' }} size={13} />
          </button>
        </div>
      </div>

      {/* 4. EXPLORE ROOMS */}
      <h3 style={{ borderBottom: `2px solid ${COLORS.border}`, paddingBottom: '12px', color: COLORS.ink, marginBottom: '20px', fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 600 }}>
        Explore Our Rooms
      </h3>

      {roomTypes.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', border: `1px solid ${COLORS.border}`, color: COLORS.muted }}>
          Room listings are unavailable right now. Please check back soon.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px', marginBottom: '10px' }}>
          {roomTypes.map(room => (
            <div key={room.id} className="hb-room-card" style={{ position: 'relative', backgroundColor: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(13,43,38,0.05)', border: `1px solid ${COLORS.border}` }}>
              <button
                onClick={() => toggleFavorite(room.id)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, transition: 'transform 0.15s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {favorites.includes(room.id) ? <FaHeart color={COLORS.rose} size={18} /> : <FaRegHeart color={COLORS.muted} size={18} />}
              </button>
              <div style={{ height: '110px', background: `linear-gradient(135deg, ${COLORS.emeraldSoft}, ${COLORS.brassSoft})`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: COLORS.emerald }}>
                <FaBed size={36} />
              </div>
              
              <div style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: COLORS.ink, fontSize: '17px', fontFamily: "'Fraunces', serif", fontWeight: 700 }}>{room.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: COLORS.text, fontSize: '14px', marginBottom: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: COLORS.muted }}><FaUsers size={12} /> {room.capacity} Pax</span>
                  <span style={{ color: COLORS.emerald, fontWeight: 700 }}>₱{room.basePrice} /night</span>
                </div>
                <button
                  onClick={() => navigate('/customer/book')}
                  className="hb-room-btn"
                  style={{ width: '100%', padding: '11px', backgroundColor: COLORS.emerald, color: COLORS.ivory, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: "'Inter', sans-serif" }}
                >
                  Book This Room
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// Inline helper for those action buttons
const quickActionBtnStyle = (color, softBg) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  padding: '15px',
  backgroundColor: softBg,
  color: color,
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '15px',
  fontFamily: "'Inter', sans-serif",
  textAlign: 'left',
});