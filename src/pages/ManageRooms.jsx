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
const [activeReservations, setActiveReservations] = useState([]);
const [physicalRooms, setPhysicalRooms] = useState([]);
  const [upgradeData, setUpgradeData] = useState({
    reservationId: '',
    targetRoomTypeId: ''
  });

// 2. Add the onChange handler for this specific form
const handleRoomChange = (e) => {
  setNewRoomData({ ...newRoomData, [e.target.name]: e.target.value });
};

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleCreatePhysicalRoom = async (e) => {
    e.preventDefault();
    try {
      // 1. Grab the token specifically for this function
      const token = localStorage.getItem('jwtToken');
      const authConfig = { headers: { Authorization: `Bearer ${token}` } };

      // 2. Make the request
      await axios.post(`${apiUrl}/api/Rooms`, newRoomData, authConfig);
      
      alert("Physical room created successfully!");
      setNewRoomData({ roomNumber: '', roomTypeId: '' }); // Clear the form
      
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Check the console.");
    }
  };

  // 1. Function to grab the latest rooms
  const fetchRooms = () => {
    axios.get(`${apiUrl}/api/RoomTypes`)
      .then(response => {
        if (Array.isArray(response.data)) setRooms(response.data);
        else if (response.data && Array.isArray(response.data.$values)) setRooms(response.data.$values);
      })
      .catch(err => console.error("Error fetching rooms:", err));
  };

  // Run this the moment the page loads
  useEffect(() => { 
    fetchRooms(); // Your existing function

    const token = localStorage.getItem('jwtToken');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };
    
    // 1. Fetch Reservations (Already there)
    axios.get(`${apiUrl}/api/Reservations`, authConfig)
      .then(res => {
        const confirmed = res.data.filter(r => r.status === "Confirmed");
        setActiveReservations(confirmed);
      })
      .catch(err => console.error("Error fetching reservations:", err));

    // 2. NEW: Fetch Physical Rooms so we can look up the real numbers!
    axios.get(`${apiUrl}/api/Rooms`, authConfig)
      .then(res => {
        setPhysicalRooms(res.data.$values || res.data);
      })
      .catch(err => console.error("Error fetching physical rooms:", err));
  }, []);
  
  const handleUpgradeSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('jwtToken');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    try {
      // Send the targetRoomTypeId to your upgrade endpoint
      await axios.patch(`${apiUrl}/api/Reservations/${upgradeData.reservationId}/upgrade`, 
        { targetRoomTypeId: parseInt(upgradeData.targetRoomTypeId) }, 
        authConfig
      );
      
      alert("Room upgraded successfully!");
      window.location.reload(); // Refresh the page to update the lists
    } catch (error) {
      console.error("Error upgrading room:", error);
      alert(error.response?.data?.message || "Failed to upgrade room.");
    }
  };

  // 2. Handle typing in the form
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Submit the new room to the C# backend!
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Grab the token from LocalStorage!
    const token = localStorage.getItem('jwtToken');
    
    // 2. Create the configuration headers
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Attach authConfig as the THIRD parameter in your axios.post call!
    axios.post(`${apiUrl}/api/RoomTypes`, formData, authConfig)
      .then(response => {
        // ... your existing success logic (e.g., clear form, show success message)
        alert("Room created successfully!");
        window.location.reload(); // Refresh to see the new room in the list
      })
      .catch(err => {
        console.error("Error creating room:", err);
        // ... your existing error logic
      });
  };

  return (
    <div>
      <h2>Manage Rooms</h2>
      <RoomMatrix />
      
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        {/* LEFT SIDE: The Creation Form */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', height: 'fit-content' }}>
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
            
            {statusMessage && <p style={{ marginTop: '10px', fontSize: '14px', color: '#007bff' }}>{statusMessage}</p>}
          </form>
        </div>

        {/* RIGHT SIDE: The Live Room List */}
       <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', height: 'fit-content' }}>
          <h3>Upgrade Customer Room</h3>
          
          <form onSubmit={handleUpgradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Select Customer Reservation</label>
              <select 
                value={upgradeData.reservationId} 
                onChange={(e) => setUpgradeData({ ...upgradeData, reservationId: e.target.value })} 
                required 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">-- Select Reservation --</option>
                
                {activeReservations.map(res => {
                  // 1. Find the matching room in our physicalRooms array
                  const actualRoom = physicalRooms.find(r => r.id === res.roomId);
                  // 2. Grab the string roomNumber (or fallback to the ID if it fails)
                  const displayRoomNumber = actualRoom ? actualRoom.roomNumber : res.roomId;

                  return (
                    <option key={res.id} value={res.id}>
                      Reservation #{res.id} (Current Room: {displayRoomNumber})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Upgrade to Room Type</label>
              <select 
                value={upgradeData.targetRoomTypeId} 
                onChange={(e) => setUpgradeData({ ...upgradeData, targetRoomTypeId: e.target.value })} 
                required 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">-- Select New Room Type --</option>
                {/* 'rooms' here is your existing state holding the Room Types from the left side! */}
                {rooms.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} (₱{type.basePrice})
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Confirm Upgrade
            </button>
          </form>
        </div>
      </div>
      {/* --- NEW FORM: Create Physical Room --- */}
<div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
  <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#555' }}>Create Physical Room</h3>
  
  <form onSubmit={handleCreatePhysicalRoom}>
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '5px' }}>Room Number</label>
      <input 
        type="text" 
        name="roomNumber" 
        value={newRoomData.roomNumber} 
        onChange={handleRoomChange} 
        placeholder="e.g. 101" 
        required 
        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
    </div>

    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '5px' }}>Assign Room Type</label>
      <select 
        name="roomTypeId" 
        value={newRoomData.roomTypeId} 
        onChange={handleRoomChange} 
        required
        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        <option value="">-- Select a Room Type --</option>
        {/* Loop through your fetched room types to populate the dropdown */}
        {rooms.map(type => (
          <option key={type.id} value={type.id}>
            {type.name} (₱{type.basePrice})
          </option>
        ))}
      </select>
    </div>

    <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
      Add Physical Room
    </button>
  </form>
</div>
    </div>
    
  );
}