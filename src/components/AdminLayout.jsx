import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Grab the role from local storage!
  const userRole = localStorage.getItem('userRole') || 'Customer'; 

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
    navigate('/login'); 
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      
      {/* SIDEBAR - Now Sticky! */}
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
        <h1 style={{ fontSize: '20px', marginBottom: '30px', color: '#007bff' }}>HotelBook Dashboard</h1>
        
        {/* Everyone sees these (Front Desk & Admin) */}
        <Link to="/" style={getLinkStyle('/')}>📊 Overview</Link>
        <Link to="/book-room" style={getLinkStyle('/book-room')}>✍️ Book a Room</Link>
        <Link to="/rooms" style={getLinkStyle('/rooms')}>🛏️ Manage Rooms</Link>
        <Link to="/reservations" style={getLinkStyle('/reservations')}>📅 Reservations</Link>
        <Link to="/profile" style={getLinkStyle('/profile')}>👤 My Profile</Link>

        {/* ONLY Admins see these links! */}
        {userRole === 'Admin' && (
          <>
            <div style={{ margin: '20px 0 10px 0', fontSize: '12px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Admin Tools</div>
            <Link to="/prices" style={getLinkStyle('/prices')}>💰 Manage Prices</Link>
            <Link to="/staff" style={getLinkStyle('/staff')}>👥 Register Staff</Link>
          </>
        )}

        {/* EVERYONE sees the Log Out button */}
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
        <Outlet/>
      </main>

    </div>
  );
}