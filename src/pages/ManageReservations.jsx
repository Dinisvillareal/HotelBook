import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageReservations() {
  const [reservations, setReservations] = useState([]);
  const [viewModalData, setViewModalData] = useState(null);
  const [error, setError] = useState(null);

  // 1. Set up your variables FIRST so everything else can use them
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  // 2. Create the reusable fetch tool SECOND
  const fetchReservations = () => {
    axios.get(`${apiUrl}/api/Reservations`, authConfig)
      .then(res => {
        setReservations(res.data);
      })
      .catch(err => console.error("Error fetching reservations", err));
  };

  // 3. Call it when the page loads THIRD
  useEffect(() => {
    fetchReservations();
  }, []);
  


  const handleApplyVoucher = (id) => {
    const code = prompt("Enter your discount voucher code:");
    if (!code) return; // User clicked cancel

    axios.patch(`${apiUrl}/api/Payments/${id}/apply-voucher`, { voucherCode: code }, authConfig)
      .then(response => {
        alert(`Success! New Total: $${response.data.newTotal}`);
        fetchReservations();
         
      })
      .catch(err => {
        alert(err.response?.data?.message || "Invalid voucher.");
      });
  };

  const handleProcessPayment = (id) => {
    if (!window.confirm("Are you ready to process this payment?")) return;

    axios.patch(`${apiUrl}/api/Payments/${id}/process`, {}, authConfig)
      .then(() => {
        alert("Payment processed successfully!");
        fetchReservations();
       
      })
      .catch(err => {
        alert(err.response?.data?.message || "Payment failed.");
      });
  };

  const handleCancelReservation = (id) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;

    axios.patch(`${apiUrl}/api/Payments/${id}/cancel`, {}, authConfig)
      .then(() => {
        alert("Reservation cancelled.");
        fetchReservations();
        
      })
      .catch(err => {
        alert(err.response?.data?.message || "Could not cancel.");
      });
  };

  return (
    <div>
      <h2>Manage Reservations</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '20px', overflowX: 'auto' }}>
        {reservations.length === 0 && !error ? (
          <p>There are currently no reservations in the system.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
  <thead>
    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
      <th>ID</th>
      <th>Guest Name</th>
      <th>Check-In</th>
      <th>Check-Out</th>
      <th>Total Price</th>
      <th>Payment Status</th> 
      <th>Actions</th>        
    </tr>
  </thead>
  <tbody>
    {reservations.map(res => (
      <tr key={res.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
        <td style={{ padding: '12px' }}>#{res.id}</td>
        <td>{res.guestName}</td>
        <td>{res.checkInDate}</td>
        <td>{res.checkOutDate}</td>
        <td>${res.totalPrice}</td>
        
        {/* Display the Payment Status (You may need to add this to your DTO!) */}
        <td>
          <span style={{ 
            padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
            backgroundColor: res.paymentStatus === 'Paid' ? '#d4edda' : res.paymentStatus === 'Cancelled' ? '#f8d7da' : '#fff3cd',
            color: res.paymentStatus === 'Paid' ? '#155724' : res.paymentStatus === 'Cancelled' ? '#721c24' : '#856404'
          }}>
            {res.paymentStatus || 'Pending'}
          </span>
        </td>

        {/* Action Buttons */}
        <td>
          <button onClick={() => setViewModalData(res)} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
             View
            </button>
          {res.paymentStatus !== 'Paid' && res.paymentStatus !== 'Cancelled' && (
            <>
              <button onClick={() => handleProcessPayment(res.id)} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Pay</button>
              <button onClick={() => handleApplyVoucher(res.id)} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Voucher</button>
            </>
          )}
          {res.paymentStatus !== 'Cancelled' && (
             <button onClick={() => handleCancelReservation(res.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>
        )}
      </div>
      {/* --- VIEW RESERVATION MODAL --- */}
      {viewModalData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '8px', 
            width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
              Reservation #{viewModalData.id} Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div><strong>Guest Name:</strong> {viewModalData.guestName}</div>
              <div><strong>Room Assigned:</strong> Room {viewModalData.roomNumber} ({viewModalData.roomTypeName})</div>
              <div><strong>Check-In:</strong> {viewModalData.checkInDate}</div>
              <div><strong>Check-Out:</strong> {viewModalData.checkOutDate}</div>
              <div><strong>Total Price:</strong> ${viewModalData.totalPrice}</div>
              <div><strong>Payment Status:</strong> {viewModalData.paymentStatus}</div>
              <div><strong>Booking Status:</strong> {viewModalData.status}</div>
            </div>

            <button 
              onClick={() => setViewModalData(null)} 
              style={{ width: '100%', padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}