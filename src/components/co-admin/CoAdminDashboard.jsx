
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { 
  Printer, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  FileText,
  AlertCircle,
  Server,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

const CoAdminDashboard = () => {
  const { currentUser } = useAuth();
  const { 
    orders, 
    updateOrderStatus, 
    printerStatus, 
    togglePrinterStatus, 
    ORDER_STATUS 
  } = useOrders();
  
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [serverStarting, setServerStarting] = useState(false);

  // Filter orders to show only active ones
  const activeOrders = orders.filter(
    order => order.status !== ORDER_STATUS.COMPLETED && order.status !== ORDER_STATUS.REJECTED
  );

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleServerStart = () => {
    if (printerStatus === 'offline') {
      setServerStarting(true);
      // Simulate server starting process
      setTimeout(() => {
        togglePrinterStatus('online');
        setServerStarting(false);
        toast.success('Printer server started successfully!');
      }, 2000);
    } else {
      toast.info('Printer server is already running');
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Welcome, {currentUser?.name}!</h1>
        <p className="text-gray-600">Manage print orders and update their status.</p>
      </div>

      <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-semibold">Printer Status</h2>
            <div className="text-sm text-gray-500">Control the printer server status</div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full mr-2 ${
                printerStatus === 'online' ? 'bg-green-500 animate-pulse' : 
                printerStatus === 'busy' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`} />
              <span className="text-sm font-medium capitalize">{printerStatus}</span>
            </div>
            
            <div className="border-l border-gray-300 h-8 hidden sm:block"></div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => togglePrinterStatus('online')} 
                className={`px-3 py-1 text-sm rounded-md ${
                  printerStatus === 'online' 
                    ? 'bg-green-100 text-green-700 border border-green-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
                disabled={serverStarting}
              >
                Online
              </button>
              <button 
                onClick={() => togglePrinterStatus('busy')} 
                className={`px-3 py-1 text-sm rounded-md ${
                  printerStatus === 'busy' 
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
                disabled={serverStarting}
              >
                Busy
              </button>
              <button 
                onClick={() => togglePrinterStatus('offline')} 
                className={`px-3 py-1 text-sm rounded-md ${
                  printerStatus === 'offline' 
                    ? 'bg-red-100 text-red-700 border border-red-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
                disabled={serverStarting}
              >
                Offline
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              <div className="bg-amber-50 p-3 rounded-md border border-amber-100 flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-amber-800 font-medium">Important</p>
                  <p className="text-amber-700">
                    Make sure to change the printer status when you leave or when maintenance is required.
                  </p>
                </div>
              </div>
            </div>
            
            {printerStatus === 'offline' && (
              <button 
                onClick={handleServerStart}
                disabled={serverStarting}
                className="btn-primary flex items-center space-x-2"
              >
                {serverStarting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Starting Server...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Start Printer Server</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Active Orders</h2>
          <div className="text-sm text-gray-500">
            {activeOrders.length} {activeOrders.length === 1 ? 'order' : 'orders'} to process
          </div>
        </div>
        
        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <h3 className="text-lg font-medium text-gray-700">No Active Orders</h3>
            <p className="text-gray-500">All orders have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map(order => (
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
                      <span className={`status-badge mr-3 ${
                        order.status === ORDER_STATUS.PENDING ? 'status-pending' :
                        order.status === ORDER_STATUS.APPROVED ? 'status-approved' :
                        order.status === ORDER_STATUS.PRINTING ? 'status-printing' :
                        'status-ready'
                      }`}>
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
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {getNextStatus(order.status) && (
                            <button 
                              onClick={() => handleStatusChange(order.id, getNextStatus(order.status))}
                              className="btn-primary inline-flex items-center"
                              disabled={printerStatus === 'offline'}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {order.status === ORDER_STATUS.PENDING ? 'Approve' : 
                              order.status === ORDER_STATUS.APPROVED ? 'Start Printing' :
                              order.status === ORDER_STATUS.PRINTING ? 'Mark as Ready' :
                              'Complete Order'}
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
      </div>
    </div>
  );
};

export default CoAdminDashboard;
