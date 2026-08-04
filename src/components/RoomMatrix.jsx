import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBed } from 'react-icons/fa';

// ---- Design tokens (matches Login/Register/AdminLayout/Overview/ManageReservations) ----
const COLORS = {
  ink: '#0D2B26',
  emerald: '#1F5D4F',
  emeraldDark: '#123028',
  emeraldSoft: '#E5EFEA',
  brass: '#C6A15B',
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
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
  .hb-matrix * { box-sizing: border-box; }

  .hb-chip { position: relative; cursor: help; }
  .hb-chip:hover, .hb-chip:focus-visible { transform: translateY(-1px); filter: brightness(0.97); z-index: 5; }
  .hb-chip:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 1px; }

  .hb-chip::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 9px);
    left: 50%;
    transform: translateX(-50%);
    background: ${COLORS.ink};
    color: ${COLORS.ivory};
    padding: 9px 12px;
    border-radius: 8px;
    font-size: 12px;
    line-height: 1.5;
    font-weight: 500;
    white-space: pre-line;
    width: max-content;
    max-width: 220px;
    box-shadow: 0 8px 20px rgba(13,43,38,0.25);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.12s ease;
    pointer-events: none;
    z-index: 100;
  }
  .hb-chip::before {
    content: '';
    position: absolute;
    bottom: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: ${COLORS.ink};
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.12s ease;
    pointer-events: none;
    z-index: 100;
  }
  .hb-chip:hover::after, .hb-chip:hover::before,
  .hb-chip:focus-visible::after, .hb-chip:focus-visible::before {
    opacity: 1;
    visibility: visible;
  }

  .hb-row:hover td { background-color: ${COLORS.pageBg} !important; }
  .hb-page-btn:not(:disabled):hover { background-color: ${COLORS.emeraldSoft} !important; border-color: ${COLORS.emerald} !important; color: ${COLORS.emeraldDark} !important; }
  .hb-page-btn:focus-visible { outline: 2px solid ${COLORS.emerald}; outline-offset: 2px; }
`;

const WEEKDAY_LABEL = (date) => date.toLocaleDateString('en-GB', { weekday: 'short' });
const DAY_LABEL = (date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const LEGEND = [
  { label: 'Available', bg: COLORS.emeraldSoft, color: COLORS.emeraldDark, border: COLORS.emerald },
  { label: 'Checking Out Today', bg: COLORS.amberSoft, color: COLORS.amber, border: COLORS.amberBorder },
  { label: 'Booked', bg: COLORS.roseSoft, color: COLORS.rose, border: COLORS.roseBorder },
];

export default function RoomMatrix() {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const typesPerPage = 4;

  const [dates] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [roomsRes, resRes] = await Promise.all([
          axios.get(`${apiUrl}/api/Rooms`, authConfig),
          axios.get(`${apiUrl}/api/Reservations`, authConfig),
        ]);

        setRooms(roomsRes.data.$values || roomsRes.data);
        setReservations(resRes.data.$values || resRes.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching matrix data:', err);
        setError('Could not load the availability matrix. Please try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 3-State Availability ---
  const checkAvailability = (roomId, targetDate) => {
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    // 1. OCCUPIED FOR THE NIGHT (Rose)
    const activeRes = reservations.find(r => {
      if (r.status === 'Cancelled') return false;
      const checkIn = new Date(r.checkInDate);
      const checkOut = new Date(r.checkOutDate);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);

      return r.roomId === roomId && target >= checkIn && target < checkOut;
    });

    if (activeRes) {
      const inStr = new Date(activeRes.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const outStr = new Date(activeRes.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const guest = activeRes.guestName || 'Guest';

      return {
        isBooked: true,
        bg: COLORS.roseSoft, color: COLORS.rose, border: COLORS.roseBorder,
        text: `Booked by ${guest}\nCheck-In: ${inStr}\nCheck-Out: ${outStr}\nRes #${activeRes.id}`,
      };
    }

    // 2. CHECKING OUT TODAY (Amber)
    const checkOutRes = reservations.find(r => {
      if (r.status === 'Cancelled') return false;
      const checkOut = new Date(r.checkOutDate);
      checkOut.setHours(0, 0, 0, 0);

      return r.roomId === roomId && target.getTime() === checkOut.getTime();
    });

    if (checkOutRes) {
      const guest = checkOutRes.guestName || 'Guest';
      return {
        isBooked: false,
        bg: COLORS.amberSoft, color: COLORS.amber, border: COLORS.amberBorder,
        text: `Check-Out Day\n${guest} is leaving today.\nAvailable for afternoon check-in.`,
      };
    }

    // 3. AVAILABLE (Emerald)
    return {
      isBooked: false,
      bg: COLORS.emeraldSoft, color: COLORS.emeraldDark, border: COLORS.emerald,
      text: 'Available',
    };
  };

  const groupedRooms = rooms.reduce((acc, room) => {
    const typeName = room.roomType || room.roomTypeName || 'Unassigned';
    if (!acc[typeName]) acc[typeName] = [];

    acc[typeName].push(room);
    acc[typeName].sort((a, b) => a.roomNumber.toString().localeCompare(b.roomNumber.toString()));

    return acc;
  }, {});

  const allRoomTypes = Object.keys(groupedRooms).sort();

  const indexOfLastType = currentPage * typesPerPage;
  const indexOfFirstType = indexOfLastType - typesPerPage;
  const currentRoomTypes = allRoomTypes.slice(indexOfFirstType, indexOfLastType);
  const totalPages = Math.ceil(allRoomTypes.length / typesPerPage);

  if (isLoading) {
    return (
      <div className="hb-matrix" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: COLORS.muted, fontFamily: "'Inter', sans-serif" }}>
        <style>{globalStyles}</style>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}>Loading availability…</h3>
      </div>
    );
  }

  return (
    <div className="hb-matrix" style={{ backgroundColor: 'white', borderRadius: '16px', border: `1px solid ${COLORS.border}`, boxShadow: '0 4px 15px rgba(13,43,38,0.04)', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      <style>{globalStyles}</style>

      {error && (
        <div style={{ padding: '13px 18px', backgroundColor: COLORS.roseSoft, color: COLORS.rose, borderRadius: '8px', marginBottom: '18px', borderLeft: `4px solid ${COLORS.rose}`, fontWeight: 500, fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* LEGEND */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', marginBottom: '20px' }}>
        {LEGEND.map(({ label, bg, color, border }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: COLORS.text, fontWeight: 500 }}>
            <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: bg, border: `1.5px solid ${border}` }} />
            {label}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: COLORS.text, fontWeight: 500, marginLeft: 'auto' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: COLORS.emeraldSoft, border: `1.5px solid ${COLORS.brass}` }} />
          Today
        </div>
      </div>

      {allRoomTypes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.muted }}>
          <FaBed size={36} style={{ marginBottom: '14px', color: COLORS.border }} />
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: COLORS.text }}>No rooms to display</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', borderRadius: '10px', border: `1px solid ${COLORS.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'center', minWidth: '1100px' }}>
              <thead>
                <tr>
                  <th
                    style={{
                      padding: '16px', backgroundColor: COLORS.emerald, color: COLORS.ivory,
                      position: 'sticky', left: 0, top: 0, zIndex: 3, minWidth: '160px',
                      fontFamily: "'Fraunces', serif", fontSize: '14px', fontWeight: 600, textAlign: 'left',
                      borderRight: `1px solid rgba(251,248,241,0.15)`,
                    }}
                  >
                    Room Type
                  </th>
                  {dates.map(date => {
                    const isToday = isSameDay(date, today);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    return (
                      <th
                        key={date.toISOString()}
                        style={{
                          padding: '10px 6px',
                          backgroundColor: isToday ? COLORS.emeraldDark : (isWeekend ? '#efece2' : COLORS.pageBg),
                          color: isToday ? COLORS.ivory : COLORS.text,
                          position: 'sticky', top: 0, zIndex: 2,
                          minWidth: '78px',
                          borderBottom: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.4px', opacity: 0.75, fontWeight: 600, marginBottom: '2px' }}>
                          {isToday ? 'Today' : WEEKDAY_LABEL(date)}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>
                          {DAY_LABEL(date)}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {currentRoomTypes.map(typeName => {
                  const roomsInThisType = groupedRooms[typeName];

                  return (
                    <tr key={typeName} className="hb-row">
                      <td
                        style={{
                          padding: '16px', fontWeight: 700, backgroundColor: 'white',
                          position: 'sticky', left: 0, zIndex: 1, color: COLORS.ink,
                          textAlign: 'left', borderRight: `1px solid ${COLORS.border}`,
                          borderBottom: `1px solid ${COLORS.border}`,
                          fontFamily: "'Fraunces', serif", fontSize: '15px',
                          transition: 'background-color 0.1s',
                        }}
                      >
                        {typeName}
                        <div style={{ fontSize: '12px', color: COLORS.muted, fontWeight: 500, fontFamily: "'Inter', sans-serif", marginTop: '3px' }}>
                          {roomsInThisType.length} room{roomsInThisType.length !== 1 ? 's' : ''}
                        </div>
                      </td>

                      {dates.map(date => {
                        const isToday = isSameDay(date, today);
                        return (
                          <td
                            key={date.toISOString()}
                            style={{
                              padding: '8px 6px', verticalAlign: 'top',
                              backgroundColor: isToday ? COLORS.emeraldSoft : 'white',
                              borderBottom: `1px solid ${COLORS.border}`,
                              transition: 'background-color 0.1s',
                            }}
                          >
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
                              {roomsInThisType.map(room => {
                                const status = checkAvailability(room.id, date);

                                return (
                                  <span
                                    key={room.id}
                                    tabIndex={0}
                                    className="hb-chip"
                                    data-tooltip={status.text}
                                    style={{
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      backgroundColor: status.bg,
                                      color: status.color,
                                      border: `1px solid ${status.border}`,
                                      transition: 'transform 0.1s, filter 0.1s',
                                    }}
                                  >
                                    {room.roomNumber}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <button
              className="hb-page-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={paginationBtnStyle(currentPage === 1)}
            >
              Previous
            </button>

            <span style={{ fontSize: '14px', color: COLORS.muted, fontWeight: 600 }}>
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              className="hb-page-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={paginationBtnStyle(currentPage === totalPages || totalPages === 0)}
            >
              Next
            </button>
          </div>
        </>
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
  fontFamily: "'Inter', sans-serif",
  transition: 'all 0.15s',
});