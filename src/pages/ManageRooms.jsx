import { useState, useEffect } from 'react';
import axios from 'axios';
import RoomMatrix from '../components/RoomMatrix';
import {
  FaPlusCircle,
  FaDoorClosed,
  FaExchangeAlt,
  FaCalendarDay,
  FaTimes,
  FaTag,
  FaMoneyBillWave,
  FaUsers,
  FaHashtag,
  FaUserEdit,
  FaBed,
  FaSearch,
  FaSort,
  FaEdit,
  FaTrash,
  FaInfoCircle,
} from 'react-icons/fa';

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
  rose: '#B3413B',
  roseSoft: '#FFF2F1',
  blue: '#3E6FB0',
  blueSoft: '#E3ECF8',
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
  .hb-room-row:hover { background-color: ${COLORS.pageBg}; }
`;

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({ name: '', basePrice: '', capacity: '' });
  const [newRoomData, setNewRoomData] = useState({
    roomNumber: '',
    roomTypeId: '',
  });
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [activeReservations, setActiveReservations] = useState([]);
  const [physicalRooms, setPhysicalRooms] = useState([]);

  // --- TABLE CONTROLS ---
  const [roomSearch, setRoomSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'roomNumber', direction: 'asc' });

  // --- EDIT MODAL STATE ---
  const [editingRoom, setEditingRoom] = useState(null);
  const [editError, setEditError] = useState(null);
  const [isEditSaving, setIsEditSaving] = useState(false);

  const [upgradeData, setUpgradeData] = useState({
    reservationId: '',
    targetRoomTypeId: '',
    targetRoomId: '',
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  const getAuthConfig = () => {
    const token = sessionStorage.getItem('jwtToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchRooms = () => {
    axios
      .get(`${apiUrl}/api/RoomTypes`, getAuthConfig())
      .then((response) => {
        if (Array.isArray(response.data)) setRooms(response.data);
        else if (response.data && Array.isArray(response.data.$values)) setRooms(response.data.$values);
      })
      .catch((err) => console.error('Error fetching rooms:', err));
  };

  const fetchPhysicalRooms = () => {
    axios
      .get(`${apiUrl}/api/Rooms/details`, getAuthConfig())
      .then((res) => setPhysicalRooms(res.data.$values || res.data || []))
      .catch((err) => console.error('Error fetching physical rooms:', err));
  };

  useEffect(() => {
    fetchRooms();
    fetchPhysicalRooms();

    axios
      .get(`${apiUrl}/api/Reservations`, getAuthConfig())
      .then((res) => {
        const confirmed = (res.data.$values || res.data).filter((r) => r.status === 'Confirmed');
        setActiveReservations(confirmed);
      })
      .catch((err) => console.error('Error fetching reservations:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoomChange = (e) => {
    const { name, value } = e.target;

    if (name === 'roomNumber') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setNewRoomData({ ...newRoomData, [name]: numericValue });
    } else {
      setNewRoomData({ ...newRoomData, [name]: value });
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreatePhysicalRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/api/Rooms`, newRoomData, getAuthConfig());
      alert('Physical room created successfully!');
      setNewRoomData({ roomNumber: '', roomTypeId: '' });
      fetchPhysicalRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create room. Check the console.';
      alert(errorMessage);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(`${apiUrl}/api/RoomTypes`, formData, getAuthConfig())
      .then(() => {
        alert('Room created successfully!');
        window.location.reload();
      })
      .catch((err) => console.error('Error creating room:', err));
  };

  // --- PHYSICAL ROOM TABLE HANDLERS ---
  const normalizeStatus = (status) => {
    if (!status) return 'Available';
    if (status === 'Booked') return 'Occupied';
    if (status === 'Maintenance') return 'Under Maintenance';
    return status;
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const openEditModal = (room) => {
    setEditError(null);
    setEditingRoom({
      id: room.id,
      roomNumber: room.roomNumber?.toString() || '',
      roomTypeId: room.roomTypeId?.toString() || '',
    });
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    setEditError(null);

    if (!editingRoom.roomNumber.trim() || !editingRoom.roomTypeId) {
      setEditError('Room Number and Room Type are required.');
      return;
    }

    setIsEditSaving(true);
    try {
      await axios.put(
        `${apiUrl}/api/Rooms/${editingRoom.id}`,
        {
          roomNumber: editingRoom.roomNumber.trim(),
          roomTypeId: parseInt(editingRoom.roomTypeId, 10),
        },
        getAuthConfig()
      );
      setEditingRoom(null);
      fetchPhysicalRooms();
    } catch (error) {
      setEditError(error.response?.data?.message || 'Failed to update physical room.');
    } finally {
      setIsEditSaving(false);
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Are you sure you want to delete Room ${room.roomNumber}?`)) return;

    try {
      await axios.delete(`${apiUrl}/api/Rooms/${room.id}`, getAuthConfig());
      fetchPhysicalRooms();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete physical room.');
    }
  };

  const filteredPhysicalRooms = physicalRooms
    .filter((room) => {
      const matchesSearch = room.roomNumber
        ?.toString()
        .toLowerCase()
        .includes(roomSearch.toLowerCase());
      const matchesType =
        typeFilter === 'All' || String(room.roomTypeId) === String(typeFilter);
      const matchesStatus =
        statusFilter === 'All' || normalizeStatus(room.status) === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.key === 'roomNumber') {
        return (
          a.roomNumber
            .toString()
            .localeCompare(b.roomNumber.toString(), undefined, { numeric: true }) * dir
        );
      }
      return (a.roomType || '').localeCompare(b.roomType || '') * dir;
    });

  // --- UPGRADE LOGIC ---
  const getAvailablePhysicalRooms = () => {
    if (!upgradeData.reservationId || !upgradeData.targetRoomTypeId) return [];

    const targetRes = activeReservations.find((r) => r.id === parseInt(upgradeData.reservationId));
    if (!targetRes) return [];

    const checkIn = new Date(targetRes.checkInDate);
    const checkOut = new Date(targetRes.checkOutDate);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    const roomsOfType = physicalRooms.filter(
      (r) =>
        r.roomTypeId === parseInt(upgradeData.targetRoomTypeId) ||
        r.RoomTypeId === parseInt(upgradeData.targetRoomTypeId)
    );

    return roomsOfType.filter((room) => {
      const isBooked = activeReservations.some((otherRes) => {
        if (otherRes.id === targetRes.id) return false;
        if (otherRes.status === 'Cancelled') return false;
        if (otherRes.roomId !== room.id) return false;

        const otherIn = new Date(otherRes.checkInDate);
        const otherOut = new Date(otherRes.checkOutDate);
        otherIn.setHours(0, 0, 0, 0);
        otherOut.setHours(0, 0, 0, 0);

        return checkIn < otherOut && checkOut > otherIn;
      });

      return !isBooked;
    });
  };

  const availableRoomsForUpgrade = getAvailablePhysicalRooms();

  const handleUpgradeSubmit = async (e) => {
    e.preventDefault();

    if (!upgradeData.targetRoomId) {
      alert('Please select a specific physical room number.');
      return;
    }

    try {
      await axios.patch(
        `${apiUrl}/api/Reservations/${upgradeData.reservationId}/upgrade`,
        { targetRoomId: parseInt(upgradeData.targetRoomId) },
        getAuthConfig()
      );

      alert('Room changed successfully! The old room is now available.');
      window.location.reload();
    } catch (error) {
      console.error('Error upgrading room:', error);
      alert(error.response?.data?.message || 'Failed to change room.');
    }
  };

  return (
    <div className="hb-page" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* HEADER SECTION */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '32px', margin: '0 0 8px 0', fontWeight: 700 }}>
          Manage Rooms
        </h2>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: '16px' }}>
          Create categories, assign physical rooms, and manage guest upgrades.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* LEFT COLUMN: Creation Forms */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Create New Room Type */}
          <div style={cardStyle}>
            <h3 style={sectionTitleStyle}>
              <FaPlusCircle color={COLORS.emerald} /> Create New Room Type
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>
                  <FaTag color={COLORS.muted} /> Room Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="hb-input"
                  style={inputStyle}
                  placeholder="e.g. Presidential Suite"
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>
                    <FaMoneyBillWave color={COLORS.muted} /> Base Price (₱)
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    required
                    className="hb-input"
                    style={inputStyle}
                    placeholder="e.g. 1500"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>
                    <FaUsers color={COLORS.muted} /> Capacity (Pax)
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    className="hb-input"
                    style={inputStyle}
                    placeholder="e.g. 2"
                  />
                </div>
              </div>

              <button type="submit" className="hb-btn-primary" style={primaryButtonStyle}>
                Save Room Type
              </button>
            </form>
          </div>

          {/* Create Physical Room */}
          <div style={cardStyle}>
            <h3 style={sectionTitleStyle}>
              <FaDoorClosed color={COLORS.emerald} /> Create Physical Room
            </h3>
            <form onSubmit={handleCreatePhysicalRoom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>
                  <FaHashtag color={COLORS.muted} /> Room Number
                </label>
                <input
                  type="text"
                  name="roomNumber"
                  value={newRoomData.roomNumber}
                  onChange={handleRoomChange}
                  placeholder="e.g. 101"
                  required
                  className="hb-input"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <FaBed color={COLORS.muted} /> Assign Room Type
                </label>
                <select
                  name="roomTypeId"
                  value={newRoomData.roomTypeId}
                  onChange={handleRoomChange}
                  required
                  className="hb-select"
                  style={inputStyle}
                >
                  <option value="" disabled>
                    -- Select a Room Type --
                  </option>
                  {rooms.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} (₱{type.basePrice})
                    </option>
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
                <label style={labelStyle}>
                  <FaUserEdit color={COLORS.muted} /> Select Customer Reservation
                </label>
                <select
                  value={upgradeData.reservationId}
                  onChange={(e) => setUpgradeData({ ...upgradeData, reservationId: e.target.value, targetRoomTypeId: '', targetRoomId: '' })}
                  required
                  className="hb-select"
                  style={inputStyle}
                >
                  <option value="">-- Select Reservation --</option>
                  {activeReservations.map((res) => {
                    const actualRoom = physicalRooms.find((r) => r.id === res.roomId);
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
                <label style={labelStyle}>
                  <FaTag color={COLORS.muted} /> Select Target Room Type
                </label>
                <select
                  value={upgradeData.targetRoomTypeId}
                  onChange={(e) => setUpgradeData({ ...upgradeData, targetRoomTypeId: e.target.value, targetRoomId: '' })}
                  required
                  className="hb-select"
                  style={inputStyle}
                >
                  <option value="">-- Select Room Type --</option>
                  {rooms.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} (₱{type.basePrice})
                    </option>
                  ))}
                </select>
              </div>

              {upgradeData.targetRoomTypeId && (
                <div style={{ padding: '15px', backgroundColor: COLORS.emeraldSoft, borderRadius: '8px', border: `1px solid ${COLORS.emeraldBorder}` }}>
                  <label style={{ ...labelStyle, color: COLORS.emeraldDark }}>
                    <FaDoorClosed /> Available Physical Rooms
                  </label>
                  <select
                    value={upgradeData.targetRoomId}
                    onChange={(e) => setUpgradeData({ ...upgradeData, targetRoomId: e.target.value })}
                    required
                    className="hb-select"
                    style={{ ...inputStyle, border: `2px solid ${COLORS.emerald}`, backgroundColor: 'white' }}
                  >
                    <option value="">-- Choose Exact Room Number --</option>
                    {availableRoomsForUpgrade.length === 0 ? (
                      <option value="" disabled>
                        No rooms available for these dates!
                      </option>
                    ) : (
                      availableRoomsForUpgrade.map((r) => (
                        <option key={r.id} value={r.id}>
                          Room {r.roomNumber}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="hb-btn-brass"
                style={{ ...primaryButtonStyle, backgroundColor: COLORS.brassDark, boxShadow: '0 4px 6px rgba(154,123,50,0.2)', marginTop: '5px' }}
              >
                Confirm Room Change
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* PHYSICAL ROOM MANAGEMENT TABLE */}
      <div style={{ ...cardStyle, marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '15px' }}>
          <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaDoorClosed color={COLORS.emerald} /> Physical Room Management
          </h3>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <FaSearch color={COLORS.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }} />
              <input
                type="text"
                placeholder="Search room number..."
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                className="hb-input"
                style={{ ...inputStyle, padding: '10px 12px 10px 36px', width: '200px', fontSize: '14px' }}
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="hb-select"
              style={{ ...inputStyle, padding: '10px 12px', width: '170px', fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="All">All Room Types</option>
              {rooms.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="hb-select"
              style={{ ...inputStyle, padding: '10px 12px', width: '175px', fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
          </div>
        </div>

        {filteredPhysicalRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: COLORS.muted, fontSize: '15px' }}>
            {physicalRooms.length === 0
              ? 'No physical rooms created yet.'
              : 'No rooms match your search or filters.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: COLORS.pageBg, color: COLORS.text, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>
                  <th onClick={() => handleSort('roomNumber')} style={{ ...thStyle, cursor: 'pointer' }}>
                    Room Number <FaSort style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                  </th>
                  <th onClick={() => handleSort('roomType')} style={{ ...thStyle, cursor: 'pointer' }}>
                    Room Type <FaSort style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                  </th>
                  <th style={thStyle}>Base Price (₱)</th>
                  <th style={thStyle}>Capacity (Pax)</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPhysicalRooms.map((room) => {
                  const displayStatus = normalizeStatus(room.status);
                  const statusColors =
                    {
                      Available: { bg: COLORS.emeraldSoft, color: COLORS.emeraldDark },
                      Occupied: { bg: COLORS.blueSoft, color: COLORS.blue },
                      'Under Maintenance': { bg: COLORS.roseSoft, color: COLORS.rose },
                    }[displayStatus] || { bg: COLORS.pageBg, color: COLORS.text };

                  return (
                    <tr key={room.id} className="hb-room-row" style={{ borderBottom: `1px solid ${COLORS.border}`, transition: 'background-color 0.15s' }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: COLORS.ink }}>
                        Room {room.roomNumber}
                      </td>
                      <td style={tdStyle}>{room.roomType || '—'}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: COLORS.emerald }}>
                        ₱{Number(room.pricePerNight || 0).toLocaleString()}
                      </td>
                      <td style={tdStyle}>{room.capacity ?? '—'} Pax</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            backgroundColor: statusColors.bg,
                            color: statusColors.color,
                            padding: '5px 12px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'inline-block',
                          }}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(room)}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: COLORS.blueSoft,
                              color: COLORS.blue,
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRoom(room)}
                            style={{
                              padding: '7px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: COLORS.roseSoft,
                              color: COLORS.rose,
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT PHYSICAL ROOM MODAL */}
      {editingRoom && (
        <div
          onClick={() => setEditingRoom(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(13,43,38,0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ ...cardStyle, width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '20px' }}>
                Edit Physical Room
              </h3>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="hb-close-modal"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.muted, fontSize: '18px' }}
              >
                <FaTimes />
              </button>
            </div>

            {editError && (
              <div style={{ padding: '12px 15px', marginBottom: '18px', borderRadius: '8px', backgroundColor: COLORS.roseSoft, color: COLORS.rose, borderLeft: `4px solid ${COLORS.rose}`, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
                <FaInfoCircle /> {editError}
              </div>
            )}

            <form onSubmit={handleUpdateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={labelStyle}>
                  <FaHashtag color={COLORS.muted} /> Room Number
                </label>
                <input
                  type="text"
                  required
                  value={editingRoom.roomNumber}
                  onChange={(e) =>
                    setEditingRoom({ ...editingRoom, roomNumber: e.target.value.replace(/[^0-9]/g, '') })
                  }
                  className="hb-input"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>
                  <FaBed color={COLORS.muted} /> Assign Room Type
                </label>
                <select
                  required
                  value={editingRoom.roomTypeId}
                  onChange={(e) => setEditingRoom({ ...editingRoom, roomTypeId: e.target.value })}
                  className="hb-select"
                  style={inputStyle}
                >
                  <option value="" disabled>
                    -- Select a Room Type --
                  </option>
                  {rooms.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} (₱{type.basePrice})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: 'white',
                    color: COLORS.text,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditSaving}
                  className="hb-btn-primary"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isEditSaving ? '#adb5bd' : COLORS.emerald,
                    color: COLORS.ivory,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {isEditSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MATRIX MODAL */}
      {isMatrixOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(13,43,38,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '0', borderRadius: '12px', width: '95%', maxWidth: '1100px', boxShadow: '0 10px 30px rgba(13,43,38,0.25)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.pageBg, padding: '20px 25px', borderBottom: `1px solid ${COLORS.border}` }}>
              <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", color: COLORS.ink, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaCalendarDay color={COLORS.emerald} /> Room Availability Matrix
              </h3>
              <button
                onClick={() => setIsMatrixOpen(false)}
                className="hb-close-modal"
                style={{ background: 'transparent', border: 'none', color: COLORS.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', transition: 'color 0.15s' }}
              >
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
  border: `1px solid ${COLORS.border}`,
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
  paddingBottom: '15px',
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: '600',
  color: COLORS.text,
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
  transition: 'border-color 0.15s, box-shadow 0.15s',
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
  width: '100%',
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
  transition: 'background-color 0.15s, border-color 0.15s',
};

const thStyle = {
  padding: '14px 16px',
  fontWeight: 700,
};

const tdStyle = {
  padding: '14px 16px',
  fontSize: '14px',
  color: COLORS.text,
};