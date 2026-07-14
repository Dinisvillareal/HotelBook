import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CustomerReservations() {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    // We hit the new endpoint we just created!
    axios.get(`${apiUrl}/api/Reservations/my-reservations`, authConfig)
      .then(res => {
        setReservations(res.data);
      })
      .catch(err => console.error("Could not fetch reservations", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>My Reservation History</h2>

      {isLoading ? (
        <p>Loading your history...</p>
      ) : reservations.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666', fontSize: '18px' }}>You don't have any reservations yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {reservations.map(res => (
            <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#007bff' }}>Reservation #{res.id}</h4>
                <div style={{ fontSize: '14px', color: '#555' }}>
                  <strong>Check-in:</strong> {res.checkInDate} | <strong>Check-out:</strong> {res.checkOutDate}
                </div>
                <div style={{ fontSize: '14px', color: '#555', marginTop: '5px' }}>
                  <strong>Total:</strong> ₱{res.totalPrice.toFixed(2)} 
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                {/* Status Badges */}
                <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: res.status === 'Confirmed' ? '#d4edda' : '#fff3cd', color: res.status === 'Confirmed' ? '#155724' : '#856404' }}>
                  {res.status}
                </span>
                
                <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: res.paymentStatus === 'Paid' ? '#d1ecf1' : '#f8d7da', color: res.paymentStatus === 'Paid' ? '#0c5460' : '#721c24' }}>
                  Payment: {res.paymentStatus || 'Pending'}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}