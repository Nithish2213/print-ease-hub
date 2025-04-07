import React, { useState, useRef } from 'react';
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
  Search,
  Copy,
  LayoutPanelLeft
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
  const printFrameRef = useRef(null);
  const [printSettings, setPrintSettings] = useState({
    printer: "Default Printer",
    copies: 1,
    layout: "portrait",
    pages: "all",
    doubleSided: false
  });

  // Filter orders to show only active ones (not rejected)
  const activeOrders = orders.filter(
    order => order.status !== ORDER_STATUS.REJECTED
  );

  // Apply status filter
  const filteredOrders = activeOrders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (order.paymentDetails?.name && order.paymentDetails.name.toLowerCase().includes(searchQuery.toLowerCase()));
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

  // Function to actually send to system printer
  const printDocument = () => {
    try {
      // Create print content in a hidden iframe
      const printContent = `
        <html>
          <head>
            <title>Print Order #${currentPrintOrder.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .print-info { margin-bottom: 20px; }
              .file-list { margin-bottom: 20px; }
              .file-item { margin-bottom: 10px; padding: 8px; border: 1px solid #eee; }
              .options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Print Order #${currentPrintOrder.id}</h1>
              <p>Submitted on: ${new Date(currentPrintOrder.createdAt).toLocaleString()}</p>
            </div>
            
            <div class="print-info">
              ${currentPrintOrder.paymentDetails?.name ? `<p><strong>Customer:</strong> ${currentPrintOrder.paymentDetails.name}</p>` : ''}
              <p><strong>Total Pages:</strong> ${currentPrintOrder.files.reduce((total, file) => total + file.pages, 0) * currentPrintOrder.options.copies}</p>
              <p><strong>Total Cost:</strong> ₹${currentPrintOrder.cost.toFixed(2)}</p>
            </div>
            
            <h2>Files to Print:</h2>
            <div class="file-list">
              ${currentPrintOrder.files.map((file, index) => `
                <div class="file-item">
                  <p><strong>File ${index + 1}:</strong> ${file.name}</p>
                  <p>Pages: ${file.pages} | Size: ${file.size}</p>
                </div>
              `).join('')}
            </div>
            
            <h2>Print Options:</h2>
            <div class="options">
              <p><strong>Copies:</strong> ${printSettings.copies}</p>
              <p><strong>Print Type:</strong> ${currentPrintOrder.options.printType === 'bw' ? 'Black & White' : 'Color'}</p>
              <p><strong>Sided:</strong> ${printSettings.doubleSided ? 'Double Sided' : 'Single Sided'}</p>
              <p><strong>Paper Size:</strong> ${currentPrintOrder.options.paperSize}</p>
              <p><strong>Layout:</strong> ${printSettings.layout === 'portrait' ? 'Portrait' : 'Landscape'}</p>
              <p><strong>Page Range:</strong> ${printSettings.pages === 'all' ? 'All Pages' : printSettings.pages}</p>
            </div>
            
            ${currentPrintOrder.options.notes ? `
              <h2>Additional Notes:</h2>
              <p>${currentPrintOrder.options.notes}</p>
            ` : ''}
            
            <div class="footer">
              <p>This is an automatically generated print document. Order ID: ${currentPrintOrder.id}</p>
            </div>
          </body>
        </html>
      `;
      
      // Create or use existing iframe for printing
      if (!printFrameRef.current) {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        printFrameRef.current = iframe;
      }
      
      // Write print content to iframe
      const frameDoc = printFrameRef.current.contentDocument || printFrameRef.current.contentWindow.document;
      frameDoc.open();
      frameDoc.write(printContent);
      frameDoc.close();
      
      // Simulate print progress
      setPrintProgress(10);
      
      const printProgressInterval = setInterval(() => {
        setPrintProgress(prev => {
          const newProgress = prev + 15;
          if (newProgress >= 100) {
            clearInterval(printProgressInterval);
            // Trigger the actual print once progress reaches 100%
            setTimeout(() => {
              printFrameRef.current.contentWindow.print();
              updateOrderStatus(currentPrintOrder.id, ORDER_STATUS.PRINTING);
              setShowPrintDialog(false);
              setCurrentPrintOrder(null);
              toast.success(`Print job sent for order ${currentPrintOrder.id}`);
            }, 500);
          }
          return newProgress;
        });
      }, 500);
      
    } catch (error) {
      console.error("Printing failed:", error);
      toast.error("Could not send to printer. Please check printer connection.");
      setPrintProgress(0);
    }
  };

  const handlePrintConfirm = () => {
    if (currentPrintOrder) {
      printDocument();
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

      {/* Enhanced System Print Dialog - Matching the image provided */}
      {showPrintDialog && currentPrintOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center pt-10 z-50">
          <div className="bg-gray-100 rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Print Dialog Header */}
            <div className="bg-gray-800 text-white p-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-medium">Print</h3>
                  <p className="text-sm text-gray-300">
                    Total: {currentPrintOrder.files.reduce((total, file) => total + file.pages, 0)} sheets of paper
                  </p>
                </div>
                <button 
                  onClick={() => setShowPrintDialog(false)} 
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Print Dialog Body */}
            <div className="p-4">
              {/* Printer Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Printer</label>
                <div className="relative">
                  <select 
                    className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={printSettings.printer}
                    onChange={(e) => setPrintSettings({...printSettings, printer: e.target.value})}
                  >
                    <option>Default Printer</option>
                    <option>HP Laser MFP 131 133 135-138</option>
                    <option>Brother HL-L2320D</option>
                    <option>Epson L3150</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>
              
              {/* Copies */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Copies</label>
                <input 
                  type="number" 
                  min="1" 
                  max="99" 
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={printSettings.copies}
                  onChange={(e) => setPrintSettings({...printSettings, copies: parseInt(e.target.value) || 1})}
                />
              </div>
              
              {/* Layout */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
                <div className="flex space-x-1">
                  <label className="flex items-center border border-gray-300 rounded-md p-2 flex-1 cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="layout" 
                      value="portrait"
                      className="mr-2"
                      checked={printSettings.layout === 'portrait'} 
                      onChange={() => setPrintSettings({...printSettings, layout: 'portrait'})}
                    />
                    <span className="text-sm">Portrait</span>
                  </label>
                  <label className="flex items-center border border-gray-300 rounded-md p-2 flex-1 cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="layout" 
                      value="landscape"
                      className="mr-2"
                      checked={printSettings.layout === 'landscape'} 
                      onChange={() => setPrintSettings({...printSettings, layout: 'landscape'})}
                    />
                    <span className="text-sm">Landscape</span>
                  </label>
                </div>
              </div>
              
              {/* Pages */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="pages" 
                      value="all"
                      className="mr-2"
                      checked={printSettings.pages === 'all'} 
                      onChange={() => setPrintSettings({...printSettings, pages: 'all'})}
                    />
                    <span className="text-sm">All</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="pages" 
                      value="odd"
                      className="mr-2"
                      checked={printSettings.pages === 'odd'} 
                      onChange={() => setPrintSettings({...printSettings, pages: 'odd'})}
                    />
                    <span className="text-sm">Odd pages only</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="pages" 
                      value="even"
                      className="mr-2"
                      checked={printSettings.pages === 'even'} 
                      onChange={() => setPrintSettings({...printSettings, pages: 'even'})}
                    />
                    <span className="text-sm">Even pages only</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="radio" 
                      name="pages" 
                      value="custom"
                      className="mr-2"
                      checked={printSettings.pages !== 'all' && printSettings.pages !== 'odd' && printSettings.pages !== 'even'} 
                      onChange={() => setPrintSettings({...printSettings, pages: ''})}
                    />
                    <input 
                      type="text" 
                      placeholder="e.g. 1-5, 8, 11-13"
                      className="border border-gray-300 rounded-md py-1 px-2 text-sm"
                      disabled={printSettings.pages === 'all' || printSettings.pages === 'odd' || printSettings.pages === 'even'}
                      value={printSettings.pages !== 'all' && printSettings.pages !== 'odd' && printSettings.pages !== 'even' ? printSettings.pages : ''}
                      onChange={(e) => setPrintSettings({...printSettings, pages: e.target.value})}
                    />
                  </label>
                </div>
              </div>
              
              {/* Double Sided */}
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={printSettings.doubleSided} 
                    onChange={() => setPrintSettings({...printSettings, doubleSided: !printSettings.doubleSided})}
                  />
                  <span className="text-sm font-medium text-gray-700">Print on both sides</span>
                </label>
              </div>
              
              {/* Progress Bar */}
              {printProgress > 0 && printProgress < 100 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span>Printing...</span>
                    <span>{printProgress}%</span>
                  </div>
                  <Progress value={printProgress} className="h-1" />
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-between mt-6">
                <button 
                  onClick={() => setShowPrintDialog(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Cancel
                </button>
                
                <button 
                  onClick={handlePrintConfirm}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                  disabled={printProgress > 0 && printProgress < 100}
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
