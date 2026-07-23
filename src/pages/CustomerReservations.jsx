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

export default function CustomerReservations() {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5
  
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

  // 1. First, filter the list based on the dropdown selection
  const filteredReservations = reservations.filter(res => {
    if (filterStatus === 'All') return true;
   return res.status === filterStatus || res.paymentStatus === filterStatus;
  });

  // 2. Then, chop the filtered list into the correct page size
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // THIS is the array you will map over in your HTML!
  const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  
  // 3. Calculate total pages for the buttons
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>My Reservation History</h2>
<div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <strong>Filter by Status:</strong>
        <select 
          value={filterStatus} 
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1); // Reset to page 1 when changing filters!
          }}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="All">All Reservations</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Paid">Paid</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      {isLoading ? (
        <p>Loading your history...</p>
      ) : reservations.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#666', fontSize: '18px' }}>You don't have any reservations yet.</p>
        </div>
      ) : (

        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {currentItems.map(res => (
            <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#007bff' }}>Room #{res.roomNumber || res.roomId}</h4>
                <div style={{ fontSize: '14px', color: '#555' }}>
                  <strong>Check-in:</strong> {formatBeautifulDate(res.checkInDate)} | <strong>Check-out:</strong> {formatBeautifulDate(res.checkOutDate)}
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
      )}
    </div>
  );
}