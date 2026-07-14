import { useState } from 'react';
import axios from 'axios';

export default function RegisterStaff() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'FrontDesk' // Default to the safest role
  });
  
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('jwtToken');
  
  // Attach the token so the backend knows an Admin is making this request!
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Make sure this URL matches your actual C# AuthController endpoint!
    axios.post(`${apiUrl}/api/Auth/register-staff`, formData, authConfig)
      .then(response => {
        setMessage({ type: 'success', text: `Success! ${formData.fullName} has been registered as ${formData.role}.` });
        
        // Clear the form for the next entry
        setFormData({ fullName: '', username: '', email: '', password: '', role: 'FrontDesk' }); 
      })
      .catch(err => {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to register staff member.' });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div style={{ padding: '30px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ color: '#007bff', marginBottom: '20px', textAlign: 'center' }}>Register New Staff</h2>
      
      {message && (
        <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '4px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
          {message.text}
        </div>
      )}

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Temporary Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Assign Role</label>
            <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="FrontDesk">Front Desk</option>
              <option value="Admin">System Admin</option>
            </select>
          </div>

          <button type="submit" disabled={isLoading} style={{ marginTop: '15px', padding: '12px', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
            {isLoading ? 'Registering...' : 'Create Staff Account'}
          </button>
        </form>
      </div>
    </div>
  );
}