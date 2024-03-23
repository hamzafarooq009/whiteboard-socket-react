// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginComponent from './component/user-management/LoginComponent';
import RegistrationComponent from './component/user-management/RegistrationComponent';
import DashboardComponent from './component/dashboard/DashboardComponent';
import Whiteboard from './component/whiteboard/Whiteboard';
import { AuthProvider, useAuth } from './component/AuthContext';
import Layout from '../src/Layout'; // Import the Layout component
import HomePage from './HomePage';


const PrivateRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/register" element={<RegistrationComponent />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardComponent /></PrivateRoute>} />
          <Route path="/whiteboard/:id" element={<PrivateRoute><Whiteboard /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;