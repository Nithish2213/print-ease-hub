
import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { 
  Package, 
  Printer, 
  Send, 
  Save,
  AlertCircle,
  Plus,
  Minus,
  FileText,
  Palette,
  FileInput,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";

const InventoryManagement = () => {
  const { inventory, updateInventory } = useOrders();
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    ink: { ...inventory.ink },
    paper: { ...inventory.paper },
    stationery: [
      { name: 'Staples', quantity: 500 },
      { name: 'Paperclips', quantity: 200 },
      { name: 'Folders', quantity: 40 }
    ]
  });
  const [reportSent, setReportSent] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0 });
  
  const handleInputChange = (category, item, value) => {
    const numValue = parseInt(value, 10);
    
    if (category === 'stationery') {
      setFormData(prev => ({
        ...prev,
        stationery: prev.stationery.map(product => 
          product.name === item ? { ...product, quantity: isNaN(numValue) ? 0 : numValue } : product
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [item]: isNaN(numValue) ? 0 : numValue
        }
      }));
    }
  };
  
  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' ? (parseInt(value, 10) || 0) : value 
    }));
  };
  
  const addNewItem = () => {
    if (newItem.name.trim() === '') {
      toast.error('Please enter an item name');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      stationery: [...prev.stationery, { ...newItem }]
    }));
    
    setNewItem({ name: '', quantity: 0 });
    setShowAddItem(false);
    toast.success(`Added "${newItem.name}" to inventory`);
  };
  
  const saveChanges = () => {
    // Update ink levels
    Object.entries(formData.ink).forEach(([color, level]) => {
      updateInventory('ink', color, level);
    });
    
    // Update paper levels
    Object.entries(formData.paper).forEach(([type, quantity]) => {
      updateInventory('paper', type, quantity);
    });
    
    setEditMode(false);
    toast.success('Inventory levels updated');
  };
  
  const sendReport = () => {
    setReportSent(true);
    
    // Simulate sending
    setTimeout(() => {
      toast.success('Inventory report sent to admin');
    }, 1000);
  };
  
  const getProgressColor = (percentage) => {
    if (percentage < 20) return 'text-red-600';
    if (percentage < 40) return 'text-amber-600';
    return 'text-green-600';
  };
  
  const getLowStockItems = () => {
    const lowInk = Object.entries(formData.ink).filter(([_, value]) => value < 20);
    const lowPaper = Object.entries(formData.paper).filter(([_, value]) => value < 100);
    const lowStationery = formData.stationery.filter(item => item.quantity < 50);
    
    return [...lowInk.map(([key]) => `${key} ink`), ...lowPaper.map(([key]) => `${key} paper`), ...lowStationery.map(item => item.name)];
  };
  
  const lowStockItems = getLowStockItems();
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-gray-600">Monitor and update stock levels</p>
      </div>
      
      {lowStockItems.length > 0 && !editMode && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 mb-1">Low Stock Alert</h3>
              <p className="text-amber-700 text-sm mb-2">
                The following items are running low and should be restocked:
              </p>
              <ul className="list-disc pl-5 text-sm text-amber-700">
                {lowStockItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Ink Levels Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
          <div className="flex items-center mb-4">
            <Palette className="h-6 w-6 text-printhub-600 mr-2" />
            <h2 className="text-xl font-semibold">Ink Levels</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(formData.ink).map(([color, level]) => (
              <div key={color}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{color}</span>
                  {editMode ? (
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleInputChange('ink', color, Math.max(0, level - 5))}
                        className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={level}
                        onChange={(e) => handleInputChange('ink', color, e.target.value)}
                        className="w-12 mx-1 text-center border border-gray-300 rounded"
                      />
                      <button 
                        onClick={() => handleInputChange('ink', color, Math.min(100, level + 5))}
                        className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <span className={`text-sm ${getProgressColor(level)}`}>{level}%</span>
                  )}
                </div>
                <Progress value={level} className="h-2" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Paper Stock Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
          <div className="flex items-center mb-4">
            <FileInput className="h-6 w-6 text-printhub-600 mr-2" />
            <h2 className="text-xl font-semibold">Paper Stock</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(formData.paper).map(([type, quantity]) => {
              const percentage = Math.min(100, Math.round(quantity / 5));
              
              return (
                <div key={type}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{type}</span>
                    {editMode ? (
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleInputChange('paper', type, Math.max(0, quantity - 10))}
                          className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={quantity}
                          onChange={(e) => handleInputChange('paper', type, e.target.value)}
                          className="w-16 mx-1 text-center border border-gray-300 rounded"
                        />
                        <button 
                          onClick={() => handleInputChange('paper', type, quantity + 10)}
                          className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className={`text-sm ${getProgressColor(percentage)}`}>{quantity} sheets</span>
                    )}
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Stationery Products Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Package className="h-6 w-6 text-printhub-600 mr-2" />
            <h2 className="text-xl font-semibold">Stationery Products</h2>
          </div>
          
          {editMode && (
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </button>
          )}
        </div>
        
        {showAddItem && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
            <h3 className="text-sm font-medium mb-2">Add New Item</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <input
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={handleNewItemChange}
                  placeholder="Item name"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="quantity"
                  value={newItem.quantity}
                  onChange={handleNewItemChange}
                  placeholder="Quantity"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="0"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={addNewItem}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowAddItem(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formData.stationery.map((item, index) => {
                const status = item.quantity < 20 ? 'critical' : item.quantity < 50 ? 'low' : 'good';
                
                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editMode ? (
                        <div className="flex items-center">
                          <button 
                            onClick={() => handleInputChange('stationery', item.name, Math.max(0, item.quantity - 5))}
                            className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => handleInputChange('stationery', item.name, e.target.value)}
                            className="w-16 mx-1 text-center border border-gray-300 rounded"
                          />
                          <button 
                            onClick={() => handleInputChange('stationery', item.name, item.quantity + 5)}
                            className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        status === 'critical' ? 'bg-red-100 text-red-800' :
                        status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {status === 'critical' ? 'Critical' : status === 'low' ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Report Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
        <div className="flex items-center mb-4">
          <FileText className="h-6 w-6 text-printhub-600 mr-2" />
          <h2 className="text-xl font-semibold">Inventory Report</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          Send the current inventory levels to the administrator. This report helps in managing stock orders and maintaining optimal inventory levels.
        </p>
        
        <div className="flex justify-end space-x-3">
          {editMode ? (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="flex items-center px-4 py-2 bg-printhub-600 text-white rounded-md hover:bg-printhub-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Update Inventory
              </button>
              <button
                onClick={sendReport}
                disabled={reportSent}
                className={`flex items-center px-4 py-2 ${
                  reportSent ? 'bg-green-500' : 'bg-printhub-600 hover:bg-printhub-700'
                } text-white rounded-md`}
              >
                {reportSent ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Report Sent
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Report to Admin
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
