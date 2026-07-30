import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  // 1. State for displaying the current user details
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    username: ''
  });

  // 2. State for the update form
  const [updateData, setUpdateData] = useState({
    newUsername: '',
    currentPassword: '',
    newPassword: ''
  });

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const userRole = localStorage.getItem('userRole') || 'Customer';
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  // 3. Fetch the current user data when the page loads
  useEffect(() => {
    // Note: Make sure you have a GET endpoint like /api/Auth/me or /api/Users/me 
    // in your C# backend to return the logged-in user's details!
    axios.get(`${apiUrl}/api/Auth/me`, authConfig)
      .then(res => setProfileData(res.data))
      .catch(err => console.error("Error fetching profile data:", err));
  }, []);

  // 4. Handle the form submission to update profile
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    axios.put(`${apiUrl}/api/Auth/profile`, updateData, authConfig)
      .then(() => {
        setMessage({ type: 'success', text: 'Profile updated successfully! Please log in again.' });
        // Log them out so they can log back in with new credentials
        setTimeout(() => {
          localStorage.removeItem('jwtToken');
          localStorage.removeItem('userRole');
          navigate('/login');
        }, 2000);
      })
      .catch(err => {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
        setIsLoading(false);
      });
  };

  const handleInputChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>My Account Profile</h2>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: User Information Card */}
        <div style={{ flex: '1 1 300px', backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', backgroundColor: '#007bff', color: 'white', fontSize: '32px', borderRadius: '50%', margin: '0 auto 20px auto' }}>
            👤
          </div>
          
          <h3 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#333' }}>
            {profileData.fullName || "Loading..."}
          </h3>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            {/* Dynamic Role Badge */}
            <span style={{ 
              padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
              backgroundColor: userRole === 'Admin' ? '#f8d7da' : userRole === 'FrontDesk' ? '#d1ecf1' : '#d4edda',
              color: userRole === 'Admin' ? '#721c24' : userRole === 'FrontDesk' ? '#0c5460' : '#155724'
            }}>
              {userRole} Account
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: '#555', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <strong>Username:</strong> <span>{profileData.username || "Loading..."}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <strong>Email:</strong> <span>{profileData.email || "Loading..."}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Update Settings Form */}
        <div style={{ flex: '1 1 400px', backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Update Security Settings</h3>
          
          {message && (
            <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24', fontSize: '14px' }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>New Username</label>
              <input 
                type="text" 
                name="newUsername"
                placeholder="Leave blank to keep current" 
                value={updateData.newUsername} 
                onChange={handleInputChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>New Password</label>
              <input 
                type="password" 
                name="newPassword"
                placeholder="Leave blank to keep current" 
                value={updateData.newPassword} 
                onChange={handleInputChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
              />
            </div>

            <hr style={{ borderTop: '1px solid #eee', margin: '5px 0' }} />

            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#dc3545' }}>Current Password (Required)</label>
              <input 
                type="password" 
                name="currentPassword"
                required 
                placeholder="Enter current password to save changes" 
                value={updateData.currentPassword} 
                onChange={handleInputChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              style={{ marginTop: '10px', padding: '12px', backgroundColor: isLoading ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px' }}
            >
              {isLoading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}