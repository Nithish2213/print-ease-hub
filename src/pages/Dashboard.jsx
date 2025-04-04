
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../context/AuthContext';
import Layout from '../components/Layout';
import StudentDashboard from '../components/student/StudentDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';
import CoAdminDashboard from '../components/co-admin/CoAdminDashboard';

const Dashboard = () => {
  const { currentUser } = useAuth();

  // If not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (currentUser.role) {
      case ROLES.ADMIN:
        return <AdminDashboard />;
      case ROLES.CO_ADMIN:
        return <CoAdminDashboard />;
      case ROLES.STUDENT:
        return <StudentDashboard />;
      default:
        return <div>Unknown user role</div>;
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

export default Dashboard;
