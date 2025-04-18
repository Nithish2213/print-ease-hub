
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { 
  TrendingUp, 
  Package, 
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Users
} from 'lucide-react';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { orders, inventory, ORDER_STATUS } = useOrders();
  
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  
  useEffect(() => {
    // Update stats to ensure real-time data
    setStats({
      totalOrders: orders.length,
      pendingOrders: orders.filter(order => order.status === ORDER_STATUS.PENDING).length,
      completedOrders: orders.filter(order => order.status === ORDER_STATUS.COMPLETED).length,
      totalRevenue: orders.reduce((total, order) => total + order.cost, 0)
    });
  }, [orders, ORDER_STATUS]);
  
  // Calculate low stock items
  const lowStockItems = [];
  if (inventory.ink.black < 20) lowStockItems.push('Black Ink');
  if (inventory.ink.cyan < 20) lowStockItems.push('Cyan Ink');
  if (inventory.ink.magenta < 20) lowStockItems.push('Magenta Ink');
  if (inventory.ink.yellow < 20) lowStockItems.push('Yellow Ink');
  if (inventory.paper['A4'] < 100) lowStockItems.push('A4 Paper');
  if (inventory.paper['A3'] < 50) lowStockItems.push('A3 Paper');
  
  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex">
        <div className={`rounded-full p-3 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
          {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );

  const getOrdersByDate = () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    const todayOrders = orders.filter(order => 
      new Date(order.createdAt).toDateString() === today.toDateString()
    );
    
    const yesterdayOrders = orders.filter(order => 
      new Date(order.createdAt).toDateString() === yesterday.toDateString()
    );
    
    return { todayOrders, yesterdayOrders };
  };
  
  const { todayOrders, yesterdayOrders } = getOrdersByDate();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Welcome, {currentUser?.name}!</h1>
        <p className="text-gray-600">Here's an overview of your print shop.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/dashboard/revenue">
          <StatCard 
            icon={TrendingUp} 
            title="Total Revenue" 
            value={`₹${stats.totalRevenue.toFixed(2)}`} 
            subtitle="Click for details"
            color="bg-green-100 text-green-600"
          />
        </Link>
        <StatCard 
          icon={Package} 
          title="Total Orders" 
          value={stats.totalOrders} 
          color="bg-blue-100 text-blue-600"
        />
        <StatCard 
          icon={Clock} 
          title="Pending Orders" 
          value={stats.pendingOrders} 
          color="bg-amber-100 text-amber-600"
        />
        <StatCard 
          icon={CheckCircle2} 
          title="Completed Orders" 
          value={stats.completedOrders} 
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">TODAY</h3>
              {todayOrders.length > 0 ? (
                <div className="space-y-2">
                  {todayOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                      <div className={`h-2 w-2 rounded-full mr-2 ${
                        order.status === ORDER_STATUS.PENDING ? 'bg-status-pending' :
                        order.status === ORDER_STATUS.APPROVED ? 'bg-status-approved' :
                        order.status === ORDER_STATUS.PRINTING ? 'bg-status-printing' :
                        order.status === ORDER_STATUS.READY ? 'bg-status-ready' :
                        order.status === ORDER_STATUS.COMPLETED ? 'bg-status-completed' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium">Order #{order.id}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' · '}
                          ₹{order.cost.toFixed(2)}
                        </div>
                      </div>
                      <div className="ml-auto">
                        <span className={`text-xs px-2 py-1 rounded-full status-badge ${
                          order.status === ORDER_STATUS.PENDING ? 'status-pending' :
                          order.status === ORDER_STATUS.APPROVED ? 'status-approved' :
                          order.status === ORDER_STATUS.PRINTING ? 'status-printing' :
                          order.status === ORDER_STATUS.READY ? 'status-ready' :
                          order.status === ORDER_STATUS.COMPLETED ? 'status-completed' : 'bg-red-100 text-red-700'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 p-2">No orders today</div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">YESTERDAY</h3>
              {yesterdayOrders.length > 0 ? (
                <div className="space-y-2">
                  {yesterdayOrders.slice(0, 3).map(order => (
                    <div key={order.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                      <div className={`h-2 w-2 rounded-full mr-2 ${
                        order.status === ORDER_STATUS.PENDING ? 'bg-status-pending' :
                        order.status === ORDER_STATUS.APPROVED ? 'bg-status-approved' :
                        order.status === ORDER_STATUS.PRINTING ? 'bg-status-printing' :
                        order.status === ORDER_STATUS.READY ? 'bg-status-ready' :
                        order.status === ORDER_STATUS.COMPLETED ? 'bg-status-completed' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium">Order #{order.id}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' · '}
                          ₹{order.cost.toFixed(2)}
                        </div>
                      </div>
                      <div className="ml-auto">
                        <span className={`text-xs px-2 py-1 rounded-full status-badge ${
                          order.status === ORDER_STATUS.COMPLETED ? 'status-completed' : 'bg-red-100 text-red-700'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {yesterdayOrders.length > 3 && (
                    <Link to="/dashboard/revenue" className="text-sm text-printhub-600 font-medium hover:underline">
                      View all {yesterdayOrders.length} orders
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 p-2">No orders yesterday</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Admin Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Admin Actions</h2>
            <div className="space-y-3">
              <Link to="/dashboard/staff" className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-printhub-600 mr-2" />
                  <span className="text-sm font-medium">Staff Management</span>
                </div>
              </Link>
              
              <Link to="/dashboard/revenue" className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-md transition">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-printhub-600 mr-2" />
                  <span className="text-sm font-medium">View Revenue Reports</span>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Inventory Alerts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Inventory Alerts</h2>
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 border border-red-100 rounded-md">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                      <span className="text-sm text-red-700">{item} is running low</span>
                    </div>
                    <button className="text-xs text-printhub-600 font-medium">Order</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-md">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>All inventory levels are good</span>
              </div>
            )}
          </div>
          
          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">System Status</h2>
            <div className={`flex items-center p-3 rounded-md ${
              inventory.ink.black < 10 || 
              inventory.ink.cyan < 10 || 
              inventory.ink.magenta < 10 || 
              inventory.ink.yellow < 10 || 
              inventory.paper['A4'] < 50
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}>
              {inventory.ink.black < 10 || 
               inventory.ink.cyan < 10 || 
               inventory.ink.magenta < 10 || 
               inventory.ink.yellow < 10 || 
               inventory.paper['A4'] < 50 ? (
                <AlertCircle className="h-5 w-5 mr-2" />
              ) : (
                <CheckCircle2 className="h-5 w-5 mr-2" />
              )}
              <span className="font-medium">
                {inventory.ink.black < 10 || 
                 inventory.ink.cyan < 10 || 
                 inventory.ink.magenta < 10 || 
                 inventory.ink.yellow < 10 || 
                 inventory.paper['A4'] < 50
                  ? 'Attention needed'
                  : 'All systems operational'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
