import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserProfile() {
  // 1. We use useState to hold the user's profile info
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
  });

  // 2. We use useEffect to trigger our API call when the page loads
  useEffect(() => {
    // We will add the axios.get call to your C# backend here soon!
    console.log("Profile component mounted, ready to fetch data.");
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2>My Profile</h2>
      <p>Manage your account details and settings here.</p>
      
      {/* A temporary placeholder to show where the data will go */}
      <div style={{ marginTop: '20px' }}>
        <p><strong>Name:</strong> {profileData.fullName || "Loading..."}</p>
        <p><strong>Email:</strong> {profileData.email || "Loading..."}</p>
      </div>
    </div>
  );
}