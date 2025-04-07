
import React from 'react';
import { Palette, Inbox, Minus, Plus } from 'lucide-react';
import { Progress } from "../../ui/progress";

const ConsumablesTab = ({ 
  inventory, 
  loading, 
  handleStockChange, 
  isItemSelected,
  toggleReportItem 
}) => {
  return (
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
  );
};

export default ConsumablesTab;
