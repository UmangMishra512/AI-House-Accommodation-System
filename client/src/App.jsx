import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Suspense, lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PropertyListing = lazy(() => import('./pages/PropertyListing'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Compare = lazy(() => import('./pages/Compare'));
const PropertyTours = lazy(() => import('./pages/PropertyTours'));
const InteriorDesign = lazy(() => import('./pages/InteriorDesign'));
const InstantInquiries = lazy(() => import('./pages/InstantInquiries'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const App = () => {
  const location = useLocation();
  return (
    <div className="font-sans antialiased text-gray-900 dark:text-white bg-white dark:bg-gray-900 dark:text-gray-100 min-h-screen flex flex-col transition-colors duration-300">
      <Navbar />
      <main key={location.pathname} className="flex-grow animate-fade-in">
        <Suspense fallback={<div className="flex items-center justify-center h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/properties" element={<PropertyListing />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/3d-tours" element={<PropertyTours />} />
            <Route path="/interior-design" element={<InteriorDesign />} />
            <Route path="/instant-inquiries" element={<InstantInquiries />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default App;
