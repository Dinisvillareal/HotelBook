import { useState, useEffect } from 'react';
import axios from 'axios';

const formatBeautifulDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function ManageReservations() {
  const [reservations, setReservations] = useState([]);
  const [viewModalData, setViewModalData] = useState(null);
  const [error, setError] = useState(null);
  
  // SEPARATE FILTER STATES
  const [bookingFilter, setBookingFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchReservations = () => {
    axios.get(`${apiUrl}/api/Reservations`, authConfig)
      .then(res => {
        setReservations(res.data);
      })
      .catch(err => console.error("Error fetching reservations", err));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleApplyVoucher = (id) => {
    const code = prompt("Enter your discount voucher code:");
    if (!code) return;

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

  // FILTER LOGIC MATCHING BOTH DROPDOWNS
  const filteredReservations = reservations.filter(res => {
    const matchesBooking = bookingFilter === 'All' || res.status === bookingFilter;
    const matchesPayment = paymentFilter === 'All' || (res.paymentStatus || 'Pending') === paymentFilter;
    return matchesBooking && matchesPayment;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  return (
    <div>
      <h2>Manage Reservations</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* SEPARATE FILTER DROPDOWNS */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Booking Status Dropdown */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <strong>Booking Status:</strong>
          <select 
            value={bookingFilter} 
            onChange={(e) => {
              setBookingFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="All">All Bookings</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Status Dropdown */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <strong>Payment Status:</strong>
          <select 
            value={paymentFilter} 
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="All">All Payments</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

      </div>

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
              {currentItems.map(res => (
                <tr key={res.id}>
                  <td>#{res.id}</td>
                  <td>{res.guestName}</td>
                  <td>{formatBeautifulDate(res.checkInDate)}</td>
                  <td>{formatBeautifulDate(res.checkOutDate)}</td>
                  <td>${res.totalPrice}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: res.paymentStatus === 'Paid' ? '#d4edda' : res.paymentStatus === 'Cancelled' ? '#f8d7da' : '#fff3cd',
                      color: res.paymentStatus === 'Paid' ? '#155724' : res.paymentStatus === 'Cancelled' ? '#721c24' : '#856404'
                    }}>
                      {res.paymentStatus || 'Pending'}
                    </span>
                  </td>
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

      {/* VIEW RESERVATION MODAL */}
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
              Room #{viewModalData.roomNumber || viewModalData.roomId} Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div><strong>Guest Name:</strong> {viewModalData.guestName}</div>
              <div><strong>Room Assigned:</strong> Room {viewModalData.roomNumber} ({viewModalData.roomTypeName})</div>
              <div><strong>Check-In:</strong> {formatBeautifulDate(viewModalData.checkInDate)}</div>
              <div><strong>Check-Out:</strong> {formatBeautifulDate(viewModalData.checkOutDate)}</div>
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

      {/* PAGINATION CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        >
          Previous
        </button>
        
        <span>Page {currentPage} of {totalPages || 1}</span>
        
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          style={{ padding: '8px 16px', cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}