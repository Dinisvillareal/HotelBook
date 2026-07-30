import { useState, useEffect } from 'react';
import axios from 'axios';
import RoomMatrix from '../components/RoomMatrix'; 

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
  
  // 1. ADDED targetRoomId TO TRACK THE EXACT PHYSICAL ROOM
  const [upgradeData, setUpgradeData] = useState({
    reservationId: '',
    targetRoomTypeId: '',
    targetRoomId: '' 
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchRooms = () => {
    axios.get(`${apiUrl}/api/RoomTypes`)
      .then(response => {
        if (Array.isArray(response.data)) setRooms(response.data);
        else if (response.data && Array.isArray(response.data.$values)) setRooms(response.data.$values);
      })
      .catch(err => console.error("Error fetching rooms:", err));
  };

  useEffect(() => {
    fetchRooms(); 
    const token = localStorage.getItem('jwtToken');
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
      const token = localStorage.getItem('jwtToken');
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
    const token = localStorage.getItem('jwtToken');
    axios.post(`${apiUrl}/api/RoomTypes`, formData, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        alert("Room created successfully!");
        window.location.reload(); 
      })
      .catch(err => console.error("Error creating room:", err));
  };

  // 2. THE MATH ENGINE: Find empty physical rooms for the chosen dates
  const getAvailablePhysicalRooms = () => {
    if (!upgradeData.reservationId || !upgradeData.targetRoomTypeId) return [];

    const targetRes = activeReservations.find(r => r.id === parseInt(upgradeData.reservationId));
    if (!targetRes) return [];

    const checkIn = new Date(targetRes.checkInDate);
    const checkOut = new Date(targetRes.checkOutDate);
    checkIn.setHours(0,0,0,0);
    checkOut.setHours(0,0,0,0);

    // Filter physical rooms by the chosen type
    const roomsOfType = physicalRooms.filter(r => 
      r.roomTypeId === parseInt(upgradeData.targetRoomTypeId) || 
      r.RoomTypeId === parseInt(upgradeData.targetRoomTypeId) // Fallback for C# casing
    );

    // Filter out rooms that are booked during the guest's dates
    return roomsOfType.filter(room => {
      const isBooked = activeReservations.some(otherRes => {
        if (otherRes.id === targetRes.id) return false; // Ignore their current room
        if (otherRes.status === "Cancelled") return false;
        if (otherRes.roomId !== room.id) return false;

        const otherIn = new Date(otherRes.checkInDate);
        const otherOut = new Date(otherRes.checkOutDate);
        otherIn.setHours(0,0,0,0);
        otherOut.setHours(0,0,0,0);

        // Standard overlapping date logic
        return (checkIn < otherOut) && (checkOut > otherIn);
      });

      return !isBooked;
    });
  };

  const availableRoomsForUpgrade = getAvailablePhysicalRooms();

  const handleUpgradeSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure they picked an exact room
    if (!upgradeData.targetRoomId) {
      alert("Please select a specific physical room number.");
      return;
    }

    const token = localStorage.getItem('jwtToken');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    try {
      // 3. SEND targetRoomId INSTEAD OF targetRoomTypeId
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
    <div>
      <h2>Manage Rooms</h2>
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        
        {/* LEFT SIDE: Creation Forms */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3>Create New Room Type</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Room Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} placeholder="e.g. Presidential Suite" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Base Price (₱)</label>
                <input type="number" name="basePrice" value={formData.basePrice} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} placeholder="e.g. 1500" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Capacity (Pax)</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} placeholder="e.g. 2" />
              </div>
              <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Save Room
              </button>
            </form>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3>Create Physical Room</h3>
            <form onSubmit={handleCreatePhysicalRoom}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Room Number</label>
                <input type="text" name="roomNumber" value={newRoomData.roomNumber} onChange={handleRoomChange} placeholder="e.g. 101" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Assign Room Type</label>
                <select name="roomTypeId" value={newRoomData.roomTypeId} onChange={handleRoomChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="">-- Select a Room Type --</option>
                  {rooms.map(type => (
                    <option key={type.id} value={type.id}>{type.name} (₱{type.basePrice})</option>
                  ))}
                </select>
              </div>
              <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Add Physical Room
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE: Upgrade Form */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', height: 'fit-content' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <button type="button" onClick={() => setIsMatrixOpen(true)} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              📅 View Availability Matrix
            </button>
          </div>

          <h3 style={{ marginTop: '0', textAlign: 'center' }}>Change / Upgrade Room</h3>

          <form onSubmit={handleUpgradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Select Customer Reservation</label>
              <select value={upgradeData.reservationId} onChange={(e) => setUpgradeData({ ...upgradeData, reservationId: e.target.value, targetRoomTypeId: '', targetRoomId: '' })} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
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
              <label style={{ display: 'block', marginBottom: '5px' }}>Select Target Room Type</label>
              <select value={upgradeData.targetRoomTypeId} onChange={(e) => setUpgradeData({ ...upgradeData, targetRoomTypeId: e.target.value, targetRoomId: '' })} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option value="">-- Select Room Type --</option>
                {rooms.map(type => (
                  <option key={type.id} value={type.id}>{type.name} (₱{type.basePrice})</option>
                ))}
              </select>
            </div>

            {/* 4. THE BRAND NEW THIRD DROPDOWN FOR EXACT ROOM NUMBER */}
            {upgradeData.targetRoomTypeId && (
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#007bff', fontWeight: 'bold' }}>Available Physical Rooms</label>
                <select value={upgradeData.targetRoomId} onChange={(e) => setUpgradeData({ ...upgradeData, targetRoomId: e.target.value })} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '2px solid #007bff' }}>
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

            <button type="submit" style={{ padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
              Confirm Room Change
            </button>
          </form>
        </div>
      </div>

      {isMatrixOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '1000px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Room Availability Matrix</h3>
              <button onClick={() => setIsMatrixOpen(false)} style={{ padding: '5px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
            </div>
            <RoomMatrix />
          </div>
        </div>
      )}
    </div>
  );
}