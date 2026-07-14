
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Send credentials to your C# Auth endpoint
    axios.post(`${apiUrl}/api/Auth/login`, credentials)
      .then(response => {
        const token = response.data.token || response.data; 
        localStorage.setItem('jwtToken', token); 
        
        let finalRole = 'Customer'; // Set a safe default

        // 1. DECODE THE JWT TO GET THE ROLE
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
          finalRole = payload[roleKey] || payload.role || 'Customer';
        } catch (e) {
          console.error("Could not decode token", e);
        }

        // 2. Save it to local storage exactly ONCE
        localStorage.setItem('userRole', finalRole);

        // 3. Traffic cop redirect using the role we just decoded!
        if (finalRole === 'Customer') {
          navigate('/customer');
        } else {
          navigate('/'); // Admins & FrontDesk go to the main dashboard
        }        
      })
      .catch(err => {
        console.error("Login error:", err);
        setError("Invalid username or password. Please try again.");
        setIsLoading(false);
      });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f6f8', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', color: '#007bff', marginBottom: '30px' }}>HotelBook Admin</h2>
        
        {error && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email / Username</label>
            <input type="text" name="username" value={credentials.username} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
            <input type="password" name="password" value={credentials.password} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <button type="submit" disabled={isLoading} style={{ padding: '12px', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Register here</Link>
        </div>
        </form>
      </div>
    </div>
  );
}