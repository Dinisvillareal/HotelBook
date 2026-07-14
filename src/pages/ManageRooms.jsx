import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({ name: '', basePrice: '', capacity: '' });
  const [statusMessage, setStatusMessage] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL;

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
  useEffect(() => { fetchRooms(); }, []);

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
        <div style={{ flex: 1 }}>
          <h3>Current Rooms</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {rooms.length === 0 ? <p>No rooms found in the database.</p> : rooms.map(room => (
              <div key={room.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
                <strong style={{ fontSize: '18px' }}>{room.name}</strong>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>₱{room.basePrice} / night • {room.capacity} Pax</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}