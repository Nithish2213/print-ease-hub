
export const getLowStockItems = (inventory, stationaryItems) => {
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

export const createNewStationaryItem = (stationaryItems) => {
  const newId = stationaryItems.length > 0 ? Math.max(...stationaryItems.map(item => item.id)) + 1 : 1;
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return { 
    id: newId, 
    name: "New Item", 
    quantity: 0, 
    threshold: 10,
    unit: "pcs",
    lastRestocked: today
  };
};
