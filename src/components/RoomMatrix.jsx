import { useState, useEffect } from 'react';
import axios from 'axios';

export default function RoomMatrix() {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
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
    // Only fetch Rooms and Reservations here!
    const fetchData = async () => {
      try {
        const roomsRes = await axios.get(`${apiUrl}/api/Rooms`, authConfig);
        const resRes = await axios.get(`${apiUrl}/api/Reservations`, authConfig);
        
        // Handle normal arrays or $values depending on how C# serialized it
        setRooms(roomsRes.data.$values || roomsRes.data);
        setReservations(resRes.data.$values || resRes.data);
      } catch (error) {
        console.error("Error fetching matrix data:", error);
      }
    };

    fetchData();
  }, []);

  // 3. The Core Logic: Check if a room is booked on a specific date
  const checkAvailability = (roomId, targetDate) => {
    const activeRes = reservations.find(r => {
      // Ignore cancelled bookings
      if (r.status === "Cancelled") return false;

      const checkIn = new Date(r.checkInDate);
      const checkOut = new Date(r.checkOutDate);
      
      // Reset times to midnight so we strictly compare the dates
      checkIn.setHours(0,0,0,0);
      checkOut.setHours(0,0,0,0);
      const target = new Date(targetDate);
      target.setHours(0,0,0,0);

      // It is booked if the target date falls between Check-In and BEFORE Check-out
      return r.roomId === roomId && target >= checkIn && target < checkOut;
    });

    if (activeRes) {
      return { isBooked: true, text: `Res #${activeRes.id}` };
    }
    return { isBooked: false, text: 'Available' };
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
      <h3 style={{ marginTop: 0, color: '#333' }}>14-Day Room Availability Matrix</h3>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '800px' }}>
        <thead>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa', position: 'sticky', left: 0, zIndex: 2 }}>Room</th>
            {dates.map(date => (
              <th key={date} style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa', fontSize: '12px' }}>
                {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room.id}>
              {/* Room Name Column */}
              <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', backgroundColor: 'white', position: 'sticky', left: 0 }}>
                {room.roomNumber} <br/><span style={{fontSize: '11px', color: '#666', fontWeight: 'normal'}}>{room.roomType || room.roomTypeName}</span>
              </td>
              
              {/* The Date Grid */}
              {dates.map(date => {
                const status = checkAvailability(room.id, date);
                return (
                  <td 
                    key={date} 
                    style={{ 
                      padding: '10px', 
                      border: '1px solid #ddd', 
                      backgroundColor: status.isBooked ? '#f8d7da' : '#d4edda',
                      color: status.isBooked ? '#721c24' : '#155724',
                      fontSize: '12px',
                      fontWeight: status.isBooked ? 'bold' : 'normal'
                    }}
                  >
                    {status.text}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}