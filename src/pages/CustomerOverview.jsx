import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaBed, FaArrowRight, FaConciergeBell } from 'react-icons/fa';

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

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch User Info, Their Reservations, and Room Types all at once!
        const [userRes, bookingsRes, roomsRes] = await Promise.all([
          axios.get(`${apiUrl}/api/Auth/me`, authConfig).catch(() => ({ data: { fullName: 'Guest' } })),
          axios.get(`${apiUrl}/api/Reservations/my-reservations`, authConfig).catch(() => ({ data: [] })),
          axios.get(`${apiUrl}/api/RoomTypes`).catch(() => ({ data: [] }))
        ]);

        setUserData(userRes.data);
        
        // Handle $values if C# serialized it that way
        const myBookings = bookingsRes.data.$values || bookingsRes.data || [];
        const types = roomsRes.data.$values || roomsRes.data || [];

        setTotalBookings(myBookings.length);
        setRoomTypes(types);

        // Find the most relevant upcoming stay (Confirmed and Check-In is in the future/today)
        const today = new Date();
        today.setHours(0,0,0,0);

        const futureStays = myBookings
          .filter(b => b.status === "Confirmed" && new Date(b.checkInDate) >= today)
          .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate)); // Closest date first!

        if (futureStays.length > 0) {
          setUpcomingStay(futureStays[0]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading dashboard:", error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div style={{ padding: '50px', textAlign: 'center', color: '#666' }}><h3>Loading your dashboard...</h3></div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* 1. WELCOME HEADER */}
      <div style={{ marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ color: '#007bff', margin: '0 0 5px 0' }}>Welcome back, {userData.fullName.split(' ')[0]}!</h1>
          <p style={{ color: '#666', margin: 0, fontSize: '16px' }}>Ready for your next getaway?</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{totalBookings}</div>
          <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Lifetime Stays</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
        
        {/* 2. UPCOMING STAY HIGHLIGHT CARD */}
        <div style={{ flex: '1 1 400px', backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #28a745', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontSize: '100px', opacity: '0.03' }}><FaConciergeBell /></div>
          
          <h3 style={{ margin: '0 0 20px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaCalendarAlt color="#28a745" /> Your Next Stay
          </h3>
          
          {upcomingStay ? (
            <div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                <div style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Check-In</div>
                  <div style={{ fontWeight: 'bold', color: '#333', fontSize: '16px' }}>{formatBeautifulDate(upcomingStay.checkInDate)}</div>
                </div>
                <div style={{ flex: 1, backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Check-Out</div>
                  <div style={{ fontWeight: 'bold', color: '#333', fontSize: '16px' }}>{formatBeautifulDate(upcomingStay.checkOutDate)}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Room {upcomingStay.roomNumber || 'Assigned at check-in'}</strong>
                  <div style={{ color: '#666', fontSize: '14px' }}>{upcomingStay.roomTypeName || 'Standard'} • {upcomingStay.guestsCount} Guest(s)</div>
                </div>
                <Link to="/customer/reservations" style={{ padding: '8px 15px', backgroundColor: '#e9ecef', color: '#333', textDecoration: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                  View Details
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#666', marginBottom: '15px' }}>You don't have any upcoming trips planned yet.</p>
              <Link to="/customer/book" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                Book a Room Now
              </Link>
            </div>
          )}
        </div>

        {/* 3. QUICK ACTIONS CARD */}
        <div style={{ flex: '1 1 250px', backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Quick Actions</h3>
           
           <button onClick={() => navigate('/customer/book')} style={quickActionBtnStyle('#007bff')}>
             <FaBed size={18} /> Book a New Stay <FaArrowRight style={{ marginLeft: 'auto' }}/>
           </button>
           
           <button onClick={() => navigate('/customer/reservations')} style={quickActionBtnStyle('#6c757d')}>
             <FaCalendarAlt size={18} /> View Booking History <FaArrowRight style={{ marginLeft: 'auto' }}/>
           </button>
        </div>
      </div>

      {/* 4. EXPLORE ROOMS (The original catalog logic, integrated nicely below) */}
      <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', color: '#333', marginBottom: '20px' }}>Explore Our Rooms</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {roomTypes.map(room => (
          <div key={room.id} style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ height: '120px', backgroundColor: '#e9ecef', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '40px' }}>
              🏨
            </div>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#007bff', fontSize: '18px' }}>{room.name}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '14px', marginBottom: '15px' }}>
                <span><strong>Capacity:</strong> {room.capacity} Pax</span>
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>₱{room.basePrice} /night</span>
              </div>
              <button 
                onClick={() => navigate('/customer/book')} 
                style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Book This Room
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// Inline helper for those action buttons
const quickActionBtnStyle = (color) => ({
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  width: '100%', 
  padding: '15px', 
  backgroundColor: 'white', 
  color: color, 
  border: `1px solid ${color}`, 
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontWeight: 'bold',
  fontSize: '15px',
  transition: 'background-color 0.2s',
  textAlign: 'left'
});