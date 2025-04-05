
import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { 
  Calendar, 
  TrendingUp, 
  CreditCard, 
  Download,
  Filter,
  BarChart4,
  PieChart,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell
} from 'recharts';

const RevenueReport = () => {
  const { orders } = useOrders();
  
  const [dateRange, setDateRange] = useState('month');
  const [activeTab, setActiveTab] = useState('summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // Filter orders based on date range
  const getFilteredOrders = () => {
    const now = new Date();
    let filterDate = new Date();
    
    switch (dateRange) {
      case 'today':
        filterDate = new Date();
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        filterDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'year':
        filterDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end;
          });
        }
        return orders;
      default:
        filterDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
    
    return orders.filter(order => new Date(order.createdAt) >= filterDate);
  };
  
  const filteredOrders = getFilteredOrders();
  
  // Calculate stats
  const totalRevenue = filteredOrders.reduce((total, order) => total + order.cost, 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Group orders by date for chart
  const getChartData = () => {
    const ordersByDate = {};
    
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (!ordersByDate[date]) {
        ordersByDate[date] = {
          date,
          revenue: 0,
          orders: 0
        };
      }
      ordersByDate[date].revenue += order.cost;
      ordersByDate[date].orders += 1;
    });
    
    return Object.values(ordersByDate);
  };
  
  const chartData = getChartData();
  
  // Count payment methods for pie chart
  const getPaymentMethodData = () => {
    const methods = {};
    
    filteredOrders.forEach(order => {
      const method = order.paymentMethod || 'other';
      if (!methods[method]) {
        methods[method] = 0;
      }
      methods[method] += 1;
    });
    
    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  };
  
  const paymentMethodData = getPaymentMethodData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const exportData = () => {
    toast.success('Report exported successfully');
  };
  
  const toggleOrderExpansion = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Revenue Report</h1>
        <p className="text-gray-600">Track and analyze your print shop revenue</p>
      </div>
      
      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div className="flex items-center mb-4 sm:mb-0">
            <Filter className="h-5 w-5 text-printhub-600 mr-2" />
            <h2 className="text-lg font-semibold">Filter Report</h2>
          </div>
          
          <div className="w-full sm:w-auto">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-printhub-300"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>
        
        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <button 
            onClick={exportData}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex">
            <div className="rounded-full p-3 bg-green-100 text-green-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Total Revenue</div>
              <div className="text-2xl font-bold mt-1">₹{totalRevenue.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">
                {dateRange === 'custom' ? 'Custom period' : 
                 dateRange === 'today' ? 'Today' : 
                 dateRange === 'week' ? 'Last 7 days' : 
                 dateRange === 'year' ? 'Last 12 months' : 'Last 30 days'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex">
            <div className="rounded-full p-3 bg-blue-100 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Orders</div>
              <div className="text-2xl font-bold mt-1">{totalOrders}</div>
              <div className="text-xs text-gray-400 mt-1">
                {dateRange === 'custom' ? 'Custom period' : 
                 dateRange === 'today' ? 'Today' : 
                 dateRange === 'week' ? 'Last 7 days' : 
                 dateRange === 'year' ? 'Last 12 months' : 'Last 30 days'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex">
            <div className="rounded-full p-3 bg-purple-100 text-purple-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <div className="text-sm text-gray-500">Average Order Value</div>
              <div className="text-2xl font-bold mt-1">₹{averageOrderValue.toFixed(2)}</div>
              <div className="text-xs text-gray-400 mt-1">
                {dateRange === 'custom' ? 'Custom period' : 
                 dateRange === 'today' ? 'Today' : 
                 dateRange === 'week' ? 'Last 7 days' : 
                 dateRange === 'year' ? 'Last 12 months' : 'Last 30 days'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs for different report views */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'summary'
                  ? 'border-b-2 border-printhub-600 text-printhub-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'charts'
                  ? 'border-b-2 border-printhub-600 text-printhub-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Charts
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-printhub-600 text-printhub-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Transactions
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'summary' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Revenue Summary</h3>
              
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium text-gray-700">No Data Available</h3>
                  <p className="text-gray-500">Try selecting a different date range</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Revenue Overview</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Total Revenue</div>
                          <div className="text-xl font-semibold">₹{totalRevenue.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Orders</div>
                          <div className="text-xl font-semibold">{totalOrders}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Average Order Value</div>
                          <div className="text-xl font-semibold">₹{averageOrderValue.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Most Popular Payment</div>
                          <div className="text-xl font-semibold capitalize">
                            {paymentMethodData.length > 0 
                              ? paymentMethodData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name 
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Transactions</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredOrders.slice(0, 5).map((order) => (
                            <tr key={order.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{order.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full status-badge ${
                                  `status-${order.status}`
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                ₹{order.cost.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {filteredOrders.length > 5 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setActiveTab('transactions')}
                          className="text-sm text-printhub-600 hover:text-printhub-800"
                        >
                          View All Transactions
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'charts' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Revenue Charts</h3>
              
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart4 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium text-gray-700">No Data Available</h3>
                  <p className="text-gray-500">Try selecting a different date range</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Revenue by Date</h4>
                    <div className="h-72 bg-white">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                          <Bar dataKey="revenue" fill="#4f46e5" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Orders by Payment Method</h4>
                    <div className="h-72 bg-white">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={paymentMethodData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {paymentMethodData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} orders`, name]} />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'transactions' && (
            <div>
              <h3 className="text-lg font-medium mb-4">All Transactions</h3>
              
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <h3 className="text-lg font-medium text-gray-700">No Transactions Available</h3>
                  <p className="text-gray-500">Try selecting a different date range</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Files
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.files.length}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full status-badge ${
                                `status-${order.status}`
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              ₹{order.cost.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => toggleOrderExpansion(order.id)}
                                className="text-printhub-600 hover:text-printhub-800"
                              >
                                {expandedOrderId === order.id ? (
                                  <ChevronUp className="h-5 w-5" />
                                ) : (
                                  <ChevronDown className="h-5 w-5" />
                                )}
                              </button>
                            </td>
                          </tr>
                          
                          {/* Expanded order details */}
                          {expandedOrderId === order.id && (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Files</h4>
                                    <ul className="space-y-1">
                                      {order.files.map((file, index) => (
                                        <li key={index} className="text-sm flex items-center">
                                          <FileText className="h-3 w-3 mr-1 text-gray-500" />
                                          <span className="truncate">{file.name}</span>
                                          <span className="ml-1 text-xs text-gray-500">
                                            ({file.size}, {file.pages} {file.pages === 1 ? 'page' : 'pages'})
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Print Options</h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                      <div className="text-gray-500">Copies:</div>
                                      <div>{order.options.copies}</div>
                                      
                                      <div className="text-gray-500">Print Type:</div>
                                      <div className="capitalize">
                                        {order.options.printType === 'bw' ? 'Black & White' : 'Color'}
                                      </div>
                                      
                                      <div className="text-gray-500">Sided:</div>
                                      <div className="capitalize">
                                        {order.options.sided === 'single' ? 'Single-sided' : 'Double-sided'}
                                      </div>
                                      
                                      <div className="text-gray-500">Paper Size:</div>
                                      <div>{order.options.paperSize}</div>
                                      
                                      {order.paymentMethod && (
                                        <>
                                          <div className="text-gray-500">Payment Method:</div>
                                          <div className="capitalize">{order.paymentMethod}</div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueReport;
