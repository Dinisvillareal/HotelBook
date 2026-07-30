import { useState, useEffect } from 'react';
import axios from 'axios';

export default function RoomMatrix() {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const typesPerPage = 4; 

  const [dates, setDates] = useState(() => {
    const today = new Date();
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  });

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsRes = await axios.get(`${apiUrl}/api/Rooms`, authConfig);
        const resRes = await axios.get(`${apiUrl}/api/Reservations`, authConfig);
        
        setRooms(roomsRes.data.$values || roomsRes.data);
        setReservations(resRes.data.$values || resRes.data);
      } catch (error) {
        console.error("Error fetching matrix data:", error);
      }
    };

    fetchData();
  }, []);

  // --- UPDATED LOGIC: 3-State Availability ---
  const checkAvailability = (roomId, targetDate) => {
    // Safely format the target date to exactly midnight
    const target = new Date(targetDate);
    target.setHours(0,0,0,0);

    // 1. Check if the room is OCCUPIED FOR THE NIGHT (Red)
    const activeRes = reservations.find(r => {
      if (r.status === "Cancelled") return false;
      const checkIn = new Date(r.checkInDate);
      const checkOut = new Date(r.checkOutDate);
      checkIn.setHours(0,0,0,0);
      checkOut.setHours(0,0,0,0);
      
      return r.roomId === roomId && target >= checkIn && target < checkOut;
    });

    if (activeRes) {
      const inStr = new Date(activeRes.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const outStr = new Date(activeRes.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const guest = activeRes.guestName || "Guest";
      
      return { 
        isBooked: true, 
        bg: '#f8d7da', color: '#721c24', border: '#f5c6cb', // RED colors
        text: `Booked by: ${guest}\nCheck-In: ${inStr}\nCheck-Out: ${outStr}\n(Res #${activeRes.id})` 
      };
    }

    // 2. Check if a guest is CHECKING OUT TODAY (Yellow)
    const checkOutRes = reservations.find(r => {
      if (r.status === "Cancelled") return false;
      const checkOut = new Date(r.checkOutDate);
      checkOut.setHours(0,0,0,0);
      
      return r.roomId === roomId && target.getTime() === checkOut.getTime();
    });

    if (checkOutRes) {
      const guest = checkOutRes.guestName || "Guest";
      return { 
        isBooked: false, 
        bg: '#fff3cd', color: '#856404', border: '#ffeeba', // YELLOW colors
        text: `Check-Out Day!\n${guest} is leaving today.\n(Available for afternoon check-in)` 
      };
    }
    
    // 3. Completely AVAILABLE (Green)
    return { 
      isBooked: false, 
      bg: '#d4edda', color: '#155724', border: '#c3e6cb', // GREEN colors
      text: 'Available' 
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

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', overflowX: 'auto', padding: '10px' }}>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '1000px' }}>
        <thead>
          <tr>
            <th style={{ padding: '15px', border: '1px solid #ddd', backgroundColor: '#007bff', color: 'white', position: 'sticky', left: 0, zIndex: 2, minWidth: '120px' }}>
              Room Type
            </th>
            {dates.map(date => (
              <th key={date} style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa', fontSize: '12px' }}>
                {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          
          {currentRoomTypes.map(typeName => {
            const roomsInThisType = groupedRooms[typeName];

            return (
              <tr key={typeName}>
                <td style={{ padding: '15px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: '#fdfdfd', position: 'sticky', left: 0, color: '#333' }}>
                  {typeName} <br/>
                  <span style={{ fontSize: '11px', color: '#888', fontWeight: 'normal' }}>
                    ({roomsInThisType.length} Rooms)
                  </span>
                </td>
                
                {dates.map(date => (
                  <td key={date} style={{ padding: '8px', border: '1px solid #ddd', verticalAlign: 'top' }}>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                      {roomsInThisType.map(room => {
                        const status = checkAvailability(room.id, date);
                        
                        return (
                          <span 
                            key={room.id}
                            title={status.text}
                            style={{ 
                              padding: '4px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'help',
                              // --- UPDATED: Directly using the colors calculated above! ---
                              backgroundColor: status.bg,
                              color: status.color,
                              border: `1px solid ${status.border}`
                            }}
                          >
                            {room.roomNumber}
                          </span>
                        );
                      })}
                    </div>

                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

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