import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaTags,
  FaTicketAlt,
  FaMoneyBillWave,
  FaSave,
  FaCheckCircle,
  FaInfoCircle,
  FaPercent,
  FaCalendarAlt,
  FaSearch,
  FaEdit,
  FaTrash,
  FaSort,
  FaTimes,
} from 'react-icons/fa';

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
  blue: '#3E6FB0',
  blueSoft: '#E3ECF8',
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

  .hb-voucher-row:hover {
    background-color: ${COLORS.pageBg};
  }
`;

export default function ManagePrices() {
  // --- STATE FOR VOUCHERS ---
  const [voucherData, setVoucherData] = useState({
    code: '',
    discountPercentage: '',
    startDate: '',
    expirationDate: '',
  });
  const [voucherMessage, setVoucherMessage] = useState(null);
  const [isVoucherLoading, setIsVoucherLoading] = useState(false);

  // --- STATE FOR VOUCHER TABLE ---
  const [vouchers, setVouchers] = useState([]);
  const [voucherSearch, setVoucherSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'expirationDate', direction: 'asc' });

  // --- STATE FOR EDIT MODAL ---
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [editError, setEditError] = useState(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  // --- STATE FOR ROOM PRICES ---
  const [roomTypes, setRoomTypes] = useState([]);
  const [priceMessage, setPriceMessage] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchRoomTypes = () => {
    axios
      .get(`${apiUrl}/api/RoomTypes`, authConfig)
      .then((res) => setRoomTypes(res.data))
      .catch((err) => console.error('Could not fetch room types', err));
  };

  const fetchVouchers = () => {
    axios
      .get(`${apiUrl}/api/Payments/vouchers`, authConfig)
      .then((res) => setVouchers(res.data.$values || res.data || []))
      .catch((err) => console.error('Could not fetch vouchers', err));
  };

  useEffect(() => {
    fetchRoomTypes();
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- VOUCHER HELPERS ---
  const getVoucherStatus = (startDate, expirationDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(expirationDate);
    end.setHours(0, 0, 0, 0);

    if (today < start) return 'Upcoming';
    if (today > end) return 'Expired';
    return 'Active';
  };

  const validateVoucherInput = (data, isCreating = true) => {
    if (!data.code.trim() || !data.discountPercentage || !data.startDate || !data.expirationDate) {
      return 'All fields (Voucher Code, Discount %, Start Date, and Expiration Date) are required.';
    }
    const discount = parseFloat(data.discountPercentage);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      return 'Discount percentage must be greater than 0 and no more than 100.';
    }
    const start = new Date(data.startDate);
    const end = new Date(data.expirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (end <= start) {
      return 'Expiration Date must be later than Start Date.';
    }
    if (isCreating && end < today) {
      return 'Expiration Date cannot be in the past.';
    }
    return null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // --- VOUCHER HANDLERS ---
  const handleVoucherSubmit = (e) => {
    e.preventDefault();
    setVoucherMessage(null);

    const validationError = validateVoucherInput(voucherData, true);
    if (validationError) {
      setVoucherMessage({ type: 'error', text: validationError });
      return;
    }

    setIsVoucherLoading(true);

    const payload = {
      code: voucherData.code.trim().toUpperCase(),
      discountPercentage: parseFloat(voucherData.discountPercentage),
      startDate: voucherData.startDate,
      expirationDate: voucherData.expirationDate,
    };

    axios
      .post(`${apiUrl}/api/Payments/vouchers`, payload, authConfig)
      .then(() => {
        setVoucherMessage({ type: 'success', text: 'Voucher created successfully!' });
        setVoucherData({ code: '', discountPercentage: '', startDate: '', expirationDate: '' });
        fetchVouchers();
      })
      .catch((err) => {
        setVoucherMessage({
          type: 'error',
          text: err.response?.data?.message || 'Failed to create voucher.',
        });
      })
      .finally(() => setIsVoucherLoading(false));
  };

  const openEditModal = (voucher) => {
    setEditError(null);
    setEditingVoucher({
      id: voucher.id,
      code: voucher.code,
      discountPercentage: voucher.discountPercentage,
      startDate: voucher.startDate ? voucher.startDate.split('T')[0] : '',
      expirationDate: voucher.expirationDate ? voucher.expirationDate.split('T')[0] : '',
    });
  };

  const handleUpdateVoucher = (e) => {
    e.preventDefault();
    setEditError(null);

    const validationError = validateVoucherInput(editingVoucher, false);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setIsEditLoading(true);

    const payload = {
      code: editingVoucher.code.trim().toUpperCase(),
      discountPercentage: parseFloat(editingVoucher.discountPercentage),
      startDate: editingVoucher.startDate,
      expirationDate: editingVoucher.expirationDate,
    };

    axios
      .put(`${apiUrl}/api/Payments/vouchers/${editingVoucher.id}`, payload, authConfig)
      .then(() => {
        setEditingVoucher(null);
        setVoucherMessage({ type: 'success', text: 'Voucher updated successfully!' });
        fetchVouchers();
      })
      .catch((err) => {
        setEditError(err.response?.data?.message || 'Failed to update voucher.');
      })
      .finally(() => setIsEditLoading(false));
  };

  const handleDeleteVoucher = (voucher) => {
    if (!window.confirm(`Are you sure you want to delete voucher "${voucher.code}"?`)) {
      return;
    }

    axios
      .delete(`${apiUrl}/api/Payments/vouchers/${voucher.id}`, authConfig)
      .then(() => {
        setVoucherMessage({ type: 'success', text: `Voucher "${voucher.code}" deleted.` });
        fetchVouchers();
      })
      .catch((err) => {
        setVoucherMessage({
          type: 'error',
          text: err.response?.data?.message || 'Failed to delete voucher.',
        });
      });
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredVouchers = vouchers
    .map((v) => ({
      ...v,
      computedStatus: getVoucherStatus(v.startDate, v.expirationDate),
    }))
    .filter((v) => {
      const matchesSearch = v.code.toLowerCase().includes(voucherSearch.toLowerCase());
      const matchesStatus = statusFilter === 'All' || v.computedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      if (sortConfig.key === 'code') return a.code.localeCompare(b.code) * dir;
      if (sortConfig.key === 'discountPercentage') {
        return (a.discountPercentage - b.discountPercentage) * dir;
      }
      return (new Date(a.expirationDate) - new Date(b.expirationDate)) * dir;
    });

  // --- ROOM PRICE HANDLERS ---
  const handlePriceChange = (id, newPrice) => {
    setRoomTypes(roomTypes.map((rt) => (rt.id === id ? { ...rt, basePrice: newPrice } : rt)));
  };

  const handleUpdatePrice = (id, newPrice) => {
    setPriceMessage(null);
    const priceToUpdate = parseFloat(newPrice);

    axios
      .patch(`${apiUrl}/api/RoomTypes/${id}/price`, { basePrice: priceToUpdate }, authConfig)
      .then(() => {
        setPriceMessage({ type: 'success', text: 'Price updated successfully!' });
        fetchRoomTypes();
      })
      .catch((err) => {
        setPriceMessage({
          type: 'error',
          text: err.response?.data?.message || 'Failed to update price.',
        });
      });
  };

  return (
    <div className="hb-page" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      {/* HEADER SECTION */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '32px', margin: '0 0 8px 0', fontWeight: 700 }}>
          Manage Pricing & Discounts
        </h2>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: '16px' }}>
          Control base room rates and generate promotional vouchers for guests.
        </p>
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
              <label style={labelStyle}>
                <FaTags color={COLORS.muted} /> Voucher Code
              </label>
              <input
                type="text"
                placeholder="e.g., HOLIDAY25"
                value={voucherData.code}
                onChange={(e) => setVoucherData({ ...voucherData, code: e.target.value.toUpperCase() })}
                required
                className="hb-input"
                style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '1px' }}
              />
            </div>

            <div>
              <label style={labelStyle}>
                <FaPercent color={COLORS.muted} /> Discount Percentage (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                placeholder="e.g., 15.5"
                value={voucherData.discountPercentage}
                onChange={(e) => setVoucherData({ ...voucherData, discountPercentage: e.target.value })}
                required
                className="hb-input"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>
                  <FaCalendarAlt color={COLORS.muted} /> Start Date
                </label>
                <input
                  type="date"
                  value={voucherData.startDate}
                  onChange={(e) => setVoucherData({ ...voucherData, startDate: e.target.value })}
                  required
                  className="hb-input"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  <FaCalendarAlt color={COLORS.muted} /> Expiration Date
                </label>
                <input
                  type="date"
                  value={voucherData.expirationDate}
                  onChange={(e) => setVoucherData({ ...voucherData, expirationDate: e.target.value })}
                  required
                  className="hb-input"
                  style={inputStyle}
                />
              </div>
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
            {roomTypes.map((rt) => (
              <div
                key={rt.id}
                className="hb-price-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '15px 20px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '12px',
                  backgroundColor: COLORS.pageBg,
                  transition: 'box-shadow 0.2s',
                  flexWrap: 'wrap',
                  gap: '15px',
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '16px', color: COLORS.ink }}>
                  {rt.name || rt.typeName}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', border: `1px solid ${COLORS.border}`, borderRadius: '8px', overflow: 'hidden' }}>
                    <span style={{ padding: '10px 15px', backgroundColor: COLORS.emeraldSoft, color: COLORS.emeraldDark, fontWeight: 'bold', borderRight: `1px solid ${COLORS.border}` }}>
                      ₱
                    </span>
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
                      padding: '10px 16px',
                      backgroundColor: COLORS.emerald,
                      color: COLORS.ivory,
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      fontFamily: "'Inter', sans-serif",
                      transition: 'background-color 0.15s',
                      boxShadow: '0 2px 4px rgba(31,93,79,0.2)',
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

      {/* VOUCHER MANAGEMENT TABLE */}
      <div style={{ ...cardStyle, marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '15px' }}>
          <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", color: COLORS.ink, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 600 }}>
            <FaTags color={COLORS.emerald} /> Discount Voucher Management
          </h3>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <FaSearch color={COLORS.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }} />
              <input
                type="text"
                placeholder="Search voucher code..."
                value={voucherSearch}
                onChange={(e) => setVoucherSearch(e.target.value)}
                className="hb-input"
                style={{ ...inputStyle, padding: '10px 12px 10px 36px', width: '220px', fontSize: '14px' }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="hb-input"
              style={{ ...inputStyle, padding: '10px 14px', width: '160px', fontSize: '14px', cursor: 'pointer' }}
            >
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {filteredVouchers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: COLORS.muted, fontSize: '15px' }}>
            {vouchers.length === 0 ? 'No vouchers created yet.' : 'No vouchers match your search or filter.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: COLORS.pageBg, color: COLORS.text, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>
                  <th onClick={() => handleSort('code')} style={{ ...thStyle, cursor: 'pointer' }}>
                    Voucher Code <FaSort style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                  </th>
                  <th onClick={() => handleSort('discountPercentage')} style={{ ...thStyle, cursor: 'pointer' }}>
                    Discount (%) <FaSort style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                  </th>
                  <th style={thStyle}>Start Date</th>
                  <th onClick={() => handleSort('expirationDate')} style={{ ...thStyle, cursor: 'pointer' }}>
                    Expiration Date <FaSort style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                  </th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map((v) => {
                  const statusStyle = {
                    Active: { bg: COLORS.emeraldSoft, color: COLORS.emeraldDark },
                    Upcoming: { bg: COLORS.blueSoft, color: COLORS.blue },
                    Expired: { bg: COLORS.roseSoft, color: COLORS.rose },
                  }[v.computedStatus];

                  return (
                    <tr key={v.id} className="hb-voucher-row" style={{ borderBottom: `1px solid ${COLORS.border}`, transition: 'background-color 0.15s' }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: COLORS.ink, letterSpacing: '0.5px' }}>{v.code}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: COLORS.emerald }}>{v.discountPercentage}%</td>
                      <td style={tdStyle}>{formatDate(v.startDate)}</td>
                      <td style={tdStyle}>{formatDate(v.expirationDate)}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            padding: '5px 12px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'inline-block',
                          }}
                        >
                          {v.computedStatus}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => openEditModal(v)}
                            title="Edit Voucher"
                            style={{
                              padding: '7px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: COLORS.blueSoft,
                              color: COLORS.blue,
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteVoucher(v)}
                            title="Delete Voucher"
                            style={{
                              padding: '7px 12px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: COLORS.roseSoft,
                              color: COLORS.rose,
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT VOUCHER MODAL */}
      {editingVoucher && (
        <div
          onClick={() => setEditingVoucher(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(13,43,38,0.45)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              ...cardStyle,
              width: '100%',
              maxWidth: '460px',
              padding: '30px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '20px' }}>
                Edit Voucher
              </h3>
              <button
                type="button"
                onClick={() => setEditingVoucher(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.muted, fontSize: '18px' }}
              >
                <FaTimes />
              </button>
            </div>

            {editError && (
              <div style={getMessageStyle('error')}>
                <FaInfoCircle size={18} />
                <strong>{editError}</strong>
              </div>
            )}

            <form onSubmit={handleUpdateVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Voucher Code</label>
                <input
                  type="text"
                  required
                  value={editingVoucher.code}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, code: e.target.value.toUpperCase() })}
                  className="hb-input"
                  style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '1px' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Discount Percentage (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100"
                  required
                  value={editingVoucher.discountPercentage}
                  onChange={(e) => setEditingVoucher({ ...editingVoucher, discountPercentage: e.target.value })}
                  className="hb-input"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input
                    type="date"
                    required
                    value={editingVoucher.startDate}
                    onChange={(e) => setEditingVoucher({ ...editingVoucher, startDate: e.target.value })}
                    className="hb-input"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={editingVoucher.expirationDate}
                    onChange={(e) => setEditingVoucher({ ...editingVoucher, expirationDate: e.target.value })}
                    className="hb-input"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingVoucher(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: `1px solid ${COLORS.border}`,
                    backgroundColor: 'white',
                    color: COLORS.text,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditLoading}
                  className="hb-submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isEditLoading ? '#adb5bd' : COLORS.emerald,
                    color: COLORS.ivory,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {isEditLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Reusable Inline Styles ---
const cardStyle = {
  backgroundColor: 'white',
  padding: '35px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(13,43,38,0.05)',
  border: `1px solid ${COLORS.border}`,
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
  paddingBottom: '15px',
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: '600',
  color: COLORS.text,
};

const inputStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: '8px',
  border: `1.5px solid ${COLORS.border}`,
  fontSize: '15px',
  fontFamily: "'Inter', sans-serif",
  backgroundColor: COLORS.pageBg,
  color: COLORS.ink,
  boxSizing: 'border-box',
  outline: 'none',
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
  width: '100%',
};

const thStyle = {
  padding: '14px 16px',
  fontWeight: 700,
};

const tdStyle = {
  padding: '14px 16px',
  fontSize: '14px',
  color: COLORS.text,
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
  borderLeft: `4px solid ${type === 'success' ? COLORS.emerald : COLORS.rose}`,
});