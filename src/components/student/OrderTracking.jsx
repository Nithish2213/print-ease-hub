
import React from 'react';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { Clock, FileText } from 'lucide-react';
import OrderTracker from './OrderTracker';

const OrderTracking = () => {
  const { currentUser } = useAuth();
  const { getUserOrders, ORDER_STATUS } = useOrders();
  
  const userOrders = getUserOrders(currentUser?.id || 0);
  const activeOrders = userOrders.filter(
    order => order.status !== ORDER_STATUS.COMPLETED && order.status !== ORDER_STATUS.REJECTED
  );

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Track Your Orders</h1>
      </div>

      {activeOrders.length > 0 ? (
        <div className="space-y-4">
          {activeOrders.map(order => (
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
                
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="text-gray-500">Ordered:</div>
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
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-500 mb-4">
            <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <h3 className="text-lg font-medium">No active orders</h3>
          </div>
          <p className="text-gray-500">Your current orders will appear here for tracking</p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
