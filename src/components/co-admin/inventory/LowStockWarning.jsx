
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const LowStockWarning = ({ lowStockItems, setActiveTab, setReportData }) => {
  if (lowStockItems.length === 0) return null;
  
  return (
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
          setReportData(prev => ({
            ...prev,
            itemsToReport: lowStockItems,
            message: "The following items are below threshold levels and need to be restocked."
          }));
        }}
      >
        Generate Restock Report
      </button>
    </div>
  );
};

export default LowStockWarning;
