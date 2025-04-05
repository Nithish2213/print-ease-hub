
import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { 
  Printer, 
  Settings2, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Wifi,
  WifiOff,
  RefreshCw,
  FileWarning,
  FilePlus,
  Search,
  Sliders,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";

const PrinterControls = () => {
  const { printerStatus, togglePrinterStatus, inventory, updateInventory } = useOrders();
  
  const [currentTask, setCurrentTask] = useState(null);
  const [printerSettings, setPrinterSettings] = useState({
    resolution: "600dpi",
    paperSource: "tray1",
    quality: "normal",
    maintenance: false
  });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('basic'); // basic or advanced
  
  const handlePrinterStatusChange = (status) => {
    setLoading(true);
    
    // Simulate loading state
    setTimeout(() => {
      togglePrinterStatus(status);
      setLoading(false);
      toast.success(`Printer status changed to ${status}`);
    }, 1000);
  };
  
  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setPrinterSettings(prev => ({
      ...prev,
      [name]: value
    }));
    toast.success(`Printer setting updated: ${name}`);
  };
  
  const handleMaintenance = () => {
    setPrinterSettings(prev => ({
      ...prev,
      maintenance: !prev.maintenance
    }));
    
    if (!printerSettings.maintenance) {
      toast.info("Maintenance mode activated - print jobs will be paused");
      togglePrinterStatus('busy');
    } else {
      toast.info("Maintenance mode deactivated");
      togglePrinterStatus('online');
    }
  };
  
  const simulateTask = (taskName, duration = 2000) => {
    setCurrentTask({ name: taskName, progress: 0 });
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setCurrentTask(prev => ({ ...prev, progress }));
      
      if (progress >= 100) {
        clearInterval(interval);
        toast.success(`${taskName} completed`);
        
        setTimeout(() => {
          setCurrentTask(null);
        }, 500);
      }
    }, duration / 20);
  };
  
  const handleDriverUpdate = () => {
    simulateTask('Updating printer drivers', 5000);
    setTimeout(() => {
      toast.success('Printer drivers updated to version 2.1.5');
    }, 5000);
  };
  
  // Calculate ink levels
  const calculateInkStatus = () => {
    const { black, cyan, magenta, yellow } = inventory.ink;
    
    if (black < 10 || cyan < 10 || magenta < 10 || yellow < 10) {
      return "critical";
    } else if (black < 25 || cyan < 25 || magenta < 25 || yellow < 25) {
      return "low";
    } else {
      return "good";
    }
  };
  
  const inkStatus = calculateInkStatus();
  
  const StatusIndicator = ({ status }) => {
    let bgColor, textColor, icon;
    
    switch (status) {
      case 'online':
        bgColor = 'bg-green-100';
        textColor = 'text-green-700';
        icon = <CheckCircle className="h-5 w-5 mr-2" />;
        break;
      case 'busy':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-700';
        icon = <AlertTriangle className="h-5 w-5 mr-2" />;
        break;
      default:
        bgColor = 'bg-red-100';
        textColor = 'text-red-700';
        icon = <WifiOff className="h-5 w-5 mr-2" />;
    }
    
    return (
      <div className={`flex items-center ${bgColor} ${textColor} px-4 py-2 rounded-md`}>
        {icon}
        <span className="font-medium capitalize">{status}</span>
      </div>
    );
  };

  const isActive = printerStatus !== 'offline';
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Printer Controls</h1>
        <p className="text-gray-600">Manage printer settings, status and maintenance</p>
      </div>
      
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setViewMode('basic')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              viewMode === 'basic' 
              ? 'bg-printhub-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Basic
          </button>
          <button
            onClick={() => setViewMode('advanced')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              viewMode === 'advanced' 
              ? 'bg-printhub-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-l-0 border-gray-300`}
          >
            Advanced
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Printer Status Card */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Printer className="h-6 w-6 text-printhub-600 mr-2" />
              <h2 className="text-xl font-semibold">Printer Status</h2>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <StatusIndicator status={printerStatus} />
              
              <div className="flex space-x-2 mt-4 md:mt-0">
                <button 
                  onClick={() => handlePrinterStatusChange('online')}
                  disabled={loading || printerStatus === 'online'}
                  className={`px-3 py-1 text-sm rounded-md ${
                    printerStatus === 'online' ? 'bg-green-100 text-green-700 border border-green-300' : 
                    'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Online
                </button>
                
                <button 
                  onClick={() => handlePrinterStatusChange('busy')}
                  disabled={loading || printerStatus === 'busy'}
                  className={`px-3 py-1 text-sm rounded-md ${
                    printerStatus === 'busy' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 
                    'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Busy
                </button>
                
                <button 
                  onClick={() => handlePrinterStatusChange('offline')}
                  disabled={loading || printerStatus === 'offline'}
                  className={`px-3 py-1 text-sm rounded-md ${
                    printerStatus === 'offline' ? 'bg-red-100 text-red-700 border border-red-300' : 
                    'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Offline
                </button>
              </div>
            </div>
            
            {/* Current Task */}
            {currentTask && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Task: {currentTask.name}</span>
                  <span>{currentTask.progress}%</span>
                </div>
                <Progress value={currentTask.progress} className="h-2" />
              </div>
            )}
            
            {/* Server Status */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Connection Status</h3>
              <div className="flex items-center">
                {isActive ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="h-5 w-5 mr-2" />
                    <span>Connected to print server</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff className="h-5 w-5 mr-2" />
                    <span>Disconnected from print server</span>
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    if (!isActive) {
                      handlePrinterStatusChange('online');
                    } else {
                      simulateTask('Reconnecting to server');
                    }
                  }}
                  className="ml-4 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  disabled={loading || currentTask}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {isActive ? 'Refresh Connection' : 'Connect to Server'}
                </button>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => simulateTask('Cleaning printheads')}
                  disabled={!isActive || currentTask}
                  className={`flex flex-col items-center justify-center p-4 rounded-md border ${
                    isActive ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Settings2 className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm">Clean Printheads</span>
                </button>
                
                <button 
                  onClick={() => simulateTask('Aligning printheads')}
                  disabled={!isActive || currentTask}
                  className={`flex flex-col items-center justify-center p-4 rounded-md border ${
                    isActive ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Settings2 className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm">Align Printheads</span>
                </button>
                
                <button 
                  onClick={() => simulateTask('Running printer diagnostic')}
                  disabled={!isActive || currentTask}
                  className={`flex flex-col items-center justify-center p-4 rounded-md border ${
                    isActive ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <FileWarning className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm">Diagnostics</span>
                </button>
                
                <button 
                  onClick={() => simulateTask('Printing test page')}
                  disabled={!isActive || currentTask}
                  className={`flex flex-col items-center justify-center p-4 rounded-md border ${
                    isActive ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <FilePlus className="h-6 w-6 text-gray-600 mb-2" />
                  <span className="text-sm">Test Page</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ink Levels Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Ink Levels</h2>
              {inkStatus === "critical" && (
                <div className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded">
                  Critical
                </div>
              )}
              {inkStatus === "low" && (
                <div className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded">
                  Low
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Black</span>
                  <span>{inventory.ink.black}%</span>
                </div>
                <Progress value={inventory.ink.black} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Cyan</span>
                  <span>{inventory.ink.cyan}%</span>
                </div>
                <Progress value={inventory.ink.cyan} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Magenta</span>
                  <span>{inventory.ink.magenta}%</span>
                </div>
                <Progress value={inventory.ink.magenta} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Yellow</span>
                  <span>{inventory.ink.yellow}%</span>
                </div>
                <Progress value={inventory.ink.yellow} className="h-2" />
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Paper Trays</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>A4 Paper</span>
                    <span>{Math.round(inventory.paper['A4'] / 5)}%</span>
                  </div>
                  <Progress value={Math.round(inventory.paper['A4'] / 5)} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>A3 Paper</span>
                    <span>{Math.round(inventory.paper['A3'] / 5)}%</span>
                  </div>
                  <Progress value={Math.round(inventory.paper['A3'] / 5)} className="h-2" />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={() => simulateTask('Updating inventory levels')}
                className="w-full btn-primary"
                disabled={currentTask}
              >
                Update Inventory Levels
              </button>
            </div>
          </div>
        </div>
        
        {/* Settings */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Settings2 className="h-6 w-6 text-printhub-600 mr-2" />
              <h2 className="text-xl font-semibold">Printer Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Print Resolution</label>
                <select
                  name="resolution"
                  value={printerSettings.resolution}
                  onChange={handleSettingChange}
                  disabled={!isActive || printerSettings.maintenance}
                  className="w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50"
                >
                  <option value="300dpi">300 DPI (Draft)</option>
                  <option value="600dpi">600 DPI (Normal)</option>
                  <option value="1200dpi">1200 DPI (High Quality)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paper Source</label>
                <select
                  name="paperSource"
                  value={printerSettings.paperSource}
                  onChange={handleSettingChange}
                  disabled={!isActive || printerSettings.maintenance}
                  className="w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50"
                >
                  <option value="tray1">Tray 1 (A4)</option>
                  <option value="tray2">Tray 2 (A3)</option>
                  <option value="manual">Manual Feed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Print Quality</label>
                <select
                  name="quality"
                  value={printerSettings.quality}
                  onChange={handleSettingChange}
                  disabled={!isActive || printerSettings.maintenance}
                  className="w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50"
                >
                  <option value="draft">Draft (Fast)</option>
                  <option value="normal">Normal</option>
                  <option value="best">Best (Slow)</option>
                </select>
              </div>
            </div>
            
            {/* Advanced Settings */}
            {viewMode === 'advanced' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color Calibration</label>
                    <select
                      name="colorCalibration"
                      className="w-full border border-gray-300 rounded px-3 py-2 disabled:opacity-50"
                      disabled={!isActive || printerSettings.maintenance}
                    >
                      <option value="standard">Standard</option>
                      <option value="vivid">Vivid Colors</option>
                      <option value="professional">Professional</option>
                      <option value="custom">Custom Profile</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Network Configuration</label>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => simulateTask('Network diagnostics')} 
                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded text-sm"
                      >
                        Diagnostic
                      </button>
                      <button 
                        onClick={() => simulateTask('IP Configuration')} 
                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded text-sm"
                      >
                        IP Settings
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Firmware</label>
                    <div className="flex flex-col space-y-2">
                      <div className="text-xs text-gray-500">Current version: v2.1.4</div>
                      <button 
                        onClick={handleDriverUpdate} 
                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-sm flex items-center justify-center"
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        Update Drivers
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={handleMaintenance}
                className={`px-4 py-2 rounded-md ${
                  printerSettings.maintenance
                  ? 'bg-amber-100 text-amber-700 border border-amber-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}
              >
                {printerSettings.maintenance ? 'Exit Maintenance Mode' : 'Enter Maintenance Mode'}
              </button>
              
              <button
                onClick={() => {
                  setPrinterSettings({
                    resolution: "600dpi",
                    paperSource: "tray1",
                    quality: "normal",
                    maintenance: false
                  });
                  toast.success('Printer settings restored to default');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrinterControls;
