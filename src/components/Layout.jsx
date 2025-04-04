
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { 
  LogOut, 
  Menu, 
  X, 
  Home, 
  FileText,
  Clock,
  Settings,
  Users,
  Printer,
  BarChart3,
  Package,
  Calendar
} from 'lucide-react';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout, isAdmin, isCoAdmin, isStudent } = useAuth();
  const { printerStatus } = useOrders();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const NavItem = ({ icon: Icon, label, onClick, active = false }) => (
    <li>
      <button
        onClick={onClick}
        className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
          active 
            ? 'bg-printhub-700 text-white' 
            : 'text-gray-700 hover:bg-printhub-100'
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </button>
    </li>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-printhub-500 hover:bg-gray-100 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-printhub-700">PrintHub</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Printer Status Indicator (for Co-Admin and Admin) */}
              {(isAdmin || isCoAdmin) && (
                <div className="hidden md:flex items-center">
                  <div
                    className={`h-3 w-3 rounded-full mr-2 ${
                      printerStatus === 'online'
                        ? 'bg-green-500 animate-pulse-slow'
                        : printerStatus === 'busy'
                        ? 'bg-yellow-500 animate-pulse-slow'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm font-medium capitalize">
                    Printer {printerStatus}
                  </span>
                </div>
              )}
              
              {/* User Info */}
              <div className="flex items-center">
                <div className="rounded-full bg-printhub-100 text-printhub-700 h-8 w-8 flex items-center justify-center">
                  {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                
                <div className="ml-2 hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{currentUser?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{currentUser?.role}</div>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-500 hover:text-red-500 hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 pt-5">
          <nav className="flex-1 px-4 space-y-1">
            <ul className="space-y-1">
              <NavItem icon={Home} label="Dashboard" onClick={() => navigate('/dashboard')} />
              
              {/* Student specific navigation */}
              {isStudent && (
                <>
                  <NavItem icon={FileText} label="Upload Files" onClick={() => navigate('/upload')} />
                  <NavItem icon={Clock} label="Order History" onClick={() => navigate('/orders')} />
                </>
              )}
              
              {/* Co-Admin specific navigation */}
              {isCoAdmin && (
                <>
                  <NavItem icon={FileText} label="Manage Orders" onClick={() => navigate('/manage-orders')} />
                  <NavItem icon={Printer} label="Printer Controls" onClick={() => navigate('/printer')} />
                  <NavItem icon={Package} label="Inventory" onClick={() => navigate('/inventory')} />
                </>
              )}
              
              {/* Admin specific navigation */}
              {isAdmin && (
                <>
                  <NavItem icon={BarChart3} label="Analytics" onClick={() => navigate('/analytics')} />
                  <NavItem icon={Users} label="Staff Management" onClick={() => navigate('/staff')} />
                  <NavItem icon={Calendar} label="Calendar" onClick={() => navigate('/calendar')} />
                  <NavItem icon={Package} label="Inventory" onClick={() => navigate('/inventory')} />
                </>
              )}
              
              <NavItem icon={Settings} label="Settings" onClick={() => navigate('/settings')} />
            </ul>
          </nav>
        </aside>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 flex z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={toggleSidebar}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              
              <div className="flex-1 h-0 pt-5 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <h1 className="text-2xl font-bold text-printhub-700">PrintHub</h1>
                </div>
                <nav className="mt-5 px-3 space-y-1">
                  <ul className="space-y-1">
                    <NavItem icon={Home} label="Dashboard" onClick={() => { navigate('/dashboard'); toggleSidebar(); }} />
                    
                    {/* Student specific navigation */}
                    {isStudent && (
                      <>
                        <NavItem icon={FileText} label="Upload Files" onClick={() => { navigate('/upload'); toggleSidebar(); }} />
                        <NavItem icon={Clock} label="Order History" onClick={() => { navigate('/orders'); toggleSidebar(); }} />
                      </>
                    )}
                    
                    {/* Co-Admin specific navigation */}
                    {isCoAdmin && (
                      <>
                        <NavItem icon={FileText} label="Manage Orders" onClick={() => { navigate('/manage-orders'); toggleSidebar(); }} />
                        <NavItem icon={Printer} label="Printer Controls" onClick={() => { navigate('/printer'); toggleSidebar(); }} />
                        <NavItem icon={Package} label="Inventory" onClick={() => { navigate('/inventory'); toggleSidebar(); }} />
                      </>
                    )}
                    
                    {/* Admin specific navigation */}
                    {isAdmin && (
                      <>
                        <NavItem icon={BarChart3} label="Analytics" onClick={() => { navigate('/analytics'); toggleSidebar(); }} />
                        <NavItem icon={Users} label="Staff Management" onClick={() => { navigate('/staff'); toggleSidebar(); }} />
                        <NavItem icon={Calendar} label="Calendar" onClick={() => { navigate('/calendar'); toggleSidebar(); }} />
                        <NavItem icon={Package} label="Inventory" onClick={() => { navigate('/inventory'); toggleSidebar(); }} />
                      </>
                    )}
                    
                    <NavItem icon={Settings} label="Settings" onClick={() => { navigate('/settings'); toggleSidebar(); }} />
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
