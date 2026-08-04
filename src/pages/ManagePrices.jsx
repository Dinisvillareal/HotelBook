import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTags, FaTicketAlt, FaMoneyBillWave, FaSave, FaCheckCircle, FaInfoCircle, FaPercent } from 'react-icons/fa';

// ---- Design tokens (matches Login/Register/AdminLayout/CustomerLayout/CreateReservation/Overview) ----
const COLORS = {
  ink: '#0D2B26',
  emerald: '#1F5D4F',
  emeraldDark: '#123028',
  emeraldSoft: '#E5EFEA',
  brass: '#C6A15B',
  brassDark: '#9A7B32',
  ivory: '#FBF8F1',
  pageBg: '#F6F4EE',
  border: '#e5e2da',
  muted: '#8a8f89',
  text: '#495057',
  rose: '#B3413B',
  roseSoft: '#FFF2F1',
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

  .hb-page * { box-sizing: border-box; }

  .hb-input:focus {
    outline: none;
    border-color: ${COLORS.emerald} !important;
    box-shadow: 0 0 0 3px rgba(31,93,79,0.14);
  }

  .hb-submit:not(:disabled):hover {
    background-color: ${COLORS.emeraldDark} !important;
  }

  .hb-save-btn:hover {
    background-color: ${COLORS.emeraldDark} !important;
  }

  .hb-price-row:hover {
    box-shadow: 0 4px 12px rgba(13,43,38,0.06);
  }
`;

export default function ManagePrices() {
  // --- STATE FOR VOUCHERS ---
  const [voucherData, setVoucherData] = useState({ code: '', discountPercentage: '' });
  const [voucherMessage, setVoucherMessage] = useState(null);
  const [isVoucherLoading, setIsVoucherLoading] = useState(false);

  // --- STATE FOR ROOM PRICES ---
  const [roomTypes, setRoomTypes] = useState([]);
  const [priceMessage, setPriceMessage] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchRoomTypes = () => {
    axios.get(`${apiUrl}/api/RoomTypes`, authConfig)
      .then(res => setRoomTypes(res.data))
      .catch(err => console.error("Could not fetch room types", err));
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  // --- HANDLERS ---
  const handleVoucherSubmit = (e) => {
    e.preventDefault();
    setIsVoucherLoading(true);

    axios.post(`${apiUrl}/api/Payments/vouchers`, voucherData, authConfig)
      .then(() => {
        setVoucherMessage({ type: 'success', text: 'Voucher created successfully!' });
        setVoucherData({ code: '', discountPercentage: '' });
      })
      .catch(err => setVoucherMessage({ type: 'error', text: 'Failed to create voucher.' }))
      .finally(() => setIsVoucherLoading(false));
  };

  const handlePriceChange = (id, newPrice) => {
    setRoomTypes(roomTypes.map(rt =>
      rt.id === id ? { ...rt, basePrice: newPrice } : rt
    ));
  };

  const handleUpdatePrice = (id, newPrice) => {
    setPriceMessage(null);
    const priceToUpdate = parseFloat(newPrice);

    axios.patch(`${apiUrl}/api/RoomTypes/${id}/price`, { basePrice: priceToUpdate }, authConfig)
      .then(() => {
        setPriceMessage({ type: 'success', text: 'Price updated successfully!' });
        fetchRoomTypes();
      })
      .catch(err => {
        setPriceMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update price.' });
      });
  };

  return (
    <div className="hb-page" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* HEADER SECTION */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '32px', margin: '0 0 8px 0', fontWeight: 700 }}>Manage Pricing & Discounts</h2>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: '16px' }}>Control base room rates and generate promotional vouchers for guests.</p>
      </div>

      {/* TWO COLUMN DASHBOARD LAYOUT */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* LEFT COLUMN: CREATE VOUCHER */}
        <div style={{ ...cardStyle, flex: '1 1 400px' }}>
          <h3 style={sectionTitleStyle}>
            <FaTicketAlt color={COLORS.emerald} /> Create Discount Voucher
          </h3>

          {voucherMessage && (
            <div style={getMessageStyle(voucherMessage.type)}>
              {voucherMessage.type === 'success' ? <FaCheckCircle size={18} /> : <FaInfoCircle size={18} />}
              <strong>{voucherMessage.text}</strong>
            </div>
          )}

          <form onSubmit={handleVoucherSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}><FaTags color={COLORS.muted} /> Voucher Code</label>
              <input
                type="text"
                placeholder="e.g., HOLIDAY25"
                value={voucherData.code}
                onChange={(e) => setVoucherData({...voucherData, code: e.target.value.toUpperCase()})}
                required
                className="hb-input"
                style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '1px' }}
              />
            </div>
            <div>
              <label style={labelStyle}><FaPercent color={COLORS.muted} /> Discount Percentage (%)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g., 15.5"
                value={voucherData.discountPercentage}
                onChange={(e) => setVoucherData({...voucherData, discountPercentage: e.target.value})}
                required
                className="hb-input"
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              disabled={isVoucherLoading}
              className="hb-submit"
              style={{ ...primaryButtonStyle, marginTop: '5px', backgroundColor: isVoucherLoading ? '#adb5bd' : COLORS.emerald }}
            >
              {isVoucherLoading ? 'Creating...' : 'Create Voucher'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: EDIT ROOM PRICES */}
        <div style={{ ...cardStyle, flex: '1 1 500px' }}>
          <h3 style={sectionTitleStyle}>
            <FaMoneyBillWave color={COLORS.emerald} /> Current Room Prices
          </h3>

          {priceMessage && (
            <div style={getMessageStyle(priceMessage.type)}>
              {priceMessage.type === 'success' ? <FaCheckCircle size={18} /> : <FaInfoCircle size={18} />}
              <strong>{priceMessage.text}</strong>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {roomTypes.map(rt => (
              <div key={rt.id} className="hb-price-row" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '15px 20px', border: `1px solid ${COLORS.border}`, borderRadius: '12px',
                backgroundColor: COLORS.pageBg, transition: 'box-shadow 0.2s',
                flexWrap: 'wrap', gap: '15px'
              }}>
                <div style={{ fontWeight: '700', fontSize: '16px', color: COLORS.ink }}>
                  {rt.name || rt.typeName}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                    <span style={{ padding: '10px 15px', backgroundColor: COLORS.emeraldSoft, color: COLORS.emeraldDark, fontWeight: 'bold', borderRight: `1px solid ${COLORS.border}` }}>₱</span>
                    <input
                      type="number"
                      value={rt.basePrice}
                      onChange={(e) => handlePriceChange(rt.id, e.target.value)}
                      className="hb-input"
                      style={{ width: '100px', padding: '10px', border: 'none', outline: 'none', fontSize: '15px', color: COLORS.ink, fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>
                  <button
                    onClick={() => handleUpdatePrice(rt.id, rt.basePrice)}
                    className="hb-save-btn"
                    style={{
                      padding: '10px 16px', backgroundColor: COLORS.emerald, color: COLORS.ivory,
                      border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px',
                      fontFamily: "'Inter', sans-serif", transition: 'background-color 0.15s',
                      boxShadow: '0 2px 4px rgba(31,93,79,0.2)'
                    }}
                  >
                    <FaSave /> Save
                  </button>
                </div>
              </div>
            ))}

            {roomTypes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: COLORS.muted }}>
                Loading room types...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- Reusable Inline Styles ---
const cardStyle = {
  backgroundColor: 'white',
  padding: '35px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(13,43,38,0.05)',
  border: `1px solid ${COLORS.border}`
};

const sectionTitleStyle = {
  marginTop: 0,
  marginBottom: '25px',
  fontFamily: "'Fraunces', serif",
  color: COLORS.ink,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '20px',
  fontWeight: 600,
  borderBottom: `1px solid ${COLORS.border}`,
  paddingBottom: '15px'
};

const labelStyle = {
  display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
  fontSize: '14px', fontWeight: '600', color: COLORS.text
};

const inputStyle = {
  width: '100%', padding: '14px', borderRadius: '8px', border: `1.5px solid ${COLORS.border}`,
  fontSize: '15px', fontFamily: "'Inter', sans-serif", backgroundColor: COLORS.pageBg, color: COLORS.ink, boxSizing: 'border-box', outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const primaryButtonStyle = {
  padding: '14px',
  backgroundColor: COLORS.emerald,
  color: COLORS.ivory,
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '16px',
  fontFamily: "'Inter', sans-serif",
  transition: 'background-color 0.2s',
  boxShadow: '0 4px 6px rgba(31,93,79,0.15)',
  width: '100%'
};

// Dynamic helper for alert messages
const getMessageStyle = (type) => ({
  padding: '15px 20px',
  marginBottom: '25px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '14px',
  backgroundColor: type === 'success' ? '#EAF3ED' : COLORS.roseSoft,
  color: type === 'success' ? COLORS.emeraldDark : COLORS.rose,
  borderLeft: `4px solid ${type === 'success' ? COLORS.emerald : COLORS.rose}`
});