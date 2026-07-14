import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CustomerOverview() {
  const [roomTypes, setRoomTypes] = useState([]);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    // Fetching the Room Types to use as a catalog
    axios.get(`${apiUrl}/api/RoomTypes`, authConfig)
      .then(res => setRoomTypes(res.data))
      .catch(err => console.error("Could not fetch catalog", err));
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#333', marginBottom: '10px' }}>Welcome to HotelBook</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>Browse our available room types and find the perfect stay.</p>

      {/* CSS GRID FOR BEAUTIFUL CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        
        {roomTypes.map(rt => (
          <div key={rt.id} style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Fake Image Placeholder */}
            <div style={{ height: '150px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', fontSize: '40px' }}>
              🏨
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{rt.name || rt.typeName}</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#555' }}>
                <span><strong>Capacity:</strong> {rt.capacity} Pax</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>₱{rt.basePrice.toFixed(2)} <span style={{ fontSize: '12px', color: '#888' }}>/night</span></span>
              </div>

              {/* Pushes the button to the bottom of the card */}
              <button 
                onClick={() => navigate('/customer/book')}
                style={{ marginTop: 'auto', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
              >
                Book This Room
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}