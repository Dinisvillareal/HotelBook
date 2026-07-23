import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Overview() {
  // 1. Set up our state to hold the calculated numbers
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeGuests: 0,
    availableRooms: 0,
    totalRevenue: 0,
    isLoading: true
  });

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // 2. Fetch both Rooms and Reservations simultaneously for speed!
        const [resResponse, roomsResponse] = await Promise.all([
          axios.get(`${apiUrl}/api/Reservations`, authConfig),
          axios.get(`${apiUrl}/api/Rooms`, authConfig)
        ]);

        // Safety check for Dapper/C# serialization formatting
        const reservations = resResponse.data.$values || resResponse.data;
        const rooms = roomsResponse.data.$values || roomsResponse.data;

        // Get exactly midnight today to accurately calculate who is in the hotel right now
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // --- MATH & CALCULATIONS ---
        
        // A. Total Confirmed Bookings (Ignore cancelled ones)
        const confirmedReservations = reservations.filter(r => r.status === "Confirmed");
        
        // B. Total Revenue (Sum up the price of every confirmed booking)
        const revenue = confirmedReservations.reduce((sum, r) => sum + r.totalPrice, 0);

        // C. Find out who is physically in the hotel TODAY
        const currentlyOccupied = confirmedReservations.filter(r => {
            const checkIn = new Date(r.checkInDate);
            const checkOut = new Date(r.checkOutDate);
            checkIn.setHours(0,0,0,0);
            checkOut.setHours(0,0,0,0);
            
            // They are here if today is on or after check-in, and strictly before check-out
            return today >= checkIn && today < checkOut;
        });

        // D. Count total guests sleeping in the hotel tonight
        const activeGuests = currentlyOccupied.reduce((sum, r) => sum + r.guestsCount, 0);

        // E. Calculate Available Rooms (Total physical rooms minus the ones occupied today)
        const totalPhysicalRooms = rooms.length;
        const occupiedRoomsToday = currentlyOccupied.length;
        const availableRooms = totalPhysicalRooms - occupiedRoomsToday;

        // 3. Save it all to state to trigger the UI render
        setStats({
          totalBookings: confirmedReservations.length,
          activeGuests: activeGuests,
          availableRooms: availableRooms,
          totalRevenue: revenue,
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
    return <p style={{ padding: '20px', fontSize: '18px', color: '#666' }}>Calculating dashboard statistics...</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Live Hotel Statistics</h2>
      
      {/* CSS Grid creates a responsive row of 4 equally-sized cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Available Rooms */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>🟢 Available Rooms</h3>
          <p style={numberStyle}>{stats.availableRooms}</p>
          <span style={subtextStyle}>Ready for walk-ins today</span>
        </div>

        {/* Card 2: Active Bookings */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>📅 Total Bookings</h3>
          <p style={numberStyle}>{stats.totalBookings}</p>
          <span style={subtextStyle}>Upcoming & ongoing</span>
        </div>

        {/* Card 3: Guests Today */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>👥 Guests Today</h3>
          <p style={numberStyle}>{stats.activeGuests}</p>
          <span style={subtextStyle}>Checked-in right now</span>
        </div>

        {/* Card 4: Total Revenue */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>💰 Total Revenue</h3>
          {/* Format the number to look like real Philippine Pesos with commas and 2 decimals! */}
          <p style={numberStyle}>₱{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <span style={subtextStyle}>From all confirmed bookings</span>
        </div>

      </div>
    </div>
  );
}

// --- INLINE STYLES ---
// Using inline objects keeps the component self-contained without needing an external CSS file!

const cardStyle = {
  backgroundColor: 'white',
  padding: '20px 15px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  textAlign: 'center',
  borderTop: '4px solid #007bff' // A nice blue accent line at the top
};

const titleStyle = { margin: '0 0 10px 0', fontSize: '16px', color: '#555' };
const numberStyle = { margin: '0', fontSize: '36px', fontWeight: 'bold', color: '#333' };
const subtextStyle = { fontSize: '12px', color: '#888' };