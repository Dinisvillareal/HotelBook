import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateReservation() {
  const [rooms, setRooms] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [formData, setFormData] = useState({
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    guestsCount: 1
  });
  
  
  // NEW: State to track the voucher code
  const [voucherCode, setVoucherCode] = useState('');
  
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL; // Update if your port is different
  const token = localStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    // Fetch Rooms
    axios.get(`${apiUrl}/api/Rooms`, authConfig)
      .then(res => setRooms(res.data))
      .catch(err => console.error("Could not fetch rooms:", err));

    // NEW: Fetch Vouchers
   axios.get(`${apiUrl}/api/Payments/vouchers`, authConfig)
      .then(res => {
        console.log("VOUCHERS FROM C#:", res.data); // <-- ADD THIS!
        setVouchers(res.data);
      })
      .catch(err => console.error("Could not fetch vouchers:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVoucherChange = (e) => {
    setVoucherCode(e.target.value.toUpperCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Note: We are attaching the voucherCode to the payload!
    // Make sure your C# CreateReservationDto expects this if you want to save it.
    const payload = { ...formData, voucherCode: voucherCode };

    axios.post(`${apiUrl}/api/Reservations`, payload, authConfig)
      .then(response => {
        setMessage({ type: 'success', text: 'Reservation booked successfully!' });
        setTimeout(() => navigate('/reservations'), 2000);
      })
      .catch(err => {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to book room.' });
        setIsLoading(false);
      });
  };

  // --- DYNAMIC MATH ENGINE --- //
  
  const selectedRoom = rooms.find(room => room.id === parseInt(formData.roomId));
  
  // Failsafe: Looks for basePrice or pricePerNight just in case C# changed the name!
  const baseRate = selectedRoom ? (selectedRoom.basePrice || selectedRoom.pricePerNight || 0) : 0; 
  const capacity = selectedRoom ? (selectedRoom.capacity || 2) : 2;

  // Extra Guest Math
  const isExtraCharge = selectedRoom && formData.guestsCount > capacity;
  const extraGuestsCount = isExtraCharge ? (formData.guestsCount - capacity) : 0;
  const extraChargeTotal = extraGuestsCount * 300; // ₱300 per extra person

 const safeUserInput = voucherCode ? voucherCode.trim().toUpperCase() : '';
  
  const foundVoucher = vouchers.find(v => {
    const dbCode = v.code || v.Code; 
    

    return dbCode?.trim().toUpperCase() === safeUserInput; 
  });
  
  const discountPercent = foundVoucher ? (foundVoucher.discountPercentage || foundVoucher.DiscountPercentage || 0) : 0;
  
  // Final Totals
  const subtotal = baseRate + extraChargeTotal;
  const discountAmount = subtotal * (discountPercent / 100);
  const finalPrice = subtotal - discountAmount;

  return (
    <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#007bff', marginBottom: '20px', textAlign: 'center' }}>Book a Room</h2>
      
      {message && (
        <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
          {message.text}
        </div>
      )}

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 1. ROOM DROPDOWN (Cleaned up!) */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>Select Room</label>
            <select name="roomId" value={formData.roomId} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="" disabled>-- Choose a Room --</option>
              {rooms.filter(room => room.status === 'Available').map(room => (
                <option key={room.id} value={room.id}>
                  Room {room.roomNumber} - {room.roomTypeName || room.roomType}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            {/* 2. DATES */}
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>Check-In</label>
              <input type="date" name="checkInDate" value={formData.checkInDate} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>Check-Out</label>
              <input type="date" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
          </div>

          {/* 3. GUESTS & WARNINGS */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>Number of Guests</label>
            <input type="number" name="guestsCount" min="1" max="10" value={formData.guestsCount} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            
            {isExtraCharge && (
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', borderLeft: '4px solid #ffeeba', fontSize: '14px' }}>
                <strong>⚠️ Extra Charge Applies:</strong> This room includes {capacity} guests. An additional ₱300 per extra person will be added.
              </div>
            )}
          </div>

          {/* 4. VOUCHER CODE */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>Discount Voucher (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g., SUMMER20" 
              value={voucherCode} 
              onChange={handleVoucherChange} 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', textTransform: 'uppercase' }} 
            />
          </div>

          {/* 5. DYNAMIC PRICE BREAKDOWN */}
          {selectedRoom && (
            <div style={{ marginTop: '10px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Price Breakdown</h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#555' }}>
                <span>Base Room Rate:</span>
                <span>₱{baseRate.toFixed(2)}</span>
              </div>
              
              {extraChargeTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#d9534f' }}>
                  <span>Extra Guest Charge ({extraGuestsCount} pax):</span>
                  <span>+ ₱{extraChargeTotal.toFixed(2)}</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#28a745' }}>
                  <span>Voucher Discount ({discountPercent}%):</span>
                  <span>- ₱{discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <hr style={{ borderTop: '1px solid #ddd', margin: '15px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', color: '#212529' }}>
                <span>Estimated Total:</span>
                <span>₱{finalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button type="submit" disabled={isLoading} style={{ marginTop: '10px', padding: '15px', backgroundColor: isLoading ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            {isLoading ? 'Processing...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}