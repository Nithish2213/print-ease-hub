
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { FileText, Package, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import OrderTracker from './OrderTracker';

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { getUserOrders, ORDER_STATUS } = useOrders();

  const userOrders = getUserOrders(currentUser?.id || 0);
  const activeOrders = userOrders.filter(
    order => order.status !== ORDER_STATUS.COMPLETED && order.status !== ORDER_STATUS.REJECTED
  );
  const completedOrders = userOrders.filter(
    order => order.status === ORDER_STATUS.COMPLETED || order.status === ORDER_STATUS.REJECTED
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return <Clock className="h-5 w-5 text-status-pending" />;
      case ORDER_STATUS.APPROVED:
        return <Clock className="h-5 w-5 text-status-approved" />;
      case ORDER_STATUS.PRINTING:
        return <Clock className="h-5 w-5 text-status-printing" />;
      case ORDER_STATUS.READY:
        return <Clock className="h-5 w-5 text-status-ready" />;
      case ORDER_STATUS.COMPLETED:
        return <CheckCircle2 className="h-5 w-5 text-status-completed" />;
      case ORDER_STATUS.REJECTED:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return 'status-pending';
      case ORDER_STATUS.APPROVED:
        return 'status-approved';
      case ORDER_STATUS.PRINTING:
        return 'status-printing';
      case ORDER_STATUS.READY:
        return 'status-ready';
      case ORDER_STATUS.COMPLETED:
        return 'status-completed';
      case ORDER_STATUS.REJECTED:
        return 'bg-red-100 text-red-700';
      default:
        return '';
    }
  };

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome, {currentUser?.name}!</h1>
        <p className="text-gray-600">Manage your print orders and upload new documents.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
          <button className="btn-primary w-full">Create New Order</button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-printhub-100 p-3">
              <Package className="h-6 w-6 text-printhub-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold">My Orders</h2>
              <p className="text-sm text-gray-500">
                <span className="font-medium">{activeOrders.length}</span> active, 
                <span className="font-medium ml-1">{completedOrders.length}</span> completed
              </p>
            </div>
          </div>
          <button className="btn-secondary w-full">View All Orders</button>
        </div>
      </div>

      {activeOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
          <div className="space-y-4">
            {activeOrders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Order #{order.id}</h3>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className="text-gray-500">Date:</div>
                    <div>{getFormattedDate(order.createdAt)}</div>
                    
                    <div className="text-gray-500">Files:</div>
                    <div>{order.files.map(file => file.name).join(', ')}</div>
                    
                    <div className="text-gray-500">Copies:</div>
                    <div>{order.options.copies}</div>
                    
                    <div className="text-gray-500">Print type:</div>
                    <div className="capitalize">{order.options.printType === 'bw' ? 'Black & White' : 'Color'}</div>
                  </div>

                  <OrderTracker status={order.status} />

                  <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">Total:</span>
                      <span className="ml-2 font-bold text-printhub-700">₹{order.cost.toFixed(2)}</span>
                    </div>
                    <button className="btn-ghost">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {completedOrders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getFormattedDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`ml-2 text-sm ${
                          order.status === ORDER_STATUS.REJECTED 
                            ? 'text-red-700' 
                            : order.status === ORDER_STATUS.COMPLETED 
                              ? 'text-status-completed' 
                              : 'text-gray-500'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-printhub-700">
                      ₹{order.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button className="text-printhub-600 hover:text-printhub-800">
                        View
                      </button>
                      {order.status === ORDER_STATUS.COMPLETED && (
                        <button className="ml-3 text-printhub-600 hover:text-printhub-800">
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {completedOrders.length > 5 && (
              <div className="px-6 py-3 border-t border-gray-200">
                <button className="text-sm text-printhub-600 hover:text-printhub-800 font-medium">
                  View all orders
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
