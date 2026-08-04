import { useState } from 'react';
import axios from 'axios';
import {
  FaUserPlus,
  FaUserCircle,
  FaEnvelope,
  FaLock,
  FaCheckCircle,
  FaInfoCircle,
  FaIdBadge,
  FaConciergeBell,
  FaUserShield,
  FaCheck,
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
  .hb-regstaff * { box-sizing: border-box; }
  .hb-regstaff input, .hb-regstaff select { font-family: 'Inter', sans-serif; }
  .hb-input:focus { border-color: ${COLORS.emerald} !important; box-shadow: 0 0 0 3px ${COLORS.emeraldSoft}; background-color: white !important; }
  .hb-role-card { transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s; }
  .hb-role-card:hover { border-color: ${COLORS.emerald}; }
  .hb-role-card:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 2px; }
  .hb-submit-btn:not(:disabled):hover { filter: brightness(1.06); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(31,93,79,0.25); }
  .hb-submit-btn { transition: filter 0.15s, transform 0.15s, box-shadow 0.15s; }
`;

const ROLES = [
  {
    value: 'FrontDesk',
    label: 'Front Desk',
    description: 'Can book rooms and view reservations.',
    icon: FaConciergeBell,
  },
  {
    value: 'Admin',
    label: 'System Admin',
    description: 'Full access to prices, staff, and overrides.',
    icon: FaUserShield,
  },
];

export default function RegisterStaff() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'FrontDesk', // Default to the safest role
  });

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');

  // Attach the token so the backend knows an Admin is making this request!
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    axios.post(`${apiUrl}/api/Auth/register-staff`, formData, authConfig)
      .then(() => {
        setMessage({ type: 'success', text: `Success! ${formData.fullName} has been registered as ${formData.role}.` });
        setFormData({ fullName: '', username: '', email: '', password: '', role: 'FrontDesk' });
      })
      .catch(err => {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to register staff member.' });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="hb-regstaff" style={{ padding: '20px', maxWidth: '650px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '68px', height: '68px', margin: '0 auto 18px auto',
          backgroundColor: COLORS.emeraldSoft, color: COLORS.emerald,
          borderRadius: '50%',
        }}>
          <FaUserPlus size={28} />
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '30px', margin: '0 0 8px 0', fontWeight: 700 }}>Register New Staff</h1>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: '16px' }}>Create and assign roles to new employees.</p>
      </div>

      {/* ALERT MESSAGE */}
      {message && (
        <div style={getMessageStyle(message.type)}>
          {message.type === 'success' ? <FaCheckCircle size={20} /> : <FaInfoCircle size={20} />}
          <strong>{message.text}</strong>
        </div>
      )}

      {/* FORM CARD */}
      <div style={cardStyle}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div>
            <label style={labelStyle}><FaUserCircle color={COLORS.muted} /> Full Name</label>
            <input
              type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
              placeholder="e.g. Jane Doe" style={inputStyle} className="hb-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}><FaIdBadge color={COLORS.muted} /> Username</label>
              <input
                type="text" name="username" value={formData.username} onChange={handleChange} required
                placeholder="janedoe123" style={inputStyle} className="hb-input"
              />
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}><FaEnvelope color={COLORS.muted} /> Email Address</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange} required
                placeholder="jane@hotelbook.com" style={inputStyle} className="hb-input"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}><FaLock color={COLORS.muted} /> Temporary Password</label>
            <input
              type="password" name="password" value={formData.password} onChange={handleChange} required
              placeholder="Assign a secure starting password" style={inputStyle} className="hb-input"
            />
          </div>

          {/* ROLE PICKER */}
          <div>
            <label style={{ ...labelStyle, fontSize: '15px', color: COLORS.ink, marginBottom: '12px' }}>
              Assign Role &amp; Permissions
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {ROLES.map(({ value, label, description, icon: Icon }) => {
                const selected = formData.role === value;
                return (
                  <button
                    type="button"
                    key={value}
                    className="hb-role-card"
                    onClick={() => handleRoleSelect(value)}
                    style={{
                      textAlign: 'left', cursor: 'pointer', padding: '18px', borderRadius: '12px',
                      border: `2px solid ${selected ? COLORS.emerald : COLORS.border}`,
                      backgroundColor: selected ? COLORS.emeraldSoft : COLORS.pageBg,
                      display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: selected ? COLORS.emerald : 'white', color: selected ? COLORS.ivory : COLORS.emerald,
                        border: selected ? 'none' : `1px solid ${COLORS.border}`,
                      }}>
                        <Icon size={16} />
                      </div>
                      {selected && (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: COLORS.emerald, color: COLORS.ivory, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                          <FaCheck />
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: COLORS.ink, fontSize: '15px', marginBottom: '4px', fontFamily: "'Fraunces', serif" }}>{label}</div>
                      <div style={{ fontSize: '13px', color: COLORS.muted, lineHeight: 1.4 }}>{description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="hb-submit-btn"
            style={{
              marginTop: '6px', padding: '16px',
              backgroundColor: isLoading ? COLORS.muted : COLORS.emerald,
              color: COLORS.ivory, border: 'none', borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: '16px', fontFamily: "'Inter', sans-serif",
              boxShadow: isLoading ? 'none' : '0 4px 12px rgba(31,93,79,0.2)',
            }}
          >
            {isLoading ? 'Registering…' : 'Create Staff Account'}
          </button>
        </form>
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

const getMessageStyle = (type) => ({
  padding: '15px 20px',
  marginBottom: '25px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '15px',
  backgroundColor: type === 'success' ? COLORS.emeraldSoft : COLORS.roseSoft,
  color: type === 'success' ? COLORS.emeraldDark : COLORS.rose,
  borderLeft: `4px solid ${type === 'success' ? COLORS.emerald : COLORS.rose}`,
});