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
  FaHotel 
} from 'react-icons/fa';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // FIX 1: Read the role from sessionStorage!
  const userRole = sessionStorage.getItem('userRole') || 'Customer'; 

  const getLinkStyle = (path) => {
    // FIX 2: Ensure exact matching handles trailing slashes gracefully if they occur
    const isActive = location.pathname === path || (path === '/admin' && location.pathname === '/admin/');
    
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      marginBottom: '6px',
      color: isActive ? '#0056b3' : '#495057',
      backgroundColor: isActive ? '#f0f7ff' : 'transparent',
      textDecoration: 'none',
      borderRadius: '8px',
      fontWeight: isActive ? '700' : '500',
      transition: 'all 0.2s ease',
      borderLeft: isActive ? '4px solid #0056b3' : '4px solid transparent',
    };
  };

  const handleLogout = () => {
    // Make sure logout uses sessionStorage as well
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('userRole');
    navigate('/login'); 
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* SIDEBAR */}
      <nav style={{ 
        width: '260px', 
        backgroundColor: 'white', 
        borderRight: '1px solid #f1f3f5',
        boxShadow: '4px 0 15px rgba(0,0,0,0.02)', 
        padding: '25px 20px', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'sticky', 
        top: 0, 
        height: '100vh', 
        boxSizing: 'border-box' 
      }}>
        
        {/* LOGO AREA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '5px' }}>
          <div style={{ width: '35px', height: '35px', backgroundColor: '#0056b3', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
            <FaHotel size={18} />
          </div>
          <h1 style={{ fontSize: '20px', margin: 0, color: '#1a1a1a', fontWeight: '800', letterSpacing: '-0.5px' }}>
            HotelBook
          </h1>
        </div>
        
        {/* MENU LINKS */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#adb5bd', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '5px' }}>Main Menu</div>
          
          {/* FIX 3: Add /admin to the beginning of all these paths */}
          <Link to="/admin" style={getLinkStyle('/admin')}><FaChartPie size={18} /> Overview</Link>
          <Link to="/admin/book-room" style={getLinkStyle('/admin/book-room')}><FaEdit size={18} /> Book a Room</Link>
          <Link to="/admin/rooms" style={getLinkStyle('/admin/rooms')}><FaBed size={18} /> Manage Rooms</Link>
          <Link to="/admin/reservations" style={getLinkStyle('/admin/reservations')}><FaCalendarAlt size={18} /> Reservations</Link>
          <Link to="/admin/profile" style={getLinkStyle('/admin/profile')}><FaUserCircle size={18} /> My Profile</Link>

          {/* ADMIN TOOLS */}
          {userRole === 'Admin' && (
            <>
              <div style={{ fontSize: '11px', color: '#adb5bd', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: '30px 0 10px 0', paddingLeft: '5px' }}>Administration</div>
              {/* FIX 4: Add /admin to these paths as well */}
              <Link to="/admin/prices" style={getLinkStyle('/admin/prices')}><FaTags size={18} /> Manage Prices</Link>
              <Link to="/admin/staff" style={getLinkStyle('/admin/staff')}><FaUserPlus size={18} /> Register Staff</Link>
            </>
          )}
        </div>

        {/* BOTTOM ACTION AREA */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #f1f3f5' }}>
          <button 
            onClick={handleLogout} 
            style={{ 
              width: '100%', padding: '14px', backgroundColor: '#fff2f2', color: '#dc3545', 
              border: '1px solid #ffcaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dc3545'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff2f2'; e.currentTarget.style.color = '#dc3545'; }}
          >
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '40px', overflowX: 'hidden' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Outlet/>
        </div>
      </main>

    </div>
  );
}