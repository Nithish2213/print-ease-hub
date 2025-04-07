
import React from 'react';
import { ShoppingBag, Edit, Trash2, Calendar, Plus } from 'lucide-react';

const StationaryTab = ({ 
  stationaryItems, 
  handleStationaryItemChange, 
  removeStationaryItem, 
  isItemSelected, 
  toggleReportItem, 
  addStationaryItem 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ShoppingBag className="h-5 w-5 text-printhub-600 mr-2" />
            <h2 className="text-lg font-semibold">Supplies Inventory</h2>
          </div>
          <button 
            onClick={addStationaryItem}
            className="flex items-center text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New Item
          </button>
        </div>
        
        {stationaryItems.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p>No inventory items added yet</p>
            <button 
              onClick={addStationaryItem}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Add your first item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Restocked</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stationaryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {item.name}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <span>{item.quantity} {item.unit}</span>
                        <div className="flex space-x-1 ml-2">
                          <button 
                            onClick={() => handleStationaryItemChange(item.id, 'quantity', Math.max(0, item.quantity - 1))}
                            className="p-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 text-xs"
                            disabled={item.quantity <= 0}
                          >
                            <span>-1</span>
                          </button>
                          <button 
                            onClick={() => handleStationaryItemChange(item.id, 'quantity', item.quantity + 1)}
                            className="p-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 text-xs"
                          >
                            <span>+1</span>
                          </button>
                          <button 
                            onClick={() => handleStationaryItemChange(item.id, 'quantity', item.quantity + 10)}
                            className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                          >
                            <span>+10</span>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {item.quantity < item.threshold ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                        {item.lastRestocked}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => toggleReportItem(item.id, 'stationary', item.name, item.quantity, item.threshold, item.unit)}
                          className={`p-1 rounded ${isItemSelected(item.id, 'stationary') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                          title="Add to report"
                        >
                          {isItemSelected(item.id, 'stationary') ? <span>✓</span> : <span>+</span>}
                        </button>
                        <button
                          className="p-1 bg-gray-100 hover:bg-gray-200 rounded"
                          title="Edit item"
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => removeStationaryItem(item.id)} 
                          className="p-1 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationaryTab;
