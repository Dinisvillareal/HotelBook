import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';

export default function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const getLinkStyle = (path) => ({
    display: 'block',
    padding: '10px 15px',
    marginBottom: '5px',
    color: location.pathname === path ? 'white' : '#333',
    backgroundColor: location.pathname === path ? '#007bff' : 'transparent',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
  });

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userRole');
    navigate('/login'); 
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      
      {/* CUSTOMER SIDEBAR - Now Sticky! */}
      <nav style={{ 
        width: '250px', 
        backgroundColor: 'white', 
        borderRight: '1px solid #ddd', 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'sticky', 
        top: 0, 
        height: '100vh', 
        boxSizing: 'border-box' 
      }}>
        <h1 style={{ fontSize: '20px', marginBottom: '30px', color: '#007bff', textAlign: 'center' }}>My HotelBook</h1>
        
        <Link to="/customer" style={getLinkStyle('/customer')}>🏨 Browse Rooms</Link>
        <Link to="/customer/book" style={getLinkStyle('/customer/book')}>✍️ Book a Room</Link>
        <Link to="/customer/reservations" style={getLinkStyle('/customer/reservations')}>📅 My Reservations</Link>
        <Link to="/customer/profile" style={getLinkStyle('/customer/profile')}>👤 My Profile</Link>

        {/* BOTTOM BUTTON ROW */}
        <div style={{ marginTop: 'auto', display: 'flex' }}>
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', padding: '12px', backgroundColor: '#dc3545', color: 'white', 
              border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            🚪 Log Out
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '30px' }}>
        <Outlet />
      </main>

    </div>
  );
}