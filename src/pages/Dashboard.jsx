
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import Layout from '../components/Layout';
import StudentDashboard from '../components/student/StudentDashboard';
import AdminDashboard from '../components/admin/AdminDashboard';
import CoAdminDashboard from '../components/co-admin/CoAdminDashboard';
import PrintDetails from '../components/student/PrintDetails';
import OrderTracking from '../components/student/OrderTracking';
import OrderHistory from '../components/student/OrderHistory';
import InventoryManagement from '../components/co-admin/InventoryManagement';
import ManageOrders from '../components/co-admin/ManageOrders';
import PrinterControls from '../components/co-admin/PrinterControls';
import StaffManagement from '../components/admin/StaffManagement';
import RevenueReport from '../components/admin/RevenueReport';

const Dashboard = ({ content }) => {
  const { currentUser } = useAuth();
  const { printerStatus, notifications } = useOrders();

  // If not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // Get unread notifications count for the order status
  const getUnreadNotifications = () => {
    return notifications.filter(notif => !notif.read && notif.type === 'new-order').length;
  };

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
          return <StudentDashboard showOnlyNewOrder={true} />; // Only show new order card
      }
    }

    // Handle co-admin specific content views
    if (currentUser.role === ROLES.CO_ADMIN) {
      switch (content) {
        case 'manage-orders':
          return <ManageOrders />;
        case 'inventory':
          return <InventoryManagement />;
        case 'printer-controls':
          return <PrinterControls />;
        default:
          return <CoAdminDashboard />;
      }
    }

    // Handle admin specific content views
    if (currentUser.role === ROLES.ADMIN) {
      switch (content) {
        case 'staff':
          return <StaffManagement />;
        case 'revenue':
          return <RevenueReport />;
        default:
          return <AdminDashboard />;
      }
    }

    // Fallback for unknown roles
    return <div>Unknown user role</div>;
  };

  return (
    <Layout>
      {/* Show printer status notification for students when server is offline/busy */}
      {currentUser.role === ROLES.STUDENT && printerStatus !== 'online' && (
        <div className={`w-full p-3 mb-4 text-center ${printerStatus === 'offline' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
          <strong>Notice:</strong> Print server is currently {printerStatus}. {printerStatus === 'offline' ? 'New orders cannot be processed at this time.' : 'Orders may be delayed.'}
        </div>
      )}

      {/* Show notification for co-admins about new orders */}
      {currentUser.role === ROLES.CO_ADMIN && content !== 'manage-orders' && getUnreadNotifications() > 0 && (
        <div className="w-full p-3 mb-4 text-center bg-blue-100 text-blue-700">
          <strong>New Order Alert:</strong> You have {getUnreadNotifications()} new order{getUnreadNotifications() > 1 ? 's' : ''} waiting for approval. 
          <Link to="/dashboard/manage-orders" className="ml-2 underline">View Orders</Link>
        </div>
      )}
      
      {renderContent()}
    </Layout>
  );
};

export default Dashboard;
