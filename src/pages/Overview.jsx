import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaBed,
  FaCalendarCheck,
  FaUsers,
  FaMoneyBillWave,
  FaClock,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';

// ---- Design tokens (matches Login/Register/AdminLayout/CustomerLayout/CreateReservation) ----
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
  amber: '#B78103',
  amberSoft: '#FFF3CD',
  amberBorder: '#FFE9A8',
  sky: '#3E6FB0',
  skySoft: '#E3ECF8',
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
  .hb-overview * { box-sizing: border-box; }
  .hb-row:hover { background-color: ${COLORS.pageBg}; }
`;

// Helper to make dates look nice
const formatBeautifulDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function Overview() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeGuests: 0,
    availableRooms: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    pendingBookings: 0,
    todaysArrivals: [],
    isLoading: true
  });

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Get today's formatted date for the header
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

 useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = sessionStorage.getItem('jwtToken');
      
        // Safety check: If there is no token, don't even try to fetch
        if (!token) {
          console.warn("No token found. User might not be logged in.");
          return; 
        }

        const authConfig = { headers: { Authorization: `Bearer ${token}` } };

        const [roomsRes, reservationsRes] = await Promise.all([
          axios.get(`${apiUrl}/api/Rooms`, authConfig),
          axios.get(`${apiUrl}/api/Reservations`, authConfig)
        ]);

        // FIX: We changed these to exactly match the variable names from above!
        const reservations = reservationsRes.data.$values || reservationsRes.data;
        const rooms = roomsRes.data.$values || roomsRes.data;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // --- MATH & CALCULATIONS ---
        const confirmedReservations = reservations.filter(r => r.status === "Confirmed");
        const pendingCount = reservations.filter(r => r.status === "Pending" || r.paymentStatus === "Pending").length;

        const revenue = confirmedReservations.reduce((sum, r) => sum + r.totalPrice, 0);

        const currentlyOccupied = confirmedReservations.filter(r => {
            const checkIn = new Date(r.checkInDate);
            const checkOut = new Date(r.checkOutDate);
            checkIn.setHours(0,0,0,0);
            checkOut.setHours(0,0,0,0);
            return today >= checkIn && today < checkOut;
        });

        // Who is arriving specifically today?
        const arrivalsToday = confirmedReservations.filter(r => {
            const checkIn = new Date(r.checkInDate);
            checkIn.setHours(0,0,0,0);
            return checkIn.getTime() === today.getTime();
        });

        const activeGuests = currentlyOccupied.reduce((sum, r) => sum + r.guestsCount, 0);
        const totalPhysicalRooms = rooms.length;
        const occupiedRoomsToday = currentlyOccupied.length;
        const availableRooms = totalPhysicalRooms - occupiedRoomsToday;

        // Calculate Occupancy Percentage
        const occupancy = totalPhysicalRooms > 0 ? Math.round((occupiedRoomsToday / totalPhysicalRooms) * 100) : 0;

        setStats({
          totalBookings: confirmedReservations.length,
          activeGuests: activeGuests,
          availableRooms: availableRooms,
          totalRevenue: revenue,
          occupancyRate: occupancy,
          pendingBookings: pendingCount,
          todaysArrivals: arrivalsToday,
          isLoading: false
        });

      } catch (error) {
        console.error("Error fetching overview stats:", error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchDashboardStats();
  }, []);

  if (stats.isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: COLORS.muted, fontFamily: "'Inter', sans-serif" }}>
        <style>{globalStyles}</style>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Loading live data…</h2>
      </div>
    );
  }

  return (
    <div className="hb-overview" style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* --- HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, margin: '0 0 8px 0', fontSize: '32px', fontWeight: 700 }}>Dashboard Overview</h1>
          <p style={{ color: COLORS.muted, margin: 0, fontSize: '16px' }}>{todayFormatted}</p>
        </div>
      </div>

      {/* --- ALERT BANNER --- */}
      {stats.pendingBookings > 0 && (
        <div style={{ backgroundColor: COLORS.amberSoft, color: COLORS.amber, padding: '15px 20px', borderRadius: '8px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `4px solid ${COLORS.amber}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <FaExclamationCircle size={20} />
          <strong style={{ fontSize: '16px' }}>Attention required:</strong>
          <span>You have {stats.pendingBookings} pending booking(s) or payment(s) awaiting your approval.</span>
        </div>
      )}

      {/* --- TOP ROW: STAT CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '35px' }}>

        {/* Available Rooms & Occupancy */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={titleStyle}>Available Rooms</h3>
              <p style={numberStyle}>{stats.availableRooms}</p>
            </div>
            <div style={iconStyle(COLORS.emeraldSoft, COLORS.emerald)}><FaBed /></div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: COLORS.muted, marginBottom: '6px' }}>
              <span>Occupancy Rate</span>
              <span style={{ fontWeight: 'bold', color: COLORS.text }}>{stats.occupancyRate}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: COLORS.border, borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${stats.occupancyRate}%`, height: '100%', backgroundColor: stats.occupancyRate > 80 ? COLORS.rose : COLORS.emerald, borderRadius: '3px' }}></div>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={titleStyle}>Confirmed Bookings</h3>
              <p style={numberStyle}>{stats.totalBookings}</p>
            </div>
            <div style={iconStyle(COLORS.skySoft, COLORS.sky)}><FaCalendarCheck /></div>
          </div>
          <p style={subtextStyle}>Total upcoming & ongoing stays</p>
        </div>

        {/* Guests Today */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={titleStyle}>Guests Today</h3>
              <p style={numberStyle}>{stats.activeGuests}</p>
            </div>
            <div style={iconStyle(COLORS.brassSoft, '#9A7B32')}><FaUsers /></div>
          </div>
          <p style={subtextStyle}>Total pax currently checked-in</p>
        </div>

        {/* Revenue */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={titleStyle}>Total Revenue</h3>
              <p style={numberStyle}>₱{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}</p>
            </div>
            <div style={iconStyle(COLORS.emeraldSoft, COLORS.emeraldDark)}><FaMoneyBillWave /></div>
          </div>
          <p style={subtextStyle}>From all confirmed reservations</p>
        </div>

      </div>

      {/* --- BOTTOM ROW: TWO COLUMNS --- */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

        {/* LEFT COLUMN: Today's Arrivals */}
        <div style={{ flex: '2 1 600px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(13,43,38,0.04)', border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ marginTop: 0, fontFamily: "'Fraunces', serif", color: COLORS.ink, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '15px', marginBottom: '20px', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
             Today's Expected Arrivals
          </h3>

          {stats.todaysArrivals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.muted }}>
              <FaCheckCircle size={40} style={{ marginBottom: '15px', color: COLORS.border }} />
              <p style={{ margin: 0, fontSize: '16px' }}>No pending arrivals for today.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: COLORS.pageBg, textAlign: 'left', color: COLORS.text, fontSize: '13px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '15px', borderRadius: '8px 0 0 8px' }}>Guest</th>
                    <th style={{ padding: '15px' }}>Room</th>
                    <th style={{ padding: '15px' }}>Guests (Pax)</th>
                    <th style={{ padding: '15px', borderRadius: '0 8px 8px 0' }}>Check-Out</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.todaysArrivals.map(res => (
                    <tr key={res.id} className="hb-row" style={{ borderBottom: `1px solid ${COLORS.border}`, transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '600', color: COLORS.ink }}>{res.guestName}</div>
                        <div style={{ fontSize: '12px', color: COLORS.muted }}>ID: #{res.id}</div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ backgroundColor: COLORS.emeraldSoft, color: COLORS.emeraldDark, padding: '5px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                          Room {res.roomNumber || res.roomId}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: COLORS.text }}>{res.guestsCount}</td>
                      <td style={{ padding: '15px', color: COLORS.text }}>{formatBeautifulDate(res.checkOutDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Operational Status */}
        <div style={{ flex: '1 1 350px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(13,43,38,0.04)', border: `1px solid ${COLORS.border}` }}>
           <h3 style={{ marginTop: 0, fontFamily: "'Fraunces', serif", color: COLORS.ink, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '15px', marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
             Operational Tasks
           </h3>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Task 1: Pending Bookings */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: stats.pendingBookings > 0 ? COLORS.amberSoft : COLORS.pageBg, borderRadius: '8px', border: `1px solid ${stats.pendingBookings > 0 ? COLORS.amberBorder : COLORS.border}` }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: stats.pendingBookings > 0 ? COLORS.amber : COLORS.border, color: stats.pendingBookings > 0 ? 'white' : COLORS.muted, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px' }}>
                  <FaClock />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: COLORS.ink, fontSize: '15px' }}>{stats.pendingBookings} Pending Actions</div>
                  <div style={{ fontSize: '13px', color: COLORS.muted }}>Requires front desk approval</div>
                </div>
              </div>

              {/* Task 2: Housekeeping / Rooms Available */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: COLORS.pageBg, borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: COLORS.border, color: COLORS.muted, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px' }}>
                  <FaBed />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: COLORS.ink, fontSize: '15px' }}>{stats.availableRooms} Rooms to Prepare</div>
                  <div style={{ fontSize: '13px', color: COLORS.muted }}>Currently empty and available</div>
                </div>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
}

// --- INLINE STYLES ---
const cardStyle = {
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '16px',
  boxShadow: '0 4px 15px rgba(13,43,38,0.04)',
  border: `1px solid ${COLORS.border}`,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const iconStyle = (bgColor, color) => ({
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  backgroundColor: bgColor,
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '22px'
});

const titleStyle = { margin: '0 0 8px 0', fontSize: '14px', color: COLORS.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' };
const numberStyle = { margin: 0, fontFamily: "'Fraunces', serif", fontSize: '32px', fontWeight: '700', color: COLORS.ink, lineHeight: '1.2' };
const subtextStyle = { margin: '20px 0 0 0', fontSize: '13px', color: COLORS.muted, fontWeight: '500' };