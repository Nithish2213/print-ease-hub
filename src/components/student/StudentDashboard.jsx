
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { Printer, FileText } from 'lucide-react';

const StudentDashboard = ({ showOnlyNewOrder = false }) => {
  const { currentUser } = useAuth();
  const { printerStatus, getUserOrders } = useOrders();
  
  // Get the student's orders
  const userOrders = currentUser ? getUserOrders(currentUser.id) : [];
  const activeOrders = userOrders.filter(order => 
    order.status !== 'completed' && order.status !== 'rejected'
  );
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* New Print Job Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-printhub-100 p-3">
              <Printer className="h-6 w-6 text-printhub-600" />
            </div>
            <h2 className="ml-4 text-xl font-semibold">Create New Print Job</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Submit a new document for printing at our facility. We support various paper sizes, color options, and binding methods.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-medium mb-2">Supported File Types</h3>
              <ul className="text-sm text-gray-600 space-y-2 flex-grow">
                <li className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-printhub-500" />
                  <span>PDF documents</span>
                </li>
                <li className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-printhub-500" />
                  <span>Word documents (.docx, .doc)</span>
                </li>
                <li className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-printhub-500" />
                  <span>PowerPoint presentations (.pptx, .ppt)</span>
                </li>
                <li className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-printhub-500" />
                  <span>Images (.jpg, .png)</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Print Options</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>Black & White or Color printing</li>
                <li>Single or Double sided</li>
                <li>A4, A3, Letter paper sizes</li>
                <li>Multiple copies and collation</li>
                <li>Full or partial document printing</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Link 
              to="/dashboard/print" 
              className={`btn-primary flex items-center ${
                printerStatus !== 'online' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={(e) => {
                if (printerStatus !== 'online') {
                  e.preventDefault();
                }
              }}
            >
              <Printer className="h-5 w-5 mr-2" />
              Create New Order
            </Link>
          </div>
          
          {printerStatus !== 'online' && (
            <div className={`mt-4 text-center text-sm ${
              printerStatus === 'offline' ? 'text-red-600' : 'text-amber-600'
            }`}>
              Print server is currently {printerStatus}. 
              {printerStatus === 'offline' 
                ? ' New orders cannot be placed at this time.' 
                : ' Orders may be delayed.'
              }
            </div>
          )}
        </div>
        
        {/* Active Orders Info */}
        {!showOnlyNewOrder && activeOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Active Orders</h2>
              <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                {activeOrders.length} {activeOrders.length === 1 ? 'order' : 'orders'}
              </span>
            </div>
            
            <div className="space-y-2">
              {activeOrders.map(order => (
                <Link 
                  key={order.id} 
                  to="/dashboard/tracking"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div>
                    <div className="font-medium">Order #{order.id}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full status-badge status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </Link>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Link to="/dashboard/tracking" className="text-sm text-printhub-600 hover:underline">
                Track your orders →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
