
import React from 'react';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const { getUserOrders, ORDER_STATUS } = useOrders();
  
  const userOrders = getUserOrders(currentUser?.id || 0);
  const completedOrders = userOrders.filter(
    order => order.status === ORDER_STATUS.COMPLETED || order.status === ORDER_STATUS.REJECTED
  );

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.COMPLETED:
        return <CheckCircle2 className="h-5 w-5 text-status-completed" />;
      case ORDER_STATUS.REJECTED:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const handleDownloadReceipt = (orderId) => {
    // In a real application, this would generate and download a PDF receipt
    toast.success(`Receipt for order #${orderId} downloaded successfully!`);
  };

  const handleDownloadDocument = (orderId, fileName) => {
    // In a real application, this would download the document file
    toast.success(`File ${fileName} downloaded successfully!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Order History</h1>
      </div>

      {completedOrders.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Files
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
            <tbody className="bg-white divide-y divide-gray-200">
              {completedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getFormattedDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {order.files.map(file => file.name).join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className={`ml-2 text-sm ${
                        order.status === ORDER_STATUS.REJECTED 
                          ? 'text-red-700' 
                          : 'text-status-completed'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-printhub-700">
                    ₹{order.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button 
                      onClick={() => handleDownloadReceipt(order.id)}
                      className="text-printhub-600 hover:text-printhub-800 mx-1"
                      title="Download Receipt"
                    >
                      <Download className="h-5 w-5 inline" />
                      <span className="ml-1">Receipt</span>
                    </button>
                    {order.files.map(file => (
                      <button 
                        key={file.name}
                        onClick={() => handleDownloadDocument(order.id, file.name)}
                        className="text-printhub-600 hover:text-printhub-800 ml-3"
                        title={`Download ${file.name}`}
                      >
                        <FileText className="h-5 w-5 inline" />
                        <span className="ml-1">Document</span>
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-500 mb-4">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <h3 className="text-lg font-medium">No order history yet</h3>
          </div>
          <p className="text-gray-500">Your completed orders will appear here</p>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
