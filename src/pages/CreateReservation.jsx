import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaUser, FaBed, FaCalendarAlt, FaUsers, FaTag, FaInfoCircle, FaFileInvoiceDollar, FaCheckCircle } from 'react-icons/fa';

// ---- Design tokens (matches Login/Register/AdminLayout/CustomerLayout) ----
const COLORS = {
  ink: '#0D2B26',
  emerald: '#1F5D4F',
  emeraldDark: '#123028',
  emeraldSoft: 'rgba(31,93,79,0.08)',
  brass: '#C6A15B',
  ivory: '#FBF8F1',
  pageBg: '#F6F4EE',
  border: '#e5e2da',
  muted: '#8a8f89',
  text: '#495057',
  rose: '#B3413B',
  roseSoft: '#FFF2F1',
  amber: '#B78103',
  amberSoft: '#FFF8E1',
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

  .hb-page * { box-sizing: border-box; }

  .hb-input:focus, .hb-select:focus {
    outline: none;
    border-color: ${COLORS.emerald} !important;
    box-shadow: 0 0 0 3px rgba(31,93,79,0.14);
  }

  .hb-submit:not(:disabled):hover {
    background-color: ${COLORS.emeraldDark} !important;
  }

  /* Re-theme react-datepicker to match the brand */
  .react-datepicker-wrapper { width: 100%; display: block; }
  .react-datepicker { font-family: 'Inter', sans-serif; border-color: ${COLORS.border}; border-radius: 10px; overflow: hidden; }
  .react-datepicker__header { background-color: ${COLORS.ivory}; border-bottom: 1px solid ${COLORS.border}; }
  .react-datepicker__current-month, .react-datepicker__day-name { color: ${COLORS.ink}; }
  .react-datepicker__day:hover { background-color: ${COLORS.emeraldSoft}; }
  .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
    background-color: ${COLORS.emerald} !important;
    color: ${COLORS.ivory} !important;
  }
  .react-datepicker__day--disabled { color: #ced4da; }
`;

export default function CreateReservation() {
  const [rooms, setRooms] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  const [formData, setFormData] = useState({
    guestName: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    guestsCount: 1
  });

  const [disabledDates, setDisabledDates] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');

  const userRole = localStorage.getItem('userRole');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    // Fetch Rooms
    axios.get(`${apiUrl}/api/Rooms`, authConfig)
      .then(res => setRooms(res.data))
      .catch(err => console.error("Could not fetch rooms:", err));

    // Fetch Vouchers
    axios.get(`${apiUrl}/api/Payments/vouchers`, authConfig)
      .then(res => {
        setVouchers(res.data);
      })
      .catch(err => console.error("Could not fetch vouchers:", err));

    // --- THE FIX: AUTO-FILL GUEST NAME FOR LOGGED-IN CUSTOMERS ---
    if (userRole === 'Customer') {
      axios.get(`${apiUrl}/api/Auth/me`, authConfig)
        .then(res => {
          setFormData(prev => ({ 
            ...prev, 
            // Use their full name, fallback to username if full name is empty
            guestName: res.data.fullName || res.data.username || 'Online Guest' 
          }));
        })
        .catch(err => console.error("Could not fetch user info for auto-fill:", err));
    }
  }, []);

  useEffect(() => {
    if (!formData.roomId) return;

    const fetchRoomReservations = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/Reservations/booked-dates/${formData.roomId}`, authConfig);
        const safeData = response.data.$values || response.data;

        let datesToBlock = [];

        safeData.forEach(reservation => {
          const checkInStr = reservation.checkInDate || reservation.CheckInDate;
          const checkOutStr = reservation.checkOutDate || reservation.CheckOutDate;

          if (checkInStr && checkOutStr) {
            const [inYear, inMonth, inDay] = checkInStr.split('-');
            const [outYear, outMonth, outDay] = checkOutStr.split('-');

            let currentDate = new Date(inYear, inMonth - 1, inDay);
            const endDate = new Date(outYear, outMonth - 1, outDay);

            while (currentDate <= endDate) {
              datesToBlock.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        });

        setDisabledDates(datesToBlock);

      } catch (error) {
        console.error("Error fetching reservations for date blocking:", error);
      }
    };

    fetchRoomReservations();
  }, [formData.roomId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === 'roomId') {
      setDisabledDates([]);
    }
  };

  const handleVoucherChange = (e) => {
    setVoucherCode(e.target.value.toUpperCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const payload = { ...formData, voucherCode: voucherCode };

    axios.post(`${apiUrl}/api/Reservations`, payload, authConfig)
      .then(response => {
        setMessage({ type: 'success', text: 'Reservation booked successfully!' });

        setTimeout(() => {
          if (userRole === 'Customer') {
             navigate('/customer/reservations');
          } else {
             navigate('/reservations');
          }
        }, 2000);
      })
      .catch(err => {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to book room.' });
        setIsLoading(false);
      });
  };

  const selectedRoom = rooms.find(room => room.id === parseInt(formData.roomId));
  const baseRate = selectedRoom ? (selectedRoom.basePrice || selectedRoom.pricePerNight || 0) : 0;
  const capacity = selectedRoom ? (selectedRoom.capacity || 2) : 2;

  const isExtraCharge = selectedRoom && formData.guestsCount > capacity;
  const extraGuestsCount = isExtraCharge ? (formData.guestsCount - capacity) : 0;
  const extraChargeTotal = extraGuestsCount * 300;

  const safeUserInput = voucherCode ? voucherCode.trim().toUpperCase() : '';

  const foundVoucher = vouchers.find(v => {
    const dbCode = v.code || v.Code;
    return dbCode?.trim().toUpperCase() === safeUserInput;
  });

  const discountPercent = foundVoucher ? (foundVoucher.discountPercentage || foundVoucher.DiscountPercentage || 0) : 0;

  const subtotal = baseRate + extraChargeTotal;
  const discountAmount = subtotal * (discountPercent / 100);
  const finalPrice = subtotal - discountAmount;

  return (
    <div className="hb-page" style={{ padding: '40px 20px', maxWidth: '700px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '32px', margin: '0 0 10px 0', fontWeight: 700 }}>Book a Room</h2>
        <p style={{ color: COLORS.muted, margin: 0 }}>Secure your perfect stay in just a few clicks.</p>
      </div>

      {message && (
        <div style={{
          padding: '15px 20px', marginBottom: '25px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px',
          backgroundColor: message.type === 'success' ? '#EAF3ED' : COLORS.roseSoft,
          color: message.type === 'success' ? COLORS.emeraldDark : COLORS.rose,
          borderLeft: `4px solid ${message.type === 'success' ? COLORS.emerald : COLORS.rose}`
        }}>
          {message.type === 'success' ? <FaCheckCircle size={20} /> : <FaInfoCircle size={20} />}
          <strong>{message.text}</strong>
        </div>
      )}

      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(13,43,38,0.05)', border: `1px solid ${COLORS.border}` }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

          {userRole !== 'Customer' && (
            <div>
              <label style={labelStyle}><FaUser color={COLORS.muted} /> Guest Name</label>
              <input
                type="text" name="guestName" value={formData.guestName} onChange={handleChange} required={userRole !== 'Customer'}
                placeholder="Enter the full name for the walk-in guest"
                className="hb-input"
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}><FaBed color={COLORS.muted} /> Select Room</label>
            <select name="roomId" value={formData.roomId} onChange={handleChange} required className="hb-select" style={inputStyle}>
              <option value="" disabled>-- Choose a Room --</option>
              {rooms.filter(room => room.status === 'Available').map(room => (
                <option key={room.id} value={room.id}>
                  Room {room.roomNumber} - {room.roomTypeName || room.roomType} (₱{room.basePrice || room.pricePerNight})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}><FaCalendarAlt color={COLORS.muted} /> Check-In</label>
              <div style={datePickerWrapperStyle}>
                <DatePicker
                  selected={formData.checkInDate ? new Date(formData.checkInDate) : null}
                  onChange={(date) => handleChange({ target: { name: 'checkInDate', value: date } })}
                  excludeDates={disabledDates} minDate={new Date()} dateFormat="dd/MM/yyyy" placeholderText="dd/mm/yyyy" required
                  customInput={<input className="hb-input" style={inputStyle} />}
                />
              </div>
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}><FaCalendarAlt color={COLORS.muted} /> Check-Out</label>
              <div style={datePickerWrapperStyle}>
                <DatePicker
                  selected={formData.checkOutDate ? new Date(formData.checkOutDate) : null}
                  onChange={(date) => handleChange({ target: { name: 'checkOutDate', value: date } })}
                  excludeDates={disabledDates} minDate={formData.checkInDate ? new Date(formData.checkInDate) : new Date()} dateFormat="dd/MM/yyyy" placeholderText="dd/mm/yyyy" required
                  customInput={<input className="hb-input" style={inputStyle} />}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}><FaUsers color={COLORS.muted} /> Number of Guests</label>
            <input type="number" name="guestsCount" min="1" max="10" value={formData.guestsCount} onChange={handleChange} required className="hb-input" style={inputStyle} />

            {isExtraCharge && (
              <div style={{ marginTop: '12px', padding: '12px 15px', backgroundColor: COLORS.amberSoft, color: COLORS.amber, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <FaInfoCircle size={18} />
                <span><strong>Extra Charge Applies:</strong> Room capacity is {capacity}. ₱300 per extra person applies.</span>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}><FaTag color={COLORS.muted} /> Discount Voucher (Optional)</label>
            <input
              type="text" placeholder="e.g., SUMMER20" value={voucherCode} onChange={handleVoucherChange}
              className="hb-input"
              style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '1px' }}
            />
          </div>

          {/* DYNAMIC RECEIPT / PRICE BREAKDOWN */}
          {selectedRoom && (
            <div style={{ marginTop: '15px', padding: '25px', backgroundColor: COLORS.pageBg, borderRadius: '12px', border: `1px dashed ${COLORS.border}` }}>
              <h4 style={{ margin: '0 0 20px 0', color: COLORS.ink, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
                <FaFileInvoiceDollar color={COLORS.muted} /> Booking Summary
              </h4>

              <div style={receiptLineStyle}>
                <span style={{ color: COLORS.text }}>Base Room Rate</span>
                <span style={{ fontWeight: '600' }}>₱{baseRate.toFixed(2)}</span>
              </div>

              {extraChargeTotal > 0 && (
                <div style={receiptLineStyle}>
                  <span style={{ color: COLORS.rose }}>Extra Guest Charge ({extraGuestsCount} pax)</span>
                  <span style={{ color: COLORS.rose, fontWeight: '600' }}>+ ₱{extraChargeTotal.toFixed(2)}</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div style={receiptLineStyle}>
                  <span style={{ color: COLORS.emerald }}>Voucher Discount ({discountPercent}%)</span>
                  <span style={{ color: COLORS.emerald, fontWeight: '600' }}>- ₱{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <hr style={{ borderTop: `1px solid ${COLORS.border}`, margin: '15px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', color: COLORS.muted, fontWeight: '600' }}>Total Amount</span>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: '700', color: COLORS.emeraldDark }}>₱{finalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="hb-submit" style={{
            marginTop: '10px', padding: '16px', backgroundColor: isLoading ? '#adb5bd' : COLORS.emerald, color: COLORS.ivory,
            border: 'none', borderRadius: '8px', cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold', fontSize: '16px', fontFamily: "'Inter', sans-serif", transition: 'background-color 0.2s', boxShadow: '0 4px 6px rgba(31,93,79,0.15)'
          }}>
            {isLoading ? 'Processing...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Reusable Inline Styles ---
const labelStyle = {
  display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
  fontSize: '14px', fontWeight: '600', color: COLORS.text
};

const inputStyle = {
  width: '100%', padding: '14px', borderRadius: '8px', border: `1.5px solid ${COLORS.border}`,
  fontSize: '15px', fontFamily: "'Inter', sans-serif", backgroundColor: COLORS.pageBg, color: COLORS.ink, boxSizing: 'border-box', outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const datePickerWrapperStyle = {
  width: '100%',
  display: 'block'
};

const receiptLineStyle = {
  display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px'
};