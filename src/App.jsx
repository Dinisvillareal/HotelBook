import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';

// --- YOUR COMPONENTS ---
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


const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('jwtToken');
  const userRole = localStorage.getItem('userRole'); // Make sure your Login page saves this!

  // 1. If they aren't logged in at all, kick to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. If the route requires specific roles and the user doesn't have it, kick them out
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect based on what they actually are
    if (userRole === 'Customer') return <Navigate to="/customer" replace />;
    return <Navigate to="/" replace />; // Send staff to admin dashboard
  }

  // 3. If they pass the checks, let them in!
  return children;
};

function AdminRoute({ children }) {
  const userRole = localStorage.getItem('userRole');
  if (userRole !== 'Admin') {
    return <Navigate to="/" />; 
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ========================================== */}
        {/* ADMIN & STAFF ROUTES (Wrapped in AdminLayout) */}
        {/* ========================================== */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'FrontDesk']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* These pages inject into the {children} of AdminLayout */}
          <Route index element={<Overview />} /> 
          <Route path="book-room" element={<CreateReservation />} />
          <Route path="rooms" element={<ManageRooms />} />
          <Route path="reservations" element={<ManageReservations />} />
          
          {/* Admin-Only Sub-Routes */}
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
        </Route>

        {/* ========================================== */}
        {/* CUSTOMER ROUTES (Wrapped in CustomerLayout) */}
        {/* ========================================== */}
        <Route 
          path="/customer" 
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          {/* These pages inject into the {children} of CustomerLayout */}
          <Route index element={<CustomerOverview />} />
          
          {/* Note: You can reuse your CreateReservation component here, or make a customer-specific one! */}
          <Route path="book" element={<CreateReservation />} /> 
          
          <Route path="reservations" element={<CustomerReservations />} />
        </Route>

        {/* FALLBACK ROUTE: Catch-all for bad URLs */}
        <Route path="*" element={<Navigate to="/login" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}