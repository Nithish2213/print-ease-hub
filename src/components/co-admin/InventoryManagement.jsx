
import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Inbox, ShoppingBag, Printer, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

// Import the refactored components
import ConsumablesTab from './inventory/ConsumablesTab';
import StationaryTab from './inventory/StationaryTab';
import ReportsTab from './inventory/ReportsTab';
import LowStockWarning from './inventory/LowStockWarning';
import { getLowStockItems, createNewStationaryItem } from './inventory/inventoryUtils';

const InventoryManagement = () => {
  const { inventory, updateInventory } = useOrders();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("consumables");
  const [stationaryItems, setStationaryItems] = useState([
    { id: 1, name: "A4 Paper", quantity: 2511, threshold: 500, unit: "sheets", lastRestocked: "Apr 7, 2025" },
    { id: 2, name: "Black Toner", quantity: 3, threshold: 1, unit: "cartridges", lastRestocked: "Mar 24, 2025" },
    { id: 3, name: "Color Toner", quantity: 2, threshold: 1, unit: "cartridges", lastRestocked: "Mar 17, 2025" },
    { id: 4, name: "Spiral Binding Coils", quantity: 10, threshold: 5, unit: "packs", lastRestocked: "Mar 28, 2025" }
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
    const newItem = createNewStationaryItem(stationaryItems);
    setStationaryItems([...stationaryItems, newItem]);
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
  
  // Get low stock items
  const lowStockItems = getLowStockItems(inventory, stationaryItems);
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-gray-600">Track and manage printing supplies and resources</p>
      </div>
      
      <LowStockWarning 
        lowStockItems={lowStockItems} 
        setActiveTab={setActiveTab} 
        setReportData={setReportData} 
      />
      
      <Tabs defaultValue="consumables" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="consumables" className="flex items-center gap-1.5">
            <Printer className="h-4 w-4" />
            Print Consumables
          </TabsTrigger>
          <TabsTrigger value="stationary" className="flex items-center gap-1.5">
            <ShoppingBag className="h-4 w-4" />
            Supplies
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="consumables" className="space-y-6">
          <ConsumablesTab
            inventory={inventory}
            loading={loading}
            handleStockChange={handleStockChange}
            isItemSelected={isItemSelected}
            toggleReportItem={toggleReportItem}
          />
        </TabsContent>
        
        <TabsContent value="stationary">
          <StationaryTab 
            stationaryItems={stationaryItems}
            handleStationaryItemChange={handleStationaryItemChange}
            removeStationaryItem={removeStationaryItem}
            isItemSelected={isItemSelected}
            toggleReportItem={toggleReportItem}
            addStationaryItem={addStationaryItem}
          />
        </TabsContent>
        
        <TabsContent value="reports">
          <ReportsTab 
            reportData={reportData}
            setReportData={setReportData}
            sendReport={sendReport}
            loading={loading}
            lowStockItems={lowStockItems}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryManagement;
