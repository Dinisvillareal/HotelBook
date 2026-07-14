import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Overview() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    axios.get(`${apiUrl}/api/RoomTypes`)
      .then(response => {
        if (Array.isArray(response.data)) setRoomTypes(response.data);
        else if (response.data && Array.isArray(response.data.$values)) setRoomTypes(response.data.$values);
        else setRoomTypes([]);
      })
     .catch(() => setError("Could not connect to backend."));
  }, []);

  return (
    <div>
      <h2>Dashboard Overview</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', marginTop: '20px' }}>
        {roomTypes.map(room => (
          <div key={room.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: 'white' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{room.name}</h3>
            <p style={{ margin: '5px 0' }}>Base Price: ₱{room.basePrice}</p>
            <p style={{ margin: '5px 0' }}>Capacity: {room.capacity} Pax</p>
          </div>
        ))}
      </div>
    </div>
  );
}