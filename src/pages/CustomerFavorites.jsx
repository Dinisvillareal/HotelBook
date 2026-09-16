import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaBed, FaUsers } from 'react-icons/fa';

// Reuse your exact design tokens
const COLORS = {
  ink: '#0D2B26',
  emerald: '#1F5D4F',
  emeraldSoft: '#E5EFEA',
  brassSoft: '#F7EFDD',
  ivory: '#FBF8F1',
  pageBg: '#F6F4EE',
  border: '#eeece4',
  muted: '#8a8f89',
  text: '#495057',
  rose: '#B3413B',
};

export default function CustomerFavorites() {
  const [favoriteRooms, setFavoriteRooms] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem('jwtToken');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const [roomsRes, favsRes] = await Promise.all([
          axios.get(`${apiUrl}/api/RoomTypes`),
          axios.get(`${apiUrl}/api/Favorites`, authConfig)
        ]);

        const allRooms = roomsRes.data.$values || roomsRes.data || [];
        const favIds = favsRes.data || [];

        setFavorites(favIds);
        // Only keep rooms that are in the user's favorite IDs
        setFavoriteRooms(allRooms.filter(room => favIds.includes(room.id)));
      } catch (err) {
        console.error('Failed to load favorites', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const toggleFavorite = async (roomId) => {
    try {
      await axios.post(`${apiUrl}/api/Favorites/${roomId}/toggle`, {}, authConfig);
      // Remove it from the list instantly for a snappy UI
      setFavorites(prev => prev.filter(id => id !== roomId));
      setFavoriteRooms(prev => prev.filter(room => room.id !== roomId));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '60px', color: COLORS.muted }}>Loading your favorites...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', margin: '0 auto 15px auto', backgroundColor: COLORS.roseSoft, color: COLORS.rose, borderRadius: '50%' }}>
          <FaHeart size={24} />
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink, fontSize: '30px', margin: '0 0 8px 0', fontWeight: 700 }}>Saved Rooms</h1>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: '16px' }}>Your personal shortlist for future getaways.</p>
      </div>

      {favoriteRooms.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', border: `1px solid ${COLORS.border}`, color: COLORS.muted }}>
          You haven't saved any rooms yet! Click the heart icon on any room to add it here.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
          {favoriteRooms.map(room => (
            <div key={room.id} style={{ position: 'relative', backgroundColor: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(13,43,38,0.05)', border: `1px solid ${COLORS.border}` }}>
              <button
                onClick={() => toggleFavorite(room.id)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}
              >
                <FaHeart color={COLORS.rose} size={18} />
              </button>

              <div style={{ height: '110px', background: `linear-gradient(135deg, ${COLORS.emeraldSoft}, ${COLORS.brassSoft})`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: COLORS.emerald }}>
                <FaBed size={36} />
              </div>
              <div style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: COLORS.ink, fontSize: '17px', fontFamily: "'Fraunces', serif", fontWeight: 700 }}>{room.name}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: COLORS.text, fontSize: '14px', marginBottom: '16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: COLORS.muted }}><FaUsers size={12} /> {room.capacity} Pax</span>
                  <span style={{ color: COLORS.emerald, fontWeight: 700 }}>₱{room.basePrice} /night</span>
                </div>
                <button
                  onClick={() => navigate('/customer/book')}
                  style={{ width: '100%', padding: '11px', backgroundColor: COLORS.emerald, color: COLORS.ivory, border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', fontFamily: "'Inter', sans-serif" }}
                >
                  Book This Room
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}