import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBed, FaCalendarCheck, FaUsers, FaMoneyBillWave, FaClock } from 'react-icons/fa';

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
  const token = localStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [resResponse, roomsResponse] = await Promise.all([
          axios.get(`${apiUrl}/api/Reservations`, authConfig),
          axios.get(`${apiUrl}/api/Rooms`, authConfig)
        ]);

        const reservations = resResponse.data.$values || resResponse.data;
        const rooms = roomsResponse.data.$values || roomsResponse.data;

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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px', color: '#666' }}>
        <h2>Loading Live Data...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333', margin: 0 }}>Dashboard Overview</h2>
        {stats.pendingBookings > 0 && (
          <span style={{ padding: '8px 15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaClock /> {stats.pendingBookings} Pending Action(s) Required
          </span>
        )}
      </div>
      
      {/* --- TOP ROW: STAT CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        
        {/* Available Rooms */}
        <div style={{ ...cardStyle, borderTopColor: '#28a745' }}>
          <div style={iconStyle('#d4edda', '#28a745')}><FaBed /></div>
          <h3 style={titleStyle}>Available Rooms</h3>
          <p style={numberStyle}>{stats.availableRooms}</p>
          <span style={subtextStyle}>{stats.occupancyRate}% Hotel Occupancy</span>
        </div>

        {/* Total Bookings */}
        <div style={{ ...cardStyle, borderTopColor: '#007bff' }}>
          <div style={iconStyle('#cce5ff', '#007bff')}><FaCalendarCheck /></div>
          <h3 style={titleStyle}>Confirmed Bookings</h3>
          <p style={numberStyle}>{stats.totalBookings}</p>
          <span style={subtextStyle}>Upcoming & ongoing</span>
        </div>

        {/* Guests Today */}
        <div style={{ ...cardStyle, borderTopColor: '#17a2b8' }}>
          <div style={iconStyle('#d1ecf1', '#17a2b8')}><FaUsers /></div>
          <h3 style={titleStyle}>Guests Today</h3>
          <p style={numberStyle}>{stats.activeGuests}</p>
          <span style={subtextStyle}>Checked-in right now</span>
        </div>

        {/* Revenue */}
        <div style={{ ...cardStyle, borderTopColor: '#ffc107' }}>
          <div style={iconStyle('#fff3cd', '#ffc107')}><FaMoneyBillWave /></div>
          <h3 style={titleStyle}>Total Revenue</h3>
          <p style={numberStyle}>₱{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <span style={subtextStyle}>From confirmed bookings</span>
        </div>
      </div>

      {/* --- BOTTOM ROW: QUICK VIEWS --- */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
        <h3 style={{ marginTop: 0, color: '#333', borderBottom: '2px solid #f4f6f8', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaCalendarCheck color="#007bff" /> Today's Arrivals
        </h3>
        
        {stats.todaysArrivals.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic', padding: '10px 0' }}>No new guests checking in today.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left', color: '#555', fontSize: '14px' }}>
                <th style={{ padding: '12px' }}>Guest Name</th>
                <th style={{ padding: '12px' }}>Room</th>
                <th style={{ padding: '12px' }}>Pax</th>
                <th style={{ padding: '12px' }}>Check-Out</th>
              </tr>
            </thead>
            <tbody>
              {stats.todaysArrivals.map(res => (
                <tr key={res.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#333' }}>{res.guestName}</td>
                  <td style={{ padding: '12px' }}>Room #{res.roomNumber || res.roomId}</td>
                  <td style={{ padding: '12px' }}>{res.guestsCount}</td>
                  <td style={{ padding: '12px' }}>{formatBeautifulDate(res.checkOutDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

// --- INLINE STYLES ---
const cardStyle = {
  backgroundColor: 'white',
  padding: '25px 20px',
  borderRadius: '12px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  textAlign: 'center',
  borderTop: '5px solid', 
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const iconStyle = (bgColor, color) => ({
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  backgroundColor: bgColor,
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  marginBottom: '15px'
});

const titleStyle = { margin: '0 0 10px 0', fontSize: '15px', color: '#6c757d', textTransform: 'uppercase', letterSpacing: '0.5px' };
const numberStyle = { margin: '0 0 5px 0', fontSize: '32px', fontWeight: '800', color: '#343a40' };
const subtextStyle = { fontSize: '13px', color: '#adb5bd', fontWeight: '500' };