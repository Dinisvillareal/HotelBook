import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaUserCircle,
  FaEnvelope,
  FaUser,
  FaLock,
  FaShieldAlt,
  FaCheckCircle,
  FaInfoCircle,
  FaIdBadge,
} from 'react-icons/fa';

// ---- Design tokens (matches Login/Register/AdminLayout/Overview/ManageReservations) ----
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
  roseSoft: '#FDEEED',
  roseBorder: '#F3C9C6',
  amber: '#B78103',
  amberSoft: '#FFF3CD',
  amberBorder: '#FFE9A8',
  sky: '#3E6FB0',
  skySoft: '#E3ECF8',
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
  .hb-profile * { box-sizing: border-box; }
  .hb-profile input { font-family: 'Inter', sans-serif; }
  .hb-input:focus { border-color: ${COLORS.emerald} !important; box-shadow: 0 0 0 3px ${COLORS.emeraldSoft}; background-color: white !important; }
  .hb-input-danger:focus { border-color: ${COLORS.rose} !important; box-shadow: 0 0 0 3px ${COLORS.roseSoft}; }
  .hb-save-btn:not(:disabled):hover { filter: brightness(1.06); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(31,93,79,0.25); }
  .hb-save-btn { transition: filter 0.15s, transform 0.15s, box-shadow 0.15s; }
  @keyframes hbPulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
  .hb-skeleton { animation: hbPulse 1.4s ease-in-out infinite; background-color: ${COLORS.border}; border-radius: 6px; }
`;

// Consistent role -> accent color mapping across the app
const roleColors = (role) => {
  if (role === 'Admin') return { bg: COLORS.roseSoft, color: COLORS.rose };
  if (role === 'FrontDesk') return { bg: COLORS.skySoft, color: COLORS.sky };
  return { bg: COLORS.emeraldSoft, color: COLORS.emeraldDark };
};

export default function UserProfile() {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    username: '',
  });
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [updateData, setUpdateData] = useState({
    newUsername: '',
    currentPassword: '',
    newPassword: '',
  });

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const userRole = localStorage.getItem('userRole') || 'Customer';
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get(`${apiUrl}/api/Auth/me`, authConfig)
      .then(res => setProfileData(res.data))
      .catch(err => console.error('Error fetching profile data:', err))
      .finally(() => setIsProfileLoading(false));
  }, []);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    axios.put(`${apiUrl}/api/Auth/profile`, updateData, authConfig)
      .then(() => {
        setMessage({ type: 'success', text: 'Profile updated successfully! Please log in again.' });
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

  const badge = roleColors(userRole);

  return (
    <div className="hb-profile" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '30px', margin: '0 0 8px 0', fontWeight: 700 }}>My Account Profile</h1>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: '16px' }}>Manage your personal information and security settings.</p>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* LEFT COLUMN: User Information Card */}
        <div style={{ ...cardStyle, flex: '1 1 300px', textAlign: 'center' }}>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100px', height: '100px', margin: '0 auto 20px auto',
            background: `linear-gradient(135deg, ${COLORS.emerald}, ${COLORS.emeraldDark})`, color: COLORS.ivory,
            borderRadius: '50%', boxShadow: '0 6px 16px rgba(31,93,79,0.25)',
          }}>
            <FaUserCircle size={58} />
          </div>

          {isProfileLoading ? (
            <>
              <div className="hb-skeleton" style={{ height: '26px', width: '70%', margin: '0 auto 14px auto' }} />
              <div className="hb-skeleton" style={{ height: '24px', width: '45%', margin: '0 auto 30px auto', borderRadius: '20px' }} />
            </>
          ) : (
            <>
              <h3 style={{ margin: '0 0 10px 0', color: COLORS.ink, fontSize: '22px', fontFamily: "'Fraunces', serif", fontWeight: 700 }}>
                {profileData.fullName || 'Unnamed User'}
              </h3>

              <div style={{ marginBottom: '30px' }}>
                <span style={{
                  padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700,
                  backgroundColor: badge.bg, color: badge.color,
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}>
                  <FaIdBadge /> {userRole} Account
                </span>
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: COLORS.text, fontSize: '15px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: COLORS.pageBg, padding: '12px 15px', borderRadius: '8px' }}>
              <FaUser color={COLORS.muted} />
              <strong style={{ minWidth: '80px' }}>Username:</strong>
              {isProfileLoading ? (
                <div className="hb-skeleton" style={{ height: '14px', flex: 1 }} />
              ) : (
                <span style={{ color: COLORS.ink, fontWeight: 500 }}>{profileData.username}</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: COLORS.pageBg, padding: '12px 15px', borderRadius: '8px' }}>
              <FaEnvelope color={COLORS.muted} />
              <strong style={{ minWidth: '80px' }}>Email:</strong>
              {isProfileLoading ? (
                <div className="hb-skeleton" style={{ height: '14px', flex: 1 }} />
              ) : (
                <span style={{ color: COLORS.ink, fontWeight: 500 }}>{profileData.email}</span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Update Settings Form */}
        <div style={{ ...cardStyle, flex: '1 1 450px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '25px', color: COLORS.ink, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '19px', fontFamily: "'Fraunces', serif", fontWeight: 600, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '15px' }}>
            <FaShieldAlt color={COLORS.emerald} /> Security Settings
          </h3>

          {message && (
            <div style={{
              padding: '15px 20px', marginBottom: '25px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px',
              backgroundColor: message.type === 'success' ? COLORS.emeraldSoft : COLORS.roseSoft,
              color: message.type === 'success' ? COLORS.emeraldDark : COLORS.rose,
              borderLeft: `4px solid ${message.type === 'success' ? COLORS.emerald : COLORS.rose}`,
            }}>
              {message.type === 'success' ? <FaCheckCircle size={18} /> : <FaInfoCircle size={18} />}
              <strong>{message.text}</strong>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div>
              <label style={labelStyle}>New Username</label>
              <input
                type="text" name="newUsername" placeholder="Leave blank to keep current"
                value={updateData.newUsername} onChange={handleInputChange} style={inputStyle} className="hb-input"
              />
            </div>

            <div>
              <label style={labelStyle}>New Password</label>
              <input
                type="password" name="newPassword" placeholder="Leave blank to keep current"
                value={updateData.newPassword} onChange={handleInputChange} style={inputStyle} className="hb-input"
              />
            </div>

            <hr style={{ borderTop: `1px dashed ${COLORS.border}`, border: 'none', margin: '4px 0' }} />

            <div>
              <label style={{ ...labelStyle, color: COLORS.rose }}><FaLock color={COLORS.rose} /> Current Password (Required)</label>
              <input
                type="password" name="currentPassword" required placeholder="Enter current password to save changes"
                value={updateData.currentPassword} onChange={handleInputChange}
                style={{ ...inputStyle, border: `1px solid ${COLORS.roseBorder}`, backgroundColor: COLORS.roseSoft }}
                className="hb-input hb-input-danger"
              />
              <p style={{ fontSize: '12px', color: COLORS.muted, margin: '8px 0 0 0' }}>You must verify your current password to apply any account changes.</p>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="hb-save-btn"
              style={{
                marginTop: '6px', padding: '15px', backgroundColor: isLoading ? COLORS.muted : COLORS.emerald,
                color: COLORS.ivory, border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: '16px', fontFamily: "'Inter', sans-serif",
                boxShadow: isLoading ? 'none' : '0 4px 12px rgba(31,93,79,0.2)',
              }}
            >
              {isLoading ? 'Saving Changes…' : 'Save Changes'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

// --- Reusable Inline Styles ---
const cardStyle = {
  backgroundColor: 'white',
  padding: '35px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(13,43,38,0.04)',
  border: `1px solid ${COLORS.border}`,
};

const labelStyle = {
  display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
  fontSize: '14px', fontWeight: 600, color: COLORS.text,
};

const inputStyle = {
  width: '100%', padding: '14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`,
  fontSize: '15px', backgroundColor: COLORS.pageBg, color: COLORS.ink, boxSizing: 'border-box', outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
};