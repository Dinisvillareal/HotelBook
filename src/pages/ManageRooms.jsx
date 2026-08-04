import { useState, useEffect } from 'react';
import axios from 'axios';
import RoomMatrix from '../components/RoomMatrix';
import { FaPlusCircle, FaDoorClosed, FaExchangeAlt, FaCalendarDay, FaTimes, FaTag, FaMoneyBillWave, FaUsers, FaHashtag, FaUserEdit, FaBed } from 'react-icons/fa';

// ---- Design tokens (matches Login/Register/AdminLayout/CustomerLayout/CreateReservation/Overview/ManagePrices) ----
const COLORS = {
  ink: '#0D2B26',
  emerald: '#1F5D4F',
  emeraldDark: '#123028',
  emeraldSoft: '#E5EFEA',
  emeraldBorder: 'rgba(31,93,79,0.25)',
  brass: '#C6A15B',
  brassDark: '#9A7B32',
  ivory: '#FBF8F1',
  pageBg: '#F6F4EE',
  border: '#e5e2da',
  muted: '#8a8f89',
  text: '#495057',
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

  .hb-page * { box-sizing: border-box; }

  .hb-input:focus, .hb-select:focus {
    outline: none;
    border-color: ${COLORS.emerald} !important;
    box-shadow: 0 0 0 3px rgba(31,93,79,0.14);
  }

  .hb-btn-primary:hover { background-color: ${COLORS.emeraldDark} !important; }
  .hb-btn-brass:hover { background-color: #8a6c28 !important; }
  .hb-btn-secondary:hover { background-color: ${COLORS.pageBg} !important; border-color: ${COLORS.emerald} !important; }
  .hb-btn-secondary:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 2px; }
  .hb-close-modal:hover { color: ${COLORS.ink} !important; }
`;

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({ name: '', basePrice: '', capacity: '' });
  const [statusMessage, setStatusMessage] = useState('');
  const [newRoomData, setNewRoomData] = useState({
    roomNumber: '',
    roomTypeId: ''
  });
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [activeReservations, setActiveReservations] = useState([]);
  const [physicalRooms, setPhysicalRooms] = useState([]);

  const [upgradeData, setUpgradeData] = useState({
    reservationId: '',
    targetRoomTypeId: '',
    targetRoomId: ''
  });

  const apiUrl = import.meta.env.VITE_API_URL;

 const fetchRooms = () => {
    // 1. Grab the token inside the function
    const token = sessionStorage.getItem('jwtToken');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Attach authConfig to the request!
    axios.get(`${apiUrl}/api/RoomTypes`, authConfig)
      .then(response => {
        if (Array.isArray(response.data)) setRooms(response.data);
        else if (response.data && Array.isArray(response.data.$values)) setRooms(response.data.$values);
      })
      .catch(err => console.error("Error fetching rooms:", err));
  };

  useEffect(() => {
    fetchRooms();
    const token = sessionStorage.getItem('jwtToken');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    axios.get(`${apiUrl}/api/Reservations`, authConfig)
      .then(res => {
        const confirmed = (res.data.$values || res.data).filter(r => r.status === "Confirmed");
        setActiveReservations(confirmed);
      })
      .catch(err => console.error("Error fetching reservations:", err));

    axios.get(`${apiUrl}/api/Rooms`, authConfig)
      .then(res => setPhysicalRooms(res.data.$values || res.data))
      .catch(err => console.error("Error fetching physical rooms:", err));
  }, []);

  const handleRoomChange = (e) => setNewRoomData({ ...newRoomData, [e.target.name]: e.target.value });
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreatePhysicalRoom = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('jwtToken');
      await axios.post(`${apiUrl}/api/Rooms`, newRoomData, { headers: { Authorization: `Bearer ${token}` } });
      alert("Physical room created successfully!");
      setNewRoomData({ roomNumber: '', roomTypeId: '' });
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Check the console.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('jwtToken');
    axios.post(`${apiUrl}/api/RoomTypes`, formData, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        alert("Room created successfully!");
        window.location.reload();
      })
      .catch(err => console.error("Error creating room:", err));
  };

  const getAvailablePhysicalRooms = () => {
    if (!upgradeData.reservationId || !upgradeData.targetRoomTypeId) return [];

    const targetRes = activeReservations.find(r => r.id === parseInt(upgradeData.reservationId));
    if (!targetRes) return [];

    const checkIn = new Date(targetRes.checkInDate);
    const checkOut = new Date(targetRes.checkOutDate);
    checkIn.setHours(0,0,0,0);
    checkOut.setHours(0,0,0,0);

    const roomsOfType = physicalRooms.filter(r =>
      r.roomTypeId === parseInt(upgradeData.targetRoomTypeId) ||
      r.RoomTypeId === parseInt(upgradeData.targetRoomTypeId)
    );

    return roomsOfType.filter(room => {
      const isBooked = activeReservations.some(otherRes => {
        if (otherRes.id === targetRes.id) return false;
        if (otherRes.status === "Cancelled") return false;
        if (otherRes.roomId !== room.id) return false;

        const otherIn = new Date(otherRes.checkInDate);
        const otherOut = new Date(otherRes.checkOutDate);
        otherIn.setHours(0,0,0,0);
        otherOut.setHours(0,0,0,0);

        return (checkIn < otherOut) && (checkOut > otherIn);
      });

      return !isBooked;
    });
  };

  const availableRoomsForUpgrade = getAvailablePhysicalRooms();

  const handleUpgradeSubmit = async (e) => {
    e.preventDefault();

    if (!upgradeData.targetRoomId) {
      alert("Please select a specific physical room number.");
      return;
    }

    const token = sessionStorage.getItem('jwtToken');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.patch(`${apiUrl}/api/Reservations/${upgradeData.reservationId}/upgrade`,
        { targetRoomId: parseInt(upgradeData.targetRoomId) },
        authConfig
      );

      alert("Room changed successfully! The old room is now available.");
      window.location.reload();
    } catch (error) {
      console.error("Error upgrading room:", error);
      alert(error.response?.data?.message || "Failed to change room.");
    }
  };

  return (
    <div className="hb-page" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* HEADER SECTION */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '32px', margin: '0 0 8px 0', fontWeight: 700 }}>Manage Rooms</h2>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: '16px' }}>Create categories, assign physical rooms, and manage guest upgrades.</p>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

        {/* LEFT COLUMN: Creation Forms */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {/* Create New Room Type */}
          <div style={cardStyle}>
            <h3 style={sectionTitleStyle}><FaPlusCircle color={COLORS.emerald} /> Create New Room Type</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}><FaTag color={COLORS.muted} /> Room Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="hb-input" style={inputStyle} placeholder="e.g. Presidential Suite" />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}><FaMoneyBillWave color={COLORS.muted} /> Base Price (₱)</label>
                  <input type="number" name="basePrice" value={formData.basePrice} onChange={handleInputChange} required className="hb-input" style={inputStyle} placeholder="e.g. 1500" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}><FaUsers color={COLORS.muted} /> Capacity (Pax)</label>
                  <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} required className="hb-input" style={inputStyle} placeholder="e.g. 2" />
                </div>
              </div>

              <button type="submit" className="hb-btn-primary" style={primaryButtonStyle}>
                Save Room Type
              </button>
            </form>
          </div>

          {/* Create Physical Room */}
          <div style={cardStyle}>
            <h3 style={sectionTitleStyle}><FaDoorClosed color={COLORS.emerald} /> Create Physical Room</h3>
            <form onSubmit={handleCreatePhysicalRoom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}><FaHashtag color={COLORS.muted} /> Room Number</label>
                <input type="text" name="roomNumber" value={newRoomData.roomNumber} onChange={handleRoomChange} placeholder="e.g. 101" required className="hb-input" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}><FaBed color={COLORS.muted} /> Assign Room Type</label>
                <select name="roomTypeId" value={newRoomData.roomTypeId} onChange={handleRoomChange} required className="hb-select" style={inputStyle}>
                  <option value="" disabled>-- Select a Room Type --</option>
                  {rooms.map(type => (
                    <option key={type.id} value={type.id}>{type.name} (₱{type.basePrice})</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="hb-btn-primary" style={primaryButtonStyle}>
                Add Physical Room
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Upgrade Form & Matrix Button */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '15px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaExchangeAlt color={COLORS.brassDark} /> Change / Upgrade Room
              </h3>

              <button type="button" onClick={() => setIsMatrixOpen(true)} className="hb-btn-secondary" style={secondaryButtonStyle}>
                <FaCalendarDay color={COLORS.emerald} /> Availability Matrix
              </button>
            </div>

            <form onSubmit={handleUpgradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}><FaUserEdit color={COLORS.muted} /> Select Customer Reservation</label>
                <select value={upgradeData.reservationId} onChange={(e) => setUpgradeData({ ...upgradeData, reservationId: e.target.value, targetRoomTypeId: '', targetRoomId: '' })} required className="hb-select" style={inputStyle}>
                  <option value="">-- Select Reservation --</option>
                  {activeReservations.map(res => {
                    const actualRoom = physicalRooms.find(r => r.id === res.roomId);
                    const displayRoomNumber = actualRoom ? actualRoom.roomNumber : res.roomId;
                    return (
                      <option key={res.id} value={res.id}>
                        {res.guestName} - Res #{res.id} (Current: Room {displayRoomNumber})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label style={labelStyle}><FaTag color={COLORS.muted} /> Select Target Room Type</label>
                <select value={upgradeData.targetRoomTypeId} onChange={(e) => setUpgradeData({ ...upgradeData, targetRoomTypeId: e.target.value, targetRoomId: '' })} required className="hb-select" style={inputStyle}>
                  <option value="">-- Select Room Type --</option>
                  {rooms.map(type => (
                    <option key={type.id} value={type.id}>{type.name} (₱{type.basePrice})</option>
                  ))}
                </select>
              </div>

              {upgradeData.targetRoomTypeId && (
                <div style={{ padding: '15px', backgroundColor: COLORS.emeraldSoft, borderRadius: '8px', border: `1px solid ${COLORS.emeraldBorder}` }}>
                  <label style={{ ...labelStyle, color: COLORS.emeraldDark }}><FaDoorClosed /> Available Physical Rooms</label>
                  <select value={upgradeData.targetRoomId} onChange={(e) => setUpgradeData({ ...upgradeData, targetRoomId: e.target.value })} required className="hb-select" style={{ ...inputStyle, border: `2px solid ${COLORS.emerald}`, backgroundColor: 'white' }}>
                    <option value="">-- Choose Exact Room Number --</option>
                    {availableRoomsForUpgrade.length === 0 ? (
                      <option value="" disabled>No rooms available for these dates!</option>
                    ) : (
                      availableRoomsForUpgrade.map(r => (
                        <option key={r.id} value={r.id}>Room {r.roomNumber}</option>
                      ))
                    )}
                  </select>
                </div>
              )}

              <button type="submit" className="hb-btn-brass" style={{ ...primaryButtonStyle, backgroundColor: COLORS.brassDark, boxShadow: '0 4px 6px rgba(154,123,50,0.2)', marginTop: '5px' }}>
                Confirm Room Change
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* MATRIX MODAL */}
      {isMatrixOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(13,43,38,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '0', borderRadius: '12px', width: '95%', maxWidth: '1100px', boxShadow: '0 10px 30px rgba(13,43,38,0.25)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.pageBg, padding: '20px 25px', borderBottom: `1px solid ${COLORS.border}` }}>
              <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaCalendarDay color={COLORS.emerald} /> Room Availability Matrix
              </h3>
              <button onClick={() => setIsMatrixOpen(false)} className="hb-close-modal" style={{ background: 'transparent', border: 'none', color: COLORS.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', transition: 'color 0.15s' }}>
                <FaTimes size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '25px', overflowY: 'auto' }}>
              <RoomMatrix />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// --- Reusable Inline Styles ---
const cardStyle = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(13,43,38,0.05)',
  border: `1px solid ${COLORS.border}`
};

const sectionTitleStyle = {
  margin: '0 0 25px 0',
  fontFamily: "'Fraunces', serif",
  color: COLORS.ink,
  fontSize: '20px',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  borderBottom: `1px solid ${COLORS.border}`,
  paddingBottom: '15px'
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: '600',
  color: COLORS.text
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '8px',
  border: `1.5px solid ${COLORS.border}`,
  fontSize: '15px',
  fontFamily: "'Inter', sans-serif",
  backgroundColor: COLORS.pageBg,
  color: COLORS.ink,
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s'
};

const primaryButtonStyle = {
  padding: '14px',
  backgroundColor: COLORS.emerald,
  color: COLORS.ivory,
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '16px',
  fontFamily: "'Inter', sans-serif",
  transition: 'background-color 0.2s',
  boxShadow: '0 4px 6px rgba(31,93,79,0.15)',
  width: '100%'
};

const secondaryButtonStyle = {
  padding: '8px 16px',
  backgroundColor: 'white',
  color: COLORS.ink,
  border: `1px solid ${COLORS.border}`,
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  fontFamily: "'Inter', sans-serif",
  transition: 'background-color 0.15s, border-color 0.15s'
};