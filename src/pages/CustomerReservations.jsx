import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaCalendarAlt,
  FaFilter,
  FaBed,
  FaMoneyBillWave,
  FaCalendarDay,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from 'react-icons/fa';

// ---- Design tokens (matches Login/Register/AdminLayout/Overview/ManageReservations) ----
const COLORS = {
  ink: '#0D2B26',
  emerald: '#1F5D4F',
  emeraldDark: '#123028',
  emeraldSoft: '#E5EFEA',
  brass: '#C6A15B',
  brassSoft: '#F7EFDD',
  ivory: '#FBF8F1',
  pageBg: '#F6F4EE',
  border: '#eeece4',
  muted: '#8a8f89',
  text: '#495057',
  rose: '#B3413B',
  roseSoft: '#FDEEED',
  amber: '#B78103',
  amberSoft: '#FFF3CD',
  sky: '#3E6FB0',
  skySoft: '#E3ECF8',
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
  .hb-cust-res * { box-sizing: border-box; }
  .hb-res-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
  .hb-res-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(13,43,38,0.08); }
  .hb-select-wrap:focus-within { border-color: ${COLORS.emerald} !important; box-shadow: 0 0 0 3px ${COLORS.emeraldSoft}; }
  .hb-page-btn:not(:disabled):hover { background-color: ${COLORS.emeraldSoft} !important; border-color: ${COLORS.emerald} !important; color: ${COLORS.emeraldDark} !important; }
  .hb-page-btn:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 2px; }
`;

const formatBeautifulDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// Unified badge coloring across booking + payment statuses
const getBadgeStyle = (status) => {
  if (status === 'Confirmed' || status === 'Paid') return { bg: COLORS.emeraldSoft, color: COLORS.emeraldDark, icon: <FaCheckCircle /> };
  if (status === 'Cancelled') return { bg: COLORS.roseSoft, color: COLORS.rose, icon: <FaTimesCircle /> };
  return { bg: COLORS.amberSoft, color: COLORS.amber, icon: <FaClock /> }; // Pending
};

export default function CustomerReservations() {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get(`${apiUrl}/api/Reservations/my-reservations`, authConfig)
      .then(res => {
        const data = res.data.$values || res.data;
        setReservations(data);
      })
      .catch(err => console.error('Could not fetch reservations', err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredReservations = reservations.filter(res => {
    if (filterStatus === 'All') return true;
    return res.status === filterStatus || res.paymentStatus === filterStatus;
  }).sort((a, b) => b.id - a.id);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  return (
    <div className="hb-cust-res" style={{ maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '60px', height: '60px', margin: '0 auto 15px auto',
          backgroundColor: COLORS.emeraldSoft, color: COLORS.emerald,
          borderRadius: '50%',
        }}>
          <FaClipboardList size={24} />
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '30px', margin: '0 0 8px 0', fontWeight: 700 }}>My Reservation History</h1>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: '16px' }}>View and track all your past and upcoming stays.</p>
      </div>

      {/* FILTER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', backgroundColor: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(13,43,38,0.04)', border: `1px solid ${COLORS.border}`, marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: COLORS.text, fontWeight: 600, fontSize: '14.5px' }}>
          <FaFilter color={COLORS.muted} size={14} /> Filter by Status:
        </div>
        <div className="hb-select-wrap" style={{ borderRadius: '8px', border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.pageBg, transition: 'border-color 0.15s, box-shadow 0.15s' }}>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            style={{ padding: '10px 15px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: COLORS.text, fontSize: '14px', outline: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
          >
            <option value="All">All Reservations</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: COLORS.muted }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: '20px', margin: 0 }}>Loading your history…</h2>
        </div>
      ) : reservations.length === 0 ? (
        <div style={{ padding: '60px 30px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(13,43,38,0.04)', border: `1px solid ${COLORS.border}` }}>
          <FaCalendarAlt size={44} color={COLORS.border} style={{ marginBottom: '15px' }} />
          <h3 style={{ color: COLORS.ink, margin: '0 0 8px 0', fontFamily: "'Fraunces', serif", fontSize: '19px', fontWeight: 600 }}>No Reservations Found</h3>
          <p style={{ color: COLORS.muted, fontSize: '15px', margin: 0 }}>You haven't booked any rooms with us yet.</p>
        </div>
      ) : currentItems.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: `1px solid ${COLORS.border}`, color: COLORS.muted }}>
          No reservations match the selected filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {currentItems.map(res => {
            const bookingBadge = getBadgeStyle(res.status);
            const paymentBadge = getBadgeStyle(res.paymentStatus || 'Pending');

            return (
              <div key={res.id} className="hb-res-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(13,43,38,0.04)', border: `1px solid ${COLORS.border}` }}>

                {/* Left Side: Booking Details */}
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ padding: '9px', backgroundColor: COLORS.emeraldSoft, borderRadius: '8px', color: COLORS.emerald, display: 'flex' }}><FaBed size={17} /></div>
                    <h4 style={{ margin: 0, color: COLORS.ink, fontSize: '19px', fontFamily: "'Fraunces', serif", fontWeight: 700 }}>Room {res.roomNumber || res.roomId}</h4>
                    <span style={{ fontSize: '13px', color: COLORS.muted, fontWeight: 600 }}>• ID #{res.id}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: COLORS.text, fontSize: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FaCalendarDay color={COLORS.muted} size={13} /> <strong>Check-in:</strong> {formatBeautifulDate(res.checkInDate)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FaCalendarDay color={COLORS.muted} size={13} /> <strong>Check-out:</strong> {formatBeautifulDate(res.checkOutDate)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '16px' }}>
                      <FaMoneyBillWave color={COLORS.emerald} size={14} /> <strong>Total Price:</strong> <span style={{ color: COLORS.emerald, fontWeight: 700 }}>₱{res.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Status Badges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', minWidth: '150px' }}>

                  <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '12px', color: COLORS.muted, marginBottom: '5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Booking Status</div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, backgroundColor: bookingBadge.bg, color: bookingBadge.color }}>
                      {bookingBadge.icon} {res.status}
                    </span>
                  </div>

                  <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '12px', color: COLORS.muted, marginBottom: '5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Payment Status</div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, backgroundColor: paymentBadge.bg, color: paymentBadge.color }}>
                      {paymentBadge.icon} {res.paymentStatus || 'Pending'}
                    </span>
                  </div>

                </div>

              </div>
            );
          })}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', padding: '15px 20px', backgroundColor: 'white', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
              <button
                className="hb-page-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={paginationBtnStyle(currentPage === 1)}
              >
                Previous
              </button>

              <span style={{ fontSize: '14px', color: COLORS.muted, fontWeight: 600 }}>Page {currentPage} of {totalPages}</span>

              <button
                className="hb-page-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={paginationBtnStyle(currentPage === totalPages)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Reusable Inline Styles ---
const paginationBtnStyle = (disabled) => ({
  padding: '10px 20px',
  borderRadius: '8px',
  border: `1px solid ${COLORS.border}`,
  backgroundColor: disabled ? COLORS.border : 'white',
  color: disabled ? COLORS.muted : COLORS.text,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontWeight: 700,
  fontSize: '14px',
  transition: 'all 0.15s',
});