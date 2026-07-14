import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManagePrices() {
  // --- STATE FOR VOUCHERS ---
  const [voucherData, setVoucherData] = useState({ code: '', discountPercentage: '' });
  const [voucherMessage, setVoucherMessage] = useState(null);
  const [isVoucherLoading, setIsVoucherLoading] = useState(false);

  // --- STATE FOR ROOM PRICES ---
  const [roomTypes, setRoomTypes] = useState([]);
  const [priceMessage, setPriceMessage] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

 const fetchRoomTypes = () => {
    axios.get(`${apiUrl}/api/RoomTypes`, authConfig)
      .then(res => setRoomTypes(res.data))
      .catch(err => console.error("Could not fetch room types", err));
  };

  // 2. THEN, call the function inside useEffect!
  useEffect(() => {
    fetchRoomTypes();
  }, []);

  // --- HANDLERS ---
  const handleVoucherSubmit = (e) => {
    e.preventDefault();
    setIsVoucherLoading(true);
    // Replace with your actual Voucher creation endpoint
    axios.post(`${apiUrl}/api/Payments/vouchers`, voucherData, authConfig)
      .then(() => {
        setVoucherMessage({ type: 'success', text: 'Voucher created successfully!' });
        setVoucherData({ code: '', discountPercentage: '' });
      })
      .catch(err => setVoucherMessage({ type: 'error', text: 'Failed to create voucher.' }))
      .finally(() => setIsVoucherLoading(false));
  };

  const handlePriceChange = (id, newPrice) => {
    // Update the price in the local React state as the user types
    setRoomTypes(roomTypes.map(rt => 
      rt.id === id ? { ...rt, basePrice: newPrice } : rt
    ));
  };

  const handleUpdatePrice = (id, newPrice) => {
    setPriceMessage(null);
    const priceToUpdate = parseFloat(newPrice);

    // Send the new price to the C# backend!
    axios.patch(`${apiUrl}/api/RoomTypes/${id}/price`, { basePrice: priceToUpdate }, authConfig)
      .then(() => {
        setPriceMessage({ type: 'success', text: 'Price updated successfully!' });
        fetchRoomTypes(); // Refresh to ensure we have the latest DB data
      })
      .catch(err => {
        setPriceMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update price.' });
      });
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#007bff', marginBottom: '30px', textAlign: 'center' }}>Manage Pricing & Discounts</h2>

      {/* TWO COLUMN DASHBOARD LAYOUT */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: CREATE VOUCHER */}
        <div style={{ flex: '1 1 400px', backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Create Discount Voucher</h3>
          
          {voucherMessage && (
            <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: voucherMessage.type === 'success' ? '#d4edda' : '#f8d7da', color: voucherMessage.type === 'success' ? '#155724' : '#721c24' }}>
              {voucherMessage.text}
            </div>
          )}

          <form onSubmit={handleVoucherSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Voucher Code</label>
              <input type="text" placeholder="e.g., HOLIDAY25" value={voucherData.code} onChange={(e) => setVoucherData({...voucherData, code: e.target.value.toUpperCase()})} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Discount Percentage (%)</label>
              <input type="number" step="0.01" placeholder="e.g., 15.5" value={voucherData.discountPercentage} onChange={(e) => setVoucherData({...voucherData, discountPercentage: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <button type="submit" disabled={isVoucherLoading} style={{ marginTop: '10px', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isVoucherLoading ? 'Creating...' : 'Create Voucher'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: EDIT ROOM PRICES */}
        <div style={{ flex: '1 1 500px', backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Current Room Prices</h3>

          {priceMessage && (
            <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: priceMessage.type === 'success' ? '#d4edda' : '#f8d7da', color: priceMessage.type === 'success' ? '#155724' : '#721c24' }}>
              {priceMessage.text}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {roomTypes.map(rt => (
              <div key={rt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', border: '1px solid #eee', borderRadius: '6px', backgroundColor: '#f8f9fa' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#444' }}>
                  {rt.name || rt.typeName} {/* Fallback depending on your C# DTO name */}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#555' }}>₱</span>
                  <input 
                    type="number" 
                    value={rt.basePrice} 
                    onChange={(e) => handlePriceChange(rt.id, e.target.value)}
                    style={{ width: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'right' }} 
                  />
                  <button 
                    onClick={() => handleUpdatePrice(rt.id, rt.basePrice)}
                    style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
            
            {roomTypes.length === 0 && (
              <p style={{ textAlign: 'center', color: '#777', fontStyle: 'italic' }}>Loading room types...</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}