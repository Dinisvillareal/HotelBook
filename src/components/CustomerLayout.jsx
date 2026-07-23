import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';



export default function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    localStorage.removeItem('userRole'); // Good practice to clear this too!
    navigate('/login'); 
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      
      {/* CUSTOMER SIDEBAR */}
      <nav style={{ width: '250px', backgroundColor: 'white', borderRight: '1px solid #ddd', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '20px', marginBottom: '30px', color: '#007bff', textAlign: 'center' }}>My HotelBook</h1>
        
        <Link to="/customer" style={getLinkStyle('/customer')}>🏨 Browse Rooms</Link>
        <Link to="/customer/book" style={getLinkStyle('/customer/book')}>✍️ Book a Room</Link>
        <Link to="/customer/reservations" style={getLinkStyle('/customer/reservations')}>📅 My Reservations</Link>
        <Link to="/customer/profile" className="sidebar-link">👤 My Profile</Link>

        {/* BOTTOM BUTTON ROW */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            style={{ flex: 1, padding: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ⚙️ Settings
          </button>
          <button 
            onClick={handleLogout} 
            style={{ flex: 1, padding: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🚪 Log Out
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '30px' }}>
        <Outlet />
      </main>

      {/* SETTINGS MODAL (You can copy your exact modal code from AdminLayout here!) */}
      {isSettingsOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>
                <h3>Settings (Coming Soon)</h3>
                <button onClick={() => setIsSettingsOpen(false)}>Close</button>
            </div>
        </div>
      )}
    </div>
  );
}