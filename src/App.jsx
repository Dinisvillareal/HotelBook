import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';

// --- YOUR COMPONENTS ---
import LandingPage from './pages/LandingPage'; // <-- 1. ADD THIS IMPORT
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './components/AdminLayout';
import CustomerLayout from './components/CustomerLayout';
// Admin Pages
import Overview from './pages/Overview';
import CreateReservation from './pages/CreateReservation';
import ManageRooms from './pages/ManageRooms';
import ManageReservations from './pages/ManageReservations';
import ManagePrices from './pages/ManagePrices';
import RegisterStaff from './pages/RegisterStaff';
// Customer Pages
import CustomerOverview from './pages/CustomerOverview';
import CustomerReservations from './pages/CustomerReservations';
import UserProfile from './pages/UserProfile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = sessionStorage.getItem('jwtToken');
  const userRole = sessionStorage.getItem('userRole'); 

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'Customer') return <Navigate to="/customer" replace />;
    return <Navigate to="/admin" replace />; // <-- Make sure this points to /admin!
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        {/* 2. ADD THE LANDING PAGE ROUTE HERE */}
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ========================================== */}
        {/* ADMIN & STAFF ROUTES */}
        {/* ========================================== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} /> 
          <Route path="book-room" element={<CreateReservation />} />
          <Route path="rooms" element={<ManageRooms />} />
          <Route path="reservations" element={<ManageReservations />} />
          
          <Route path="prices" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManagePrices />
            </ProtectedRoute>
          } />
          <Route path="staff" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <RegisterStaff />
            </ProtectedRoute>
          } />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* ========================================== */}
        {/* CUSTOMER ROUTES */}
        {/* ========================================== */}
        <Route 
          path="/customer" 
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerOverview />} />
          <Route path="book" element={<CreateReservation />} /> 
          <Route path="reservations" element={<CustomerReservations />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* FALLBACK ROUTE: Catch-all for bad URLs */}
        {/* 3. Change the fallback to redirect to the landing page instead of login */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}