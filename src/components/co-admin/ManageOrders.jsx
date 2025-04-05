
import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Printer,
  Package,
  Clock,
  Filter,
  Upload,
  Truck,
  Check,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from "../ui/progress";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

const ManageOrders = () => {
  const { orders, updateOrderStatus, printerStatus, ORDER_STATUS } = useOrders();
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [currentPrintOrder, setCurrentPrintOrder] = useState(null);
  const [otpVerification, setOtpVerification] = useState({ orderId: null, otp: '' });
  const [printProgress, setPrintProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders to show only active ones (not rejected)
  const activeOrders = orders.filter(
    order => order.status !== ORDER_STATUS.REJECTED
  );

  // Apply status filter
  const filteredOrders = activeOrders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (order.paymentDetails.name && order.paymentDetails.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleStatusChange = (orderId, newStatus) => {
    if (newStatus === ORDER_STATUS.PRINTING) {
      // Show print dialog when starting to print
      const order = orders.find(o => o.id === orderId);
      setCurrentPrintOrder(order);
      setShowPrintDialog(true);
    } else {
      updateOrderStatus(orderId, newStatus);
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
    }
  };

  const handlePrintConfirm = () => {
    if (currentPrintOrder) {
      // Simulate printing progress
      setPrintProgress(0);
      const interval = setInterval(() => {
        setPrintProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              updateOrderStatus(currentPrintOrder.id, ORDER_STATUS.PRINTING);
              setShowPrintDialog(false);
              setCurrentPrintOrder(null);
              toast.success(`Printing completed for order ${currentPrintOrder.id}`);
            }, 500);
          }
          return newProgress;
        });
      }, 500);
    }
  };

  const handleOTPChange = (value) => {
    setOtpVerification(prev => ({...prev, otp: value}));
  };

  const handleOTPVerification = (e) => {
    e.preventDefault();
    const order = orders.find(o => o.id === otpVerification.orderId);
    
    if (!order) {
      toast.error('Order not found');
      return;
    }
    
    if (order.otp === otpVerification.otp) {
      updateOrderStatus(otpVerification.orderId, ORDER_STATUS.DELIVERED);
      setOtpVerification({ orderId: null, otp: '' });
      toast.success('OTP verified successfully. Order marked as delivered.');
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case ORDER_STATUS.PENDING:
        return ORDER_STATUS.APPROVED;
      case ORDER_STATUS.APPROVED:
        return ORDER_STATUS.PRINTING;
      case ORDER_STATUS.PRINTING:
        return ORDER_STATUS.READY;
      case ORDER_STATUS.READY:
        return ORDER_STATUS.COMPLETED;
      case ORDER_STATUS.COMPLETED:
        return ORDER_STATUS.DELIVERED;
      default:
        return null;
    }
  };

  const formatPrintType = (type) => {
    return type === 'bw' ? 'Black & White' : 'Color';
  };

  const formatSided = (sided) => {
    return sided === 'single' ? 'Single Sided' : 'Double Sided';
  };

  const getStatusColor = (status) => {
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
      case ORDER_STATUS.DELIVERED:
        return 'bg-green-100 text-green-700';
      case ORDER_STATUS.REJECTED:
        return 'bg-red-100 text-red-700';
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold">Manage Orders</h1>
          <p className="text-gray-600">View and process customer print orders</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative mr-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border rounded-md w-48 focus:outline-none focus:ring-2 focus:ring-printhub-300"
            />
          </div>
          
          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-printhub-300"
            >
              <option value="all">All Orders</option>
              <option value={ORDER_STATUS.PENDING}>Pending</option>
              <option value={ORDER_STATUS.APPROVED}>Approved</option>
              <option value={ORDER_STATUS.PRINTING}>Printing</option>
              <option value={ORDER_STATUS.READY}>Ready</option>
              <option value={ORDER_STATUS.COMPLETED}>Completed</option>
              <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {/* OTP Verification for order delivery */}
      {otpVerification.orderId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Verify OTP to Complete Order</h2>
          <form onSubmit={handleOTPVerification}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP for Order #{otpVerification.orderId}</label>
                <InputOTP maxLength={4} value={otpVerification.otp} onChange={handleOTPChange}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary">Verify OTP & Mark as Delivered</button>
                <button 
                  type="button" 
                  className="ml-2 btn-secondary" 
                  onClick={() => setOtpVerification({ orderId: null, otp: '' })}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-gray-700">No Orders Found</h3>
          <p className="text-gray-500">There are no orders with the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div 
              key={order.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} - {order.files.length} file(s)
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`status-badge mr-3 ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <button 
                      onClick={() => toggleOrderExpansion(order.id)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      {expandedOrderId === order.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                {expandedOrderId === order.id && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Files</h4>
                        <ul className="space-y-2">
                          {order.files.map((file, index) => (
                            <li key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                              <FileText className="h-4 w-4 text-printhub-600 mr-2" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500 ml-auto">{file.size} ({file.pages} pages)</span>
                            </li>
                          ))}
                        </ul>
                        
                        <h4 className="text-sm font-medium text-gray-700 mt-4 mb-2">Additional Notes</h4>
                        <div className="p-2 bg-gray-50 rounded-md text-sm">
                          {order.options.notes || 'No additional notes provided.'}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Print Options</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-600">Copies:</div>
                          <div>{order.options.copies}</div>
                          
                          <div className="text-gray-600">Page Range:</div>
                          <div>{order.options.pageRange}</div>
                          
                          <div className="text-gray-600">Print Type:</div>
                          <div>{formatPrintType(order.options.printType)}</div>
                          
                          <div className="text-gray-600">Sided:</div>
                          <div>{formatSided(order.options.sided)}</div>
                          
                          <div className="text-gray-600">Paper Size:</div>
                          <div>{order.options.paperSize}</div>
                          
                          <div className="text-gray-600">Cost:</div>
                          <div className="font-medium">₹{order.cost.toFixed(2)}</div>
                        </div>

                        {order.paymentMethod && (
                          <>
                            <h4 className="text-sm font-medium text-gray-700 mt-4 mb-2">Payment Details</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-gray-600">Method:</div>
                              <div className="capitalize">{order.paymentMethod === 'qr' ? 'QR Code Payment' : order.paymentMethod}</div>
                              
                              {order.paymentDetails?.name && (
                                <>
                                  <div className="text-gray-600">Name:</div>
                                  <div>{order.paymentDetails.name}</div>
                                </>
                              )}
                              
                              {order.paymentDetails?.phone && (
                                <>
                                  <div className="text-gray-600">Phone:</div>
                                  <div>{order.paymentDetails.phone}</div>
                                </>
                              )}
                              
                              {order.paymentDetails?.reference && (
                                <>
                                  <div className="text-gray-600">Reference:</div>
                                  <div>{order.paymentDetails.reference}</div>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 border-t border-gray-200 pt-4 flex items-center justify-between">
                      <div>
                        {order.status === ORDER_STATUS.PENDING && (
                          <button 
                            onClick={() => handleStatusChange(order.id, ORDER_STATUS.REJECTED)}
                            className="inline-flex items-center text-sm text-red-600 hover:text-red-800"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject Order
                          </button>
                        )}
                        
                        {order.status === ORDER_STATUS.READY && (
                          <button
                            onClick={() => setOtpVerification({ orderId: order.id, otp: '' })}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Verify OTP & Deliver
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {getNextStatus(order.status) && (
                          <button 
                            onClick={() => handleStatusChange(order.id, getNextStatus(order.status))}
                            className="btn-primary inline-flex items-center"
                            disabled={printerStatus === 'offline' && order.status !== ORDER_STATUS.READY}
                          >
                            {order.status === ORDER_STATUS.PENDING ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve
                              </>
                            ) : order.status === ORDER_STATUS.APPROVED ? (
                              <>
                                <Printer className="h-4 w-4 mr-2" />
                                Start Printing
                              </>
                            ) : order.status === ORDER_STATUS.PRINTING ? (
                              <>
                                <Package className="h-4 w-4 mr-2" />
                                Mark as Ready
                              </>
                            ) : order.status === ORDER_STATUS.READY ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Mark as Completed
                              </>
                            ) : order.status === ORDER_STATUS.COMPLETED ? (
                              <>
                                <Truck className="h-4 w-4 mr-2" />
                                Mark as Delivered
                              </>
                            ) : null}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Print Dialog */}
      {showPrintDialog && currentPrintOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Print Document</h3>
              <button 
                onClick={() => setShowPrintDialog(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="border rounded-md overflow-hidden mb-6">
              {/* Print Preview Header */}
              <div className="bg-gray-100 p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Print Preview - Order #{currentPrintOrder.id}</h4>
                    <p className="text-sm text-gray-600">
                      {currentPrintOrder.files.reduce((total, file) => total + file.pages, 0) * currentPrintOrder.options.copies} total pages
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-3">
                      Printer Status: <span className="inline-flex items-center font-medium">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>Ready
                      </span>
                    </span>
                    <Printer className="h-6 w-6 text-gray-500" />
                  </div>
                </div>
              </div>
              
              {/* Document Preview */}
              <div className="p-4 bg-white border-b">
                <div className="aspect-ratio-box" style={{ position: 'relative', paddingTop: '141.4%', overflow: 'hidden', background: '#f9f9f9', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {currentPrintOrder.files.map((file, index) => (
                      <div key={index} className="text-center" style={{ maxWidth: '90%', maxHeight: '90%' }}>
                        <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                        <p className="text-xs text-gray-500">Page 1 of {file.pages}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Print Settings */}
              <div className="p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Print Settings</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-500 text-xs mb-1">Print Type</span>
                    <span>{formatPrintType(currentPrintOrder.options.printType)}</span>
                  </div>
                  
                  <div>
                    <span className="block text-gray-500 text-xs mb-1">Copies</span>
                    <span>{currentPrintOrder.options.copies}</span>
                  </div>
                  
                  <div>
                    <span className="block text-gray-500 text-xs mb-1">Sided</span>
                    <span>{formatSided(currentPrintOrder.options.sided)}</span>
                  </div>
                  
                  <div>
                    <span className="block text-gray-500 text-xs mb-1">Paper Size</span>
                    <span>{currentPrintOrder.options.paperSize}</span>
                  </div>
                  
                  <div>
                    <span className="block text-gray-500 text-xs mb-1">Page Range</span>
                    <span>{currentPrintOrder.options.pageRange}</span>
                  </div>
                  
                  <div>
                    <span className="block text-gray-500 text-xs mb-1">Total Cost</span>
                    <span className="font-medium">₹{currentPrintOrder.cost.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {printProgress > 0 && printProgress < 100 ? (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Printing in progress...</span>
                  <span className="text-sm">{printProgress}%</span>
                </div>
                <Progress value={printProgress} className="h-2" />
              </div>
            ) : (
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowPrintDialog(false)}
                  className="btn-secondary flex items-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                
                <button 
                  onClick={handlePrintConfirm}
                  className="btn-primary flex items-center"
                  disabled={printProgress > 0}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Document
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
