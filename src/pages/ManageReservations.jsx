import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaCreditCard,
  FaTags,
  FaTimes,
  FaUser,
  FaBed,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaInbox,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
} from 'react-icons/fa';

// ---- Design tokens ----
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
  roseBorder: '#F3C9C6',
  amber: '#B78103',
  amberSoft: '#FFF3CD',
  amberBorder: '#FFE9A8',
  sky: '#3E6FB0',
  skySoft: '#E3ECF8',
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
  .hb-mres * { box-sizing: border-box; }
  .hb-mres input, .hb-mres select { font-family: 'Inter', sans-serif; }
  .hb-row:hover { background-color: ${COLORS.pageBg}; }
  .hb-icon-btn { transition: transform 0.12s ease, opacity 0.15s ease; }
  .hb-icon-btn:hover { transform: translateY(-1px); opacity: 0.85; }
  .hb-icon-btn:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 2px; }
  .hb-page-btn:not(:disabled):hover { background-color: ${COLORS.emeraldSoft} !important; border-color: ${COLORS.emerald} !important; color: ${COLORS.emeraldDark} !important; }
  .hb-page-btn:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 2px; }
  .hb-select-wrap:focus-within, .hb-search-wrap:focus-within { border-color: ${COLORS.emerald} !important; box-shadow: 0 0 0 3px ${COLORS.emeraldSoft}; }
  .hb-modal-close:hover { background-color: ${COLORS.pageBg}; color: ${COLORS.ink} !important; }
  .hb-modal-overlay { animation: hbFadeIn 0.15s ease; }
  .hb-modal-card { animation: hbSlideUp 0.2s ease; }
  @keyframes hbFadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes hbSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  .hb-toast { animation: hbToastIn 0.2s ease; }
  @keyframes hbToastIn { from { opacity: 0; transform: translateY(-10px) translateX(-50%); } to { opacity: 1; transform: translateY(0) translateX(-50%); } }

  .hb-btn-primary:hover { filter: brightness(1.08); }
  .hb-btn-primary:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 2px; }
  .hb-btn-danger:hover { filter: brightness(1.08); }
  .hb-btn-danger:focus-visible { outline: 2px solid ${COLORS.rose}; outline-offset: 2px; }
  .hb-btn-ghost:hover { background-color: ${COLORS.pageBg} !important; }
  .hb-btn-ghost:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 2px; }
  .hb-voucher-input:focus { border-color: ${COLORS.emerald} !important; box-shadow: 0 0 0 3px ${COLORS.emeraldSoft}; }

  @media (max-width: 640px) {
    .hb-toolbar { flex-direction: column !important; }
    .hb-filters { width: 100%; }
    .hb-filters .hb-select-wrap { flex: 1 1 auto !important; }
  }
`;

const formatBeautifulDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getBadgeStyle = (status) => {
  if (status === 'Paid' || status === 'Confirmed') {
    return { bg: COLORS.emeraldSoft, color: COLORS.emeraldDark };
  }
  if (status === 'Cancelled') {
    return { bg: COLORS.roseSoft, color: COLORS.rose };
  }
  return { bg: COLORS.amberSoft, color: COLORS.amber };
};

export default function ManageReservations() {
  const [reservations, setReservations] = useState([]);
  const [viewModalData, setViewModalData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [confirmDialog, setConfirmDialog] = useState(null); 
  const [voucherDialog, setVoucherDialog] = useState(null); 
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherSubmitting, setVoucherSubmitting] = useState(false);
  const [toast, setToast] = useState(null); 
  const toastTimerRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3500);
  };

  const [bookingFilter, setBookingFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchReservations = () => {
    setIsLoading(true);
    axios.get(`${apiUrl}/api/Reservations`, authConfig)
      .then(res => {
        const data = res.data.$values || res.data;
        setReservations(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching reservations', err);
        setError('Could not load reservations. Please try refreshing the page.');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const openVoucherDialog = (id) => {
    setVoucherCode('');
    setVoucherDialog({ id });
  };

  const submitVoucher = () => {
    if (!voucherCode.trim()) return;
    const id = voucherDialog.id;
    setVoucherSubmitting(true);

    axios.patch(`${apiUrl}/api/Payments/${id}/apply-voucher`, { voucherCode: voucherCode.trim() }, authConfig)
      .then(response => {
        setVoucherDialog(null);
        showToast('success', `Voucher applied — new total: ₱${response.data.newTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
        fetchReservations();
      })
      .catch(err => {
        showToast('error', err.response?.data?.message || 'Invalid voucher.');
      })
      .finally(() => setVoucherSubmitting(false));
  };

  const handleProcessPayment = (id) => {
    setConfirmDialog({
      id,
      title: 'Process Payment',
      message: 'Are you ready to process this payment? This will mark the reservation as paid.',
      confirmLabel: 'Process Payment',
      danger: false,
      onConfirm: () => {
        axios.patch(`${apiUrl}/api/Payments/${id}/process`, {}, authConfig)
          .then(() => {
            showToast('success', 'Payment processed successfully!');
            fetchReservations();
          })
          .catch(err => {
            showToast('error', err.response?.data?.message || 'Payment failed.');
          })
          .finally(() => setConfirmDialog(null));
      },
    });
  };

  const handleCancelReservation = (id) => {
    setConfirmDialog({
      id,
      title: 'Cancel Reservation',
      message: 'Are you sure you want to cancel this reservation? This action cannot be undone.',
      confirmLabel: 'Cancel Reservation',
      danger: true,
      onConfirm: () => {
        axios.patch(`${apiUrl}/api/Payments/${id}/cancel`, {}, authConfig)
          .then(() => {
            showToast('success', 'Reservation cancelled.');
            fetchReservations();
          })
          .catch(err => {
            showToast('error', err.response?.data?.message || 'Could not cancel.');
          })
          .finally(() => setConfirmDialog(null));
      },
    });
  };

  const filteredReservations = reservations.filter(res => {
    const matchesBooking = bookingFilter === 'All' || res.status === bookingFilter;
    const matchesPayment = paymentFilter === 'All' || (res.paymentStatus || 'Pending') === paymentFilter;

    // FIX: Set a fallback display name so we can search for blank online reservations!
    const displayGuestName = res.guestName || 'Registered Guest';
    const safeGuestName = displayGuestName.toLowerCase();
    const safeId = res.id ? res.id.toString() : '';
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch = searchQuery === '' ||
      safeGuestName.includes(searchLower) ||
      safeId.includes(searchLower);

    return matchesBooking && matchesPayment && matchesSearch;
  }).sort((a, b) => b.id - a.id);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  const hasActiveFilters = bookingFilter !== 'All' || paymentFilter !== 'All' || searchQuery !== '';

  if (isLoading) {
    return (
      <div className="hb-mres" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh', color: COLORS.muted, fontFamily: "'Inter', sans-serif" }}>
        <style>{globalStyles}</style>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Loading reservations…</h2>
      </div>
    );
  }

  return (
    <div className="hb-mres" style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* HEADER */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '32px', margin: '0 0 8px 0', fontWeight: 700 }}>Manage Reservations</h1>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: '16px' }}>View, filter, and manage all guest bookings and payments.</p>
      </div>

      {error && (
        <div style={{ padding: '15px 20px', backgroundColor: COLORS.roseSoft, color: COLORS.rose, borderRadius: '8px', marginBottom: '20px', borderLeft: `4px solid ${COLORS.rose}`, fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* TOOLBAR */}
      <div className="hb-toolbar" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(13,43,38,0.04)', border: `1px solid ${COLORS.border}`, marginBottom: '25px' }}>
        <div className="hb-search-wrap" style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', backgroundColor: COLORS.pageBg, borderRadius: '8px', border: `1px solid ${COLORS.border}`, padding: '0 15px', transition: 'border-color 0.15s, box-shadow 0.15s' }}>
          <FaSearch color={COLORS.muted} size={14} />
          <input
            type="text" placeholder="Search guest name or ID…" value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{ border: 'none', background: 'transparent', padding: '12px', width: '100%', outline: 'none', fontSize: '15px', color: COLORS.text }}
          />
        </div>

        <div className="hb-filters" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div className="hb-select-wrap" style={{ display: 'flex', alignItems: 'center', backgroundColor: COLORS.pageBg, borderRadius: '8px', border: `1px solid ${COLORS.border}`, padding: '0 15px', transition: 'border-color 0.15s, box-shadow 0.15s' }}>
            <FaFilter color={COLORS.muted} size={13} />
            <select value={bookingFilter} onChange={(e) => { setBookingFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
              <option value="All">All Bookings</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="hb-select-wrap" style={{ display: 'flex', alignItems: 'center', backgroundColor: COLORS.pageBg, borderRadius: '8px', border: `1px solid ${COLORS.border}`, padding: '0 15px', transition: 'border-color 0.15s, box-shadow 0.15s' }}>
            <FaFilter color={COLORS.muted} size={13} />
            <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
              <option value="All">All Payments</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 15px rgba(13,43,38,0.04)', border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {filteredReservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.muted }}>
              {reservations.length === 0 ? (
                <FaInbox size={40} style={{ marginBottom: '15px', color: COLORS.border }} />
              ) : (
                <FaClipboardList size={40} style={{ marginBottom: '15px', color: COLORS.border }} />
              )}
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: COLORS.text }}>
                {reservations.length === 0 ? 'No reservations yet' : 'No reservations match your filters'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: COLORS.pageBg, color: COLORS.text, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Guest Name</th>
                  <th style={thStyle}>Check-In</th>
                  <th style={thStyle}>Check-Out</th>
                  <th style={thStyle}>Total Price</th>
                  <th style={thStyle}>Booking Status</th>
                  <th style={thStyle}>Payment Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(res => {
                  const paymentBadge = getBadgeStyle(res.paymentStatus || 'Pending');
                  const bookingBadge = getBadgeStyle(res.status);

                  return (
                    <tr key={res.id} className="hb-row" style={{ borderBottom: `1px solid ${COLORS.border}`, transition: 'background-color 0.15s' }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: COLORS.emerald }}>#{res.id}</td>
                      
                      {/* FIX: Handle missing Guest Names elegantly in the table */}
                      <td style={{ ...tdStyle, fontWeight: 600, color: COLORS.ink }}>
                        {res.guestName ? (
                          res.guestName
                        ) : (
                          <span style={{ color: COLORS.muted, fontStyle: 'italic', fontWeight: 500 }}>Registered Guest</span>
                        )}
                      </td>

                      <td style={tdStyle}>{formatBeautifulDate(res.checkInDate)}</td>
                      <td style={tdStyle}>{formatBeautifulDate(res.checkOutDate)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: COLORS.ink }}>₱{res.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, backgroundColor: bookingBadge.bg, color: bookingBadge.color }}>
                          {res.status}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, backgroundColor: paymentBadge.bg, color: paymentBadge.color }}>
                          {res.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button title="View Details" className="hb-icon-btn" onClick={() => setViewModalData(res)} style={{ ...actionBtnStyle, backgroundColor: COLORS.pageBg, color: COLORS.text }}>
                            <FaEye />
                          </button>
                          {res.paymentStatus !== 'Paid' && res.paymentStatus !== 'Cancelled' && (
                            <>
                              <button title="Process Payment" className="hb-icon-btn" onClick={() => handleProcessPayment(res.id)} style={{ ...actionBtnStyle, backgroundColor: COLORS.emeraldSoft, color: COLORS.emeraldDark }}>
                                <FaCreditCard />
                              </button>
                              <button title="Apply Voucher" className="hb-icon-btn" onClick={() => openVoucherDialog(res.id)} style={{ ...actionBtnStyle, backgroundColor: COLORS.skySoft, color: COLORS.sky }}>
                                <FaTags />
                              </button>
                            </>
                          )}
                          {res.paymentStatus !== 'Cancelled' && (
                            <button title="Cancel Reservation" className="hb-icon-btn" onClick={() => handleCancelReservation(res.id)} style={{ ...actionBtnStyle, backgroundColor: COLORS.roseSoft, color: COLORS.rose }}>
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {filteredReservations.length > 0 && (
          <div style={{ padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.pageBg, borderTop: `1px solid ${COLORS.border}` }}>
            <button className="hb-page-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={paginationBtnStyle(currentPage === 1)}>
              Previous
            </button>
            <span style={{ fontSize: '14px', color: COLORS.muted, fontWeight: 500 }}>Page {currentPage} of {totalPages || 1}</span>
            <button className="hb-page-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} style={paginationBtnStyle(currentPage === totalPages || totalPages === 0)}>
              Next
            </button>
          </div>
        )}
      </div>

      {/* VIEW RESERVATION MODAL */}
      {viewModalData && (
        <div
          className="hb-modal-overlay"
          onClick={() => setViewModalData(null)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(13,43,38,0.45)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}
        >
          <div
            className="hb-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'white', padding: 0, borderRadius: '16px', width: '450px', maxWidth: '100%', boxShadow: '0 10px 30px rgba(13,43,38,0.25)', overflow: 'hidden' }}
          >
            <div style={{ backgroundColor: COLORS.ivory, padding: '20px 25px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: COLORS.ink, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                <FaFileInvoiceDollar color={COLORS.emerald} /> Reservation #{viewModalData.id}
              </h3>
              <button onClick={() => setViewModalData(null)} className="hb-modal-close" style={{ background: 'transparent', border: 'none', color: COLORS.muted, cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                <FaTimes size={18} />
              </button>
            </div>

            <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* FIX: Handle missing Guest Names in the Modal */}
              <div style={modalRowStyle}>
                <span style={modalLabelStyle}><FaUser size={13} /> Guest Name</span> 
                <strong style={{ color: COLORS.ink }}>
                  {viewModalData.guestName ? (
                    viewModalData.guestName
                  ) : (
                    <span style={{ color: COLORS.muted, fontStyle: 'italic', fontWeight: 500 }}>Registered Guest</span>
                  )}
                </strong>
              </div>

              <div style={modalRowStyle}><span style={modalLabelStyle}><FaBed size={13} /> Assigned Room</span> <strong style={{ color: COLORS.ink }}>Room {viewModalData.roomNumber || viewModalData.roomId} ({viewModalData.roomTypeName})</strong></div>
              <div style={modalRowStyle}><span style={modalLabelStyle}><FaCalendarAlt size={13} /> Check-In</span> <strong style={{ color: COLORS.ink }}>{formatBeautifulDate(viewModalData.checkInDate)}</strong></div>
              <div style={modalRowStyle}><span style={modalLabelStyle}><FaCalendarAlt size={13} /> Check-Out</span> <strong style={{ color: COLORS.ink }}>{formatBeautifulDate(viewModalData.checkOutDate)}</strong></div>
              <hr style={{ borderTop: `1px dashed ${COLORS.border}`, border: 'none', margin: '2px 0' }} />
              <div style={modalRowStyle}>
                <span style={modalLabelStyle}>Booking Status</span>
                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, backgroundColor: getBadgeStyle(viewModalData.status).bg, color: getBadgeStyle(viewModalData.status).color }}>{viewModalData.status}</span>
              </div>
              <div style={modalRowStyle}>
                <span style={modalLabelStyle}>Payment Status</span>
                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, backgroundColor: getBadgeStyle(viewModalData.paymentStatus).bg, color: getBadgeStyle(viewModalData.paymentStatus).color }}>{viewModalData.paymentStatus || 'Pending'}</span>
              </div>
              <div style={{ ...modalRowStyle, marginTop: '6px', paddingTop: '14px', borderTop: `1px solid ${COLORS.border}` }}>
                <span style={{ color: COLORS.muted, fontWeight: 600, fontSize: '15px' }}>Total Price</span>
                <strong style={{ color: COLORS.emerald, fontSize: '22px', fontFamily: "'Fraunces', serif" }}>₱{viewModalData.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <div style={{ padding: '20px 25px', backgroundColor: COLORS.pageBg, borderTop: `1px solid ${COLORS.border}` }}>
              <button
                onClick={() => setViewModalData(null)}
                style={{ width: '100%', padding: '13px', backgroundColor: COLORS.emerald, color: COLORS.ivory, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '15px', fontFamily: "'Inter', sans-serif" }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM & VOUCHER DIALOGS OMITTED FROM THIS SNIPPET FOR BREVITY (Kept identical to original) */}
      {confirmDialog && (
        <div
          className="hb-modal-overlay"
          onClick={() => setConfirmDialog(null)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(13,43,38,0.45)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px' }}
        >
          <div
            className="hb-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'white', borderRadius: '16px', width: '400px', maxWidth: '100%', boxShadow: '0 10px 30px rgba(13,43,38,0.25)', overflow: 'hidden' }}
          >
            <div style={{ padding: '28px 25px 22px 25px', textAlign: 'center' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%', margin: '0 auto 16px auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                backgroundColor: confirmDialog.danger ? COLORS.roseSoft : COLORS.emeraldSoft,
                color: confirmDialog.danger ? COLORS.rose : COLORS.emerald,
              }}>
                <FaExclamationTriangle />
              </div>
              <h3 style={{ margin: '0 0 10px 0', color: COLORS.ink, fontSize: '18px', fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                {confirmDialog.title}
              </h3>
              <p style={{ margin: 0, color: COLORS.muted, fontSize: '14.5px', lineHeight: 1.5 }}>
                {confirmDialog.message}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', padding: '0 25px 25px 25px' }}>
              <button
                onClick={() => setConfirmDialog(null)}
                className="hb-btn-ghost"
                style={{ flex: 1, padding: '12px', backgroundColor: 'white', color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14.5px', fontFamily: "'Inter', sans-serif" }}
              >
                Never mind
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={confirmDialog.danger ? 'hb-btn-danger' : 'hb-btn-primary'}
                style={{ flex: 1, padding: '12px', backgroundColor: confirmDialog.danger ? COLORS.rose : COLORS.emerald, color: COLORS.ivory, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14.5px', fontFamily: "'Inter', sans-serif" }}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {voucherDialog && (
        <div
          className="hb-modal-overlay"
          onClick={() => !voucherSubmitting && setVoucherDialog(null)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(13,43,38,0.45)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px' }}
        >
          <div
            className="hb-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: 'white', borderRadius: '16px', width: '400px', maxWidth: '100%', boxShadow: '0 10px 30px rgba(13,43,38,0.25)', overflow: 'hidden' }}
          >
            <div style={{ backgroundColor: COLORS.ivory, padding: '20px 25px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: COLORS.ink, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
                <FaTags color={COLORS.sky} /> Apply Voucher
              </h3>
              {!voucherSubmitting && (
                <button onClick={() => setVoucherDialog(null)} className="hb-modal-close" style={{ background: 'transparent', border: 'none', color: COLORS.muted, cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                  <FaTimes size={18} />
                </button>
              )}
            </div>
            <div style={{ padding: '25px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: COLORS.text, marginBottom: '8px' }}>
                Discount voucher code
              </label>
              <input
                type="text"
                autoFocus
                className="hb-voucher-input"
                placeholder="e.g. SUMMER25"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitVoucher(); }}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: `1px solid ${COLORS.border}`, fontSize: '15px', color: COLORS.ink, outline: 'none', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              />
              <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: COLORS.muted }}>
                Reservation #{voucherDialog.id}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', padding: '0 25px 25px 25px' }}>
              <button
                onClick={() => setVoucherDialog(null)}
                disabled={voucherSubmitting}
                className="hb-btn-ghost"
                style={{ flex: 1, padding: '12px', backgroundColor: 'white', color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: '8px', cursor: voucherSubmitting ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '14.5px', fontFamily: "'Inter', sans-serif", opacity: voucherSubmitting ? 0.6 : 1 }}
              >
                Cancel
              </button>
              <button
                onClick={submitVoucher}
                disabled={voucherSubmitting || !voucherCode.trim()}
                className="hb-btn-primary"
                style={{ flex: 1, padding: '12px', backgroundColor: COLORS.emerald, color: COLORS.ivory, border: 'none', borderRadius: '8px', cursor: (voucherSubmitting || !voucherCode.trim()) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '14.5px', fontFamily: "'Inter', sans-serif", opacity: (voucherSubmitting || !voucherCode.trim()) ? 0.6 : 1 }}
              >
                {voucherSubmitting ? 'Applying…' : 'Apply Voucher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="hb-toast"
          style={{
            position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 1200,
            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderRadius: '10px',
            backgroundColor: toast.type === 'success' ? COLORS.emeraldDark : COLORS.rose,
            color: COLORS.ivory, boxShadow: '0 8px 24px rgba(13,43,38,0.25)', maxWidth: '90vw', fontSize: '14.5px', fontWeight: 500,
          }}
        >
          {toast.type === 'success' ? <FaCheckCircle size={18} /> : <FaExclamationCircle size={18} />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'transparent', border: 'none', color: COLORS.ivory, opacity: 0.8, cursor: 'pointer', display: 'flex', marginLeft: '6px' }}
          >
            <FaTimes size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// --- Reusable Inline Styles ---
const selectStyle = {
  border: 'none', background: 'transparent', padding: '12px', outline: 'none', fontSize: '14px', color: COLORS.text, cursor: 'pointer',
};

const thStyle = { padding: '16px 20px' };
const tdStyle = { padding: '16px 20px', color: COLORS.text, fontSize: '14px', verticalAlign: 'middle' };

const actionBtnStyle = {
  width: '32px', height: '32px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};

const paginationBtnStyle = (disabled) => ({
  padding: '9px 18px', borderRadius: '8px', border: `1px solid ${COLORS.border}`,
  backgroundColor: disabled ? COLORS.border : 'white', color: disabled ? COLORS.muted : COLORS.text,
  cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.15s',
});

const modalRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px', color: COLORS.ink };
const modalLabelStyle = { display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.muted, fontSize: '14px', fontWeight: 500 };