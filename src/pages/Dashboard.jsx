
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../context/AuthContext';
import Layout from '../components/Layout';
import StudentDashboard from '../components/student/StudentDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';
import CoAdminDashboard from '../components/co-admin/CoAdminDashboard';
import PrintDetails from '../components/student/PrintDetails';
import OrderTracking from '../components/student/OrderTracking';
import OrderHistory from '../components/student/OrderHistory';

const Dashboard = ({ content }) => {
  const { currentUser } = useAuth();

  // If not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // Render appropriate dashboard based on user role and content type
  const renderContent = () => {
    // Handle student-specific content views
    if (currentUser.role === ROLES.STUDENT) {
      switch (content) {
        case 'print':
          return <PrintDetails />;
        case 'tracking':
          return <OrderTracking />;
        case 'orders':
          return <OrderHistory />;
        default:
          return <StudentDashboard />;
      }
    }

    // For admin and co-admin, always show their dashboards
    switch (currentUser.role) {
      case ROLES.ADMIN:
        return <AdminDashboard />;
      case ROLES.CO_ADMIN:
        return <CoAdminDashboard />;
      default:
        return <div>Unknown user role</div>;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
};

export default Dashboard;
