
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { FileText, Package, Clock } from 'lucide-react';
import OrderTracker from './OrderTracker';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { getUserOrders, ORDER_STATUS } = useOrders();
  const navigate = useNavigate();

  const userOrders = getUserOrders(currentUser?.id || 0);
  const activeOrders = userOrders.filter(
    order => order.status !== ORDER_STATUS.COMPLETED && order.status !== ORDER_STATUS.REJECTED
  );
  const completedOrders = userOrders.filter(
    order => order.status === ORDER_STATUS.COMPLETED || order.status === ORDER_STATUS.REJECTED
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome, {currentUser?.name}!</h1>
        <p className="text-gray-600">Manage your print orders and upload new documents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-printhub-100 p-3">
              <FileText className="h-6 w-6 text-printhub-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">New Print Job</h2>
              <p className="text-sm text-gray-500">Upload and configure your print job</p>
            </div>
          </div>
          <button 
            className="btn-primary w-full"
            onClick={() => navigate('/dashboard/print')}
          >
            Create New Order
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-printhub-100 p-3">
              <Clock className="h-6 w-6 text-printhub-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Track Orders</h2>
              <p className="text-sm text-gray-500">
                <span className="font-medium">{activeOrders.length}</span> active order(s)
              </p>
            </div>
          </div>
          <button 
            className="btn-secondary w-full"
            onClick={() => navigate('/dashboard/tracking')}
          >
            Track Orders
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-printhub-100 p-3">
              <Package className="h-6 w-6 text-printhub-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">Order History</h2>
              <p className="text-sm text-gray-500">
                <span className="font-medium">{completedOrders.length}</span> completed order(s)
              </p>
            </div>
          </div>
          <button 
            className="btn-secondary w-full"
            onClick={() => navigate('/dashboard/orders')}
          >
            View History
          </button>
        </div>
      </div>

      {activeOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
          <div className="space-y-4">
            {activeOrders.slice(0, 1).map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Order #{order.id}</h3>
                    <span className={`status-badge ${order.status === ORDER_STATUS.PENDING ? 'status-pending' :
                                                     order.status === ORDER_STATUS.APPROVED ? 'status-approved' :
                                                     order.status === ORDER_STATUS.PRINTING ? 'status-printing' :
                                                     'status-ready'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <OrderTracker status={order.status} />

                  <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">Total:</span>
                      <span className="ml-2 font-bold text-printhub-700">₹{order.cost.toFixed(2)}</span>
                    </div>
                    <button 
                      className="btn-ghost"
                      onClick={() => navigate('/dashboard/tracking')}
                    >
                      View All Active Orders
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {activeOrders.length > 1 && (
              <div className="text-center">
                <button 
                  className="btn-ghost"
                  onClick={() => navigate('/dashboard/tracking')}
                >
                  View All {activeOrders.length} Active Orders
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
