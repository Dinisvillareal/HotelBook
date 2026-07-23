import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';



export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Grab the role from local storage!
  const userRole = localStorage.getItem('userRole') || 'Customer'; 
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profileData, setProfileData] = useState({ newUsername: '', currentPassword: '', newPassword: '' });
  const [profileMessage, setProfileMessage] = useState(null);

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

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setProfileMessage(null);

    const apiUrl = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('jwtToken');

    axios.put(`${apiUrl}/api/Auth/profile`, profileData, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setProfileMessage({ type: 'success', text: 'Profile updated! Please log in again.' });
        setTimeout(() => {
          handleLogout(); // Force them to log in with their new credentials!
        }, 2000);
      })
      .catch(err => {
        setProfileMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
      });
  };

  const handleLogout = () => {
    // 1. Throw away the security token
    localStorage.removeItem('jwtToken');
    // 2. Kick the user back to the login page
    navigate('/login'); 
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      
      {/* SIDEBAR */}
      <nav style={{ width: '250px', backgroundColor: 'white', borderRight: '1px solid #ddd', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '20px', marginBottom: '30px', color: '#007bff' }}>HotelBook Dashboard</h1>
        
        {/* Everyone sees these (Front Desk & Admin) */}
        <Link to="/" style={getLinkStyle('/')}>📊 Overview</Link>
        <Link to="/book-room" style={getLinkStyle('/book-room')}>✍️ Book a Room</Link>
        <Link to="/rooms" style={getLinkStyle('/rooms')}>🛏️ Manage Rooms</Link>
        <Link to="/reservations" style={getLinkStyle('/reservations')}>📅 Reservations</Link>
        <Link to="/profile" className="sidebar-link">👤 My Profile</Link>

        {/* ONLY Admins see these links! */}
        {userRole === 'Admin' && (
          <>
            <div style={{ margin: '20px 0 10px 0', fontSize: '12px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Admin Tools</div>
            <Link to="/prices" style={getLinkStyle('/prices')}>💰 Manage Prices</Link>
            <Link to="/staff" style={getLinkStyle('/staff')}>👥 Register Staff</Link>
          </>
        )}

        {/* EVERYONE sees the Log Out button, safely outside the Admin block! */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
          
          {/* 1. THE SETTINGS (GEAR) BUTTON */}
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            style={{ 
              flex: 1, padding: '12px', backgroundColor: '#6c757d', color: 'white', 
              border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            ⚙️ Settings
          </button>

          {/* 2. THE LOG OUT BUTTON */}
          <button 
            onClick={handleLogout} 
            style={{ 
              flex: 1, padding: '12px', backgroundColor: '#dc3545', color: 'white', 
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
{isSettingsOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '8px', 
            width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #ccc', paddingBottom: '10px', color: '#333' }}>
              Profile Settings
            </h3>
            
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {profileMessage && (
                <div style={{ padding: '10px', borderRadius: '4px', backgroundColor: profileMessage.type === 'success' ? '#d4edda' : '#f8d7da', color: profileMessage.type === 'success' ? '#155724' : '#721c24', fontSize: '14px' }}>
                  {profileMessage.text}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>New Username</label>
                <input type="text" placeholder="Leave blank to keep current" value={profileData.newUsername} onChange={e => setProfileData({...profileData, newUsername: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Current Password</label>
                <input type="password" required placeholder="Required to save changes" value={profileData.currentPassword} onChange={e => setProfileData({...profileData, currentPassword: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>New Password</label>
                <input type="password" placeholder="Leave blank to keep current" value={profileData.newPassword} onChange={e => setProfileData({...profileData, newPassword: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsSettingsOpen(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
