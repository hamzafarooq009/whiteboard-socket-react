import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginComponent from './component/LoginComponent';
import RegistrationComponent from './component/RegistrationComponent';
import DashboardComponent from './component/DashboardComponent';
import Whiteboard from './component/Whiteboard'; // Import the Whiteboard component
import { AuthProvider, useAuth } from './component/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/register" element={<RegistrationComponent />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardComponent /></PrivateRoute>} />
          <Route path="/whiteboard/:id" element={<PrivateRoute><Whiteboard /></PrivateRoute>} /> {/* New route for whiteboard */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;