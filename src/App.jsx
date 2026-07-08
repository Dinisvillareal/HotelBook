import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  // 1. Create a state variable to hold our data
  const [roomTypes, setRoomTypes] = useState([]);
  const [error, setError] = useState(null);

  // 2. Use 'useEffect' to fetch the data the moment the page loads
  useEffect(() => {
    // Point Axios to your live cloud API!
    axios.get('https://localhost:7243/api/RoomTypes')
      .then(response => {
        setRoomTypes(response.data); // Save the data to state!
      })
      .catch(err => {
        console.error("API Error:", err);
        setError("Could not connect to the API.");
      });
  }, []);

  // 3. Render the data to the screen
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>HotelBook Admin Dashboard</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {roomTypes.length === 0 && !error ? (
        <p>Loading rooms from the cloud...</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {roomTypes.map(room => (
            <div key={room.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
              <h2>{room.name}</h2>
              <p>Base Price: ${room.basePrice}/night</p>
              <p>Capacity: {room.capacity} people</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;