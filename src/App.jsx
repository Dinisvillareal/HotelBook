import { useEffect, useState } from 'react';
//import axios from 'axios'; // We will leave this here for later!

function App() {
  // 2. Move dummy data up to the top
  const dummyData = [
    { id: 1, name: "Standard", basePrice: 99.00, capacity: 2 },
    { id: 2, name: "Deluxe", basePrice: 150.00, capacity: 2 },
    { id: 3, name: "Suite", basePrice: 299.00, capacity: 4 },
    { id: 4, name: "Penthouse", basePrice: 950.00, capacity: 6 }
  ];

  // 3. Initialize state DIRECTLY with the dummy data (No useEffect needed!)
  const [roomTypes] = useState(dummyData);
  
  // const [error, setError] = useState(null); // Commented out for now!

  /* === KEEP THIS SAFE FOR LATER ===
  useEffect(() => {
    axios.get('https://localhost:7243/api/RoomTypes')
      .then(response => {
        setRoomTypes(response.data); 
      })
      .catch(err => {
        console.error("API Error:", err);
        setError("Could not connect to the API.");
      });
  }, []);
  =================================== */

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>HotelBook Admin Dashboard</h1>
      
      {roomTypes.length === 0 ? (
        <p>Loading rooms...</p>
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