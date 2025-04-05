
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { 
  FileText, 
  Calendar, 
  Download, 
  Receipt, 
  Search,
  ChevronDown,
  ChevronUp,
  Printer,
  Filter,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const { getUserOrders, generateReceipt, ORDER_STATUS } = useOrders();
  
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [receiptModal, setReceiptModal] = useState(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(null);
  
  // Get all orders for the current user
  const userOrders = currentUser ? getUserOrders(currentUser.id) : [];
  
  // Apply filters
  const filteredOrders = userOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.files.some(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };
  
  const handleViewReceipt = (orderId) => {
    const receipt = generateReceipt(orderId);
    setReceiptModal(receipt);
  };
  
  const handleDownloadDocument = (file) => {
    // In a real app, this would download the actual file
    toast.success(`Downloading ${file.name}`);
  };
  
  const handleViewDocument = (file) => {
    setShowDocumentPreview(file);
  };
  
  const formatPrintType = (type) => {
    return type === 'bw' ? 'Black & White' : 'Color';
  };
  
  const formatSided = (sided) => {
    return sided === 'single' ? 'Single Sided' : 'Double Sided';
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Order History</h1>
        <p className="text-gray-600">View and manage your past print orders</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Search and filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID or filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-printhub-300"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-printhub-300"
                >
                  <option value="all">All Status</option>
                  {Object.values(ORDER_STATUS).map(status => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Orders list */}
        <div className="divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">No Orders Found</h3>
              <p className="text-gray-500">You don't have any orders matching your search criteria</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="border-b border-gray-200 last:border-b-0">
                <div className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-start">
                      <div className={`h-2 w-2 rounded-full mt-2 mr-3 ${
                        order.status === ORDER_STATUS.PENDING ? 'bg-status-pending' :
                        order.status === ORDER_STATUS.APPROVED ? 'bg-status-approved' :
                        order.status === ORDER_STATUS.PRINTING ? 'bg-status-printing' :
                        order.status === ORDER_STATUS.READY ? 'bg-status-ready' :
                        order.status === ORDER_STATUS.COMPLETED ? 'bg-status-completed' : 
                        order.status === ORDER_STATUS.REJECTED ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <div className="font-medium">Order #{order.id}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {order.files.length} {order.files.length === 1 ? 'file' : 'files'} · 
                          {order.options.printType === 'bw' ? ' Black & White' : ' Color'} · 
                          ₹{order.cost.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-4 px-2 py-1 text-xs rounded-full status-badge status-${order.status}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <button 
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        {expandedOrderId === order.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {expandedOrderId === order.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium mb-2">Order Details</h3>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-gray-600">Status:</div>
                              <div className="capitalize">{order.status}</div>
                              
                              <div className="text-gray-600">Print Type:</div>
                              <div>{formatPrintType(order.options.printType)}</div>
                              
                              <div className="text-gray-600">Sided:</div>
                              <div>{formatSided(order.options.sided)}</div>
                              
                              <div className="text-gray-600">Paper Size:</div>
                              <div>{order.options.paperSize}</div>
                              
                              <div className="text-gray-600">Copies:</div>
                              <div>{order.options.copies}</div>
                              
                              <div className="text-gray-600">Amount:</div>
                              <div className="font-medium">₹{order.cost.toFixed(2)}</div>
                              
                              <div className="text-gray-600">Payment:</div>
                              <div className="capitalize">{order.paymentMethod || 'Direct Payment'}</div>
                            </div>
                          </div>
                          
                          {order.options.notes && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium mb-1">Additional Notes</h4>
                              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                                {order.options.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium">Files</h3>
                            {order.status === ORDER_STATUS.COMPLETED && (
                              <button 
                                onClick={() => handleViewReceipt(order.id)}
                                className="flex items-center text-xs text-printhub-600 hover:underline"
                              >
                                <Receipt className="h-3 w-3 mr-1" />
                                View Receipt
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            {order.files.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md text-sm">
                                <div className="flex items-center truncate mr-2">
                                  <FileText className="h-4 w-4 text-printhub-500 mr-2 flex-shrink-0" />
                                  <span className="truncate">{file.name}</span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  {order.status === ORDER_STATUS.COMPLETED && (
                                    <>
                                      <button 
                                        onClick={() => handleViewDocument(file)}
                                        className="p-1 text-gray-500 hover:text-printhub-600 hover:bg-gray-200 rounded"
                                        title="View Document"
                                      >
                                        <Printer className="h-4 w-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleDownloadDocument(file)}
                                        className="p-1 text-gray-500 hover:text-printhub-600 hover:bg-gray-200 rounded"
                                        title="Download"
                                      >
                                        <Download className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <Printer className="h-12 w-12 mx-auto text-printhub-600 mb-2" />
              <h2 className="text-xl font-bold">Print Receipt</h2>
              <p className="text-sm text-gray-500">Order #{receiptModal.orderId}</p>
            </div>
            
            <div className="border-t border-b border-gray-200 py-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Date:</span>
                <span>{receiptModal.date}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Payment Method:</span>
                <span className="capitalize">{receiptModal.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>₹{receiptModal.amount.toFixed(2)}</span>
              </div>
            </div>
            
            <h3 className="font-medium mb-2">Items</h3>
            <div className="space-y-2 mb-6">
              {receiptModal.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <div className="font-medium truncate max-w-[180px]">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.pages} pages, {item.copies} {item.copies === 1 ? 'copy' : 'copies'}, 
                      {item.printType}, {item.paperSize}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setReceiptModal(null)}
                className="mr-2 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  toast.success('Receipt downloaded');
                  setReceiptModal(null);
                }}
                className="px-4 py-2 bg-printhub-600 text-white rounded hover:bg-printhub-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Document Preview Modal */}
      {showDocumentPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Document Preview</h2>
              <button 
                onClick={() => setShowDocumentPreview(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50 mb-4">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-printhub-600 mr-2" />
                <span className="font-medium">{showDocumentPreview.name}</span>
              </div>
              <div className="text-sm text-gray-600">
                {showDocumentPreview.size}, {showDocumentPreview.pages} pages
              </div>
            </div>
            
            {/* Document content preview (placeholder) */}
            <div className="h-64 bg-gray-100 border flex items-center justify-center mb-4">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>Document preview would display here</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShowDocumentPreview(null)}
                className="mr-2 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  handleDownloadDocument(showDocumentPreview);
                  setShowDocumentPreview(null);
                }}
                className="px-4 py-2 bg-printhub-600 text-white rounded hover:bg-printhub-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
