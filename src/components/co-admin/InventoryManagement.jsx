
import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { 
  Inbox, 
  ShoppingBag, 
  Printer, 
  AlertTriangle, 
  Send,
  Mail,
  Plus,
  Minus,
  BarChart3,
  LineChart,
  Palette,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from "../ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";

const InventoryManagement = () => {
  const { inventory, updateInventory } = useOrders();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("consumables");
  const [stationaryItems, setStationaryItems] = useState([
    { id: 1, name: "Spiral Binding Materials", quantity: 150, threshold: 30, unit: "sets" },
    { id: 2, name: "Staples", quantity: 500, threshold: 100, unit: "boxes" },
    { id: 3, name: "Tape", quantity: 15, threshold: 5, unit: "rolls" },
    { id: 4, name: "Lamination Sheets", quantity: 200, threshold: 50, unit: "sheets" }
  ]);

  const [reportData, setReportData] = useState({
    message: "",
    itemsToReport: [],
    notificationEmail: "admin@printhub.com",
    sendEmail: true
  });
  
  const handleStockChange = (type, item, amount) => {
    setLoading(true);
    
    setTimeout(() => {
      const newInventory = {...inventory};
      
      if (type === 'ink') {
        newInventory.ink[item] = Math.max(0, Math.min(100, newInventory.ink[item] + amount));
      } else if (type === 'paper') {
        newInventory.paper[item] = Math.max(0, Math.min(500, newInventory.paper[item] + amount));
      }
      
      updateInventory(newInventory);
      
      setLoading(false);
      if (amount > 0) {
        toast.success(`${item.toUpperCase()} ${type} inventory increased.`);
      } else {
        toast.success(`${item.toUpperCase()} ${type} inventory decreased.`);
      }
    }, 500);
  };

  const handleStationaryItemChange = (id, field, value) => {
    setStationaryItems(items =>
      items.map(item => 
        item.id === id ? { ...item, [field]: field === 'quantity' || field === 'threshold' ? parseInt(value) || 0 : value } : item
      )
    );
  };
  
  const addStationaryItem = () => {
    const newId = stationaryItems.length > 0 ? Math.max(...stationaryItems.map(item => item.id)) + 1 : 1;
    setStationaryItems([...stationaryItems, { 
      id: newId, 
      name: "New Item", 
      quantity: 0, 
      threshold: 10,
      unit: "pcs"
    }]);
  };
  
  const removeStationaryItem = (id) => {
    setStationaryItems(items => items.filter(item => item.id !== id));
  };
  
  const toggleReportItem = (id, type, name, quantity, threshold, unit) => {
    setReportData(prev => {
      const isAlreadyAdded = prev.itemsToReport.some(item => 
        item.id === id && item.type === type
      );
      
      if (isAlreadyAdded) {
        return {
          ...prev,
          itemsToReport: prev.itemsToReport.filter(item => !(item.id === id && item.type === type))
        };
      } else {
        return {
          ...prev,
          itemsToReport: [
            ...prev.itemsToReport, 
            { id, type, name, quantity, threshold, unit }
          ]
        };
      }
    });
  };
  
  const isItemSelected = (id, type) => {
    return reportData.itemsToReport.some(item => 
      item.id === id && item.type === type
    );
  };
  
  const sendReport = () => {
    if (reportData.itemsToReport.length === 0) {
      toast.error("Please select at least one item to report");
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      
      // Show report success message
      toast.success(
        reportData.sendEmail 
          ? "Inventory report sent to admin via email" 
          : "Inventory report saved to system"
      );
      
      // Clear report data
      setReportData({
        ...reportData,
        message: "",
        itemsToReport: []
      });
    }, 1500);
  };
  
  const getLowStockItems = () => {
    const lowStockItems = [];
    
    // Check ink levels
    Object.entries(inventory.ink).forEach(([name, level]) => {
      if (level < 25) {
        lowStockItems.push({ 
          id: `ink-${name}`, 
          type: 'ink', 
          name: `${name.charAt(0).toUpperCase() + name.slice(1)} Ink`, 
          quantity: level,
          threshold: 25,
          unit: "%"
        });
      }
    });
    
    // Check paper levels
    Object.entries(inventory.paper).forEach(([name, quantity]) => {
      if (quantity < 100) {
        lowStockItems.push({ 
          id: `paper-${name}`, 
          type: 'paper', 
          name: `${name} Paper`, 
          quantity,
          threshold: 100,
          unit: "sheets"
        });
      }
    });
    
    // Check stationary items
    stationaryItems.forEach(item => {
      if (item.quantity < item.threshold) {
        lowStockItems.push({
          id: item.id,
          type: 'stationary',
          name: item.name,
          quantity: item.quantity,
          threshold: item.threshold,
          unit: item.unit
        });
      }
    });
    
    return lowStockItems;
  };
  
  const lowStockItems = getLowStockItems();
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-gray-600">Manage print supplies and stationary inventory</p>
      </div>
      
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="text-amber-800 font-medium">Low Stock Warning</h3>
          </div>
          <p className="text-amber-700 text-sm mt-1 mb-2">
            {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} below threshold levels. Consider restocking soon.
          </p>
          <button 
            className="text-sm text-amber-700 font-medium hover:text-amber-800 underline"
            onClick={() => {
              setActiveTab("reports");
              setReportData({
                ...reportData,
                itemsToReport: lowStockItems,
                message: "The following items are below threshold levels and need to be restocked."
              });
            }}
          >
            Generate Restock Report
          </button>
        </div>
      )}
      
      <Tabs defaultValue="consumables" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="consumables" className="flex items-center gap-1.5">
            <Printer className="h-4 w-4" />
            Print Consumables
          </TabsTrigger>
          <TabsTrigger value="stationary" className="flex items-center gap-1.5">
            <ShoppingBag className="h-4 w-4" />
            Stationary
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="consumables" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ink Levels */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Palette className="h-5 w-5 text-printhub-600 mr-2" />
                  <h2 className="text-lg font-semibold">Ink Levels</h2>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(inventory.ink).map(([name, level]) => (
                    <div key={`ink-${name}`} className="border-b border-gray-100 pb-4 last:pb-0 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="capitalize">{name}</span>
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${level < 25 ? 'text-red-600' : level < 50 ? 'text-amber-600' : 'text-gray-700'}`}>
                            {level}%
                          </span>
                          <div className="ml-4 flex space-x-1">
                            <button 
                              onClick={() => handleStockChange('ink', name, -10)}
                              disabled={loading || level <= 0}
                              className="p-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                            >
                              <Minus className="h-4 w-4 text-gray-600" />
                            </button>
                            <button 
                              onClick={() => handleStockChange('ink', name, 10)}
                              disabled={loading || level >= 100}
                              className="p-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                          <button 
                            className={`ml-2 p-1 rounded ${isItemSelected(`ink-${name}`, 'ink') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            onClick={() => toggleReportItem(`ink-${name}`, 'ink', `${name.charAt(0).toUpperCase() + name.slice(1)} Ink`, level, 25, "%")}
                          >
                            {isItemSelected(`ink-${name}`, 'ink') ? (
                              <span className="text-xs">✓</span>
                            ) : (
                              <span className="text-xs">+</span>
                            )}
                          </button>
                        </div>
                      </div>
                      <Progress 
                        value={level} 
                        className="h-2" 
                        style={{
                          backgroundColor: level < 25 ? 'rgba(220, 38, 38, 0.1)' : level < 50 ? 'rgba(245, 158, 11, 0.1)' : undefined
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Paper Stock */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Inbox className="h-5 w-5 text-printhub-600 mr-2" />
                  <h2 className="text-lg font-semibold">Paper Stock</h2>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(inventory.paper).map(([name, quantity]) => (
                    <div key={`paper-${name}`} className="border-b border-gray-100 pb-4 last:pb-0 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <span>{name} Paper</span>
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${quantity < 100 ? 'text-red-600' : quantity < 200 ? 'text-amber-600' : 'text-gray-700'}`}>
                            {quantity} sheets
                          </span>
                          <div className="ml-4 flex space-x-1">
                            <button 
                              onClick={() => handleStockChange('paper', name, -50)}
                              disabled={loading || quantity <= 0}
                              className="p-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                            >
                              <Minus className="h-4 w-4 text-gray-600" />
                            </button>
                            <button 
                              onClick={() => handleStockChange('paper', name, 50)}
                              disabled={loading || quantity >= 500}
                              className="p-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                          <button 
                            className={`ml-2 p-1 rounded ${isItemSelected(`paper-${name}`, 'paper') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            onClick={() => toggleReportItem(`paper-${name}`, 'paper', `${name} Paper`, quantity, 100, "sheets")}
                          >
                            {isItemSelected(`paper-${name}`, 'paper') ? (
                              <span className="text-xs">✓</span>
                            ) : (
                              <span className="text-xs">+</span>
                            )}
                          </button>
                        </div>
                      </div>
                      <Progress 
                        value={quantity / 5} 
                        className="h-2" 
                        style={{
                          backgroundColor: quantity < 100 ? 'rgba(220, 38, 38, 0.1)' : quantity < 200 ? 'rgba(245, 158, 11, 0.1)' : undefined
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="stationary">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 text-printhub-600 mr-2" />
                  <h2 className="text-lg font-semibold">Stationary Items</h2>
                </div>
                <button 
                  onClick={addStationaryItem}
                  className="flex items-center text-sm bg-printhub-600 text-white px-2 py-1 rounded hover:bg-printhub-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              </div>
              
              {stationaryItems.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p>No stationary items added yet</p>
                  <button 
                    onClick={addStationaryItem}
                    className="mt-2 text-sm text-printhub-600 hover:text-printhub-700"
                  >
                    Add your first item
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-left">
                      <tr>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stationaryItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <input 
                              type="text" 
                              value={item.name} 
                              onChange={(e) => handleStationaryItemChange(item.id, 'name', e.target.value)}
                              className="w-full px-1 py-1 border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center space-x-2">
                              <input 
                                type="number" 
                                value={item.quantity} 
                                onChange={(e) => handleStationaryItemChange(item.id, 'quantity', e.target.value)}
                                className="w-20 px-1 py-1 border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              />
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => handleStationaryItemChange(item.id, 'quantity', item.quantity - 1)}
                                  disabled={item.quantity <= 0}
                                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                  <Minus className="h-3 w-3 text-gray-600" />
                                </button>
                                <button 
                                  onClick={() => handleStationaryItemChange(item.id, 'quantity', item.quantity + 1)}
                                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded"
                                >
                                  <Plus className="h-3 w-3 text-gray-600" />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <input 
                              type="text" 
                              value={item.unit} 
                              onChange={(e) => handleStationaryItemChange(item.id, 'unit', e.target.value)}
                              className="w-20 px-1 py-1 border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input 
                              type="number" 
                              value={item.threshold} 
                              onChange={(e) => handleStationaryItemChange(item.id, 'threshold', e.target.value)}
                              className="w-20 px-1 py-1 border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            {item.quantity < item.threshold ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Low Stock
                              </span>
                            ) : item.quantity < item.threshold * 2 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                Warning
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                In Stock
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button 
                              onClick={() => toggleReportItem(item.id, 'stationary', item.name, item.quantity, item.threshold, item.unit)}
                              className={`p-1 rounded mr-1 ${isItemSelected(item.id, 'stationary') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                              title="Add to report"
                            >
                              {isItemSelected(item.id, 'stationary') ? <span>✓</span> : <Send className="h-4 w-4" />}
                            </button>
                            <button 
                              onClick={() => removeStationaryItem(item.id)} 
                              className="p-1 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-printhub-600 mr-2" />
                  <h2 className="text-lg font-semibold">Inventory Report</h2>
                </div>
                <button
                  onClick={() => {
                    setReportData({
                      ...reportData,
                      itemsToReport: lowStockItems,
                      message: "The following items are below threshold levels and need to be restocked."
                    });
                  }}
                  className="text-sm text-printhub-600 hover:text-printhub-700 flex items-center"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Auto-select low stock
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="report-message">Report Message</Label>
                  <Textarea 
                    id="report-message"
                    placeholder="Enter additional information for this inventory report..."
                    className="mt-1"
                    value={reportData.message}
                    onChange={(e) => setReportData({...reportData, message: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block">Selected Items for Report</Label>
                  
                  {reportData.itemsToReport.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-gray-500 text-sm">
                        No items selected. Click + on items you want to include in the report.
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.itemsToReport.map((item) => (
                            <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm">{item.name}</td>
                              <td className="px-4 py-2 text-sm">{item.quantity} {item.unit}</td>
                              <td className="px-4 py-2 text-sm">{item.threshold} {item.unit}</td>
                              <td className="px-4 py-2 text-sm">
                                {item.quantity < item.threshold ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Low Stock
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    In Stock
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm text-right">
                                <button
                                  onClick={() => toggleReportItem(item.id, item.type, item.name, item.quantity, item.threshold, item.unit)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <div className="flex items-center mb-4">
                    <input
                      id="send-email"
                      type="checkbox"
                      checked={reportData.sendEmail}
                      onChange={() => setReportData({...reportData, sendEmail: !reportData.sendEmail})}
                      className="h-4 w-4 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="send-email" className="ml-2 block text-sm font-medium text-gray-700">
                      Send email notification to admin
                    </label>
                  </div>
                  
                  {reportData.sendEmail && (
                    <div className="ml-6">
                      <Label htmlFor="notification-email">Admin Email</Label>
                      <Input
                        id="notification-email"
                        type="email"
                        value={reportData.notificationEmail}
                        onChange={(e) => setReportData({...reportData, notificationEmail: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    onClick={sendReport}
                    disabled={loading || reportData.itemsToReport.length === 0}
                    className="flex items-center bg-printhub-600 text-white px-4 py-2 rounded hover:bg-printhub-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {reportData.sendEmail ? "Send Report to Admin" : "Save Report"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManagement;
