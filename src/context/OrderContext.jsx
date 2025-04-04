
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

const OrderContext = createContext(null);

export const ORDER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PRINTING: 'printing',
  READY: 'ready',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      userId: 3,
      files: [
        { name: 'assignment.pdf', size: '2.4 MB', pages: 12 }
      ],
      options: {
        copies: 2,
        pageRange: '1-12',
        printType: 'bw',
        sided: 'double',
        paperSize: 'A4',
        notes: 'Please staple all copies',
      },
      status: ORDER_STATUS.PENDING,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      cost: 24.00,
      otp: null
    },
    {
      id: 'ORD-002',
      userId: 3,
      files: [
        { name: 'presentation.pdf', size: '5.7 MB', pages: 20 }
      ],
      options: {
        copies: 3,
        pageRange: '1-20',
        printType: 'color',
        sided: 'single',
        paperSize: 'A4',
        notes: 'Need urgently',
      },
      status: ORDER_STATUS.APPROVED,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      cost: 120.00,
      otp: null
    }
  ]);

  const [inventory, setInventory] = useState({
    ink: {
      black: 70,
      cyan: 85,
      magenta: 90,
      yellow: 80,
    },
    paper: {
      'A4': 500,
      'A3': 100,
      'Letter': 250,
    }
  });

  const [printerStatus, setPrinterStatus] = useState('online'); // online, busy, offline

  // Create a new order
  const createOrder = (orderData) => {
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: ORDER_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      otp: null,
      ...orderData
    };
    
    setOrders([newOrder, ...orders]);
    toast.success(`Order ${newOrder.id} has been created!`);
    return newOrder.id;
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        // Generate OTP if status is changing to completed
        const otp = newStatus === ORDER_STATUS.COMPLETED
          ? Math.floor(1000 + Math.random() * 9000).toString()
          : order.otp;
          
        if (newStatus === ORDER_STATUS.COMPLETED && !order.otp) {
          toast.success(`OTP generated for order ${orderId}: ${otp}`);
        }
        
        return {
          ...order,
          status: newStatus,
          otp
        };
      }
      return order;
    }));
    
    if (newStatus !== ORDER_STATUS.COMPLETED) {
      toast.success(`Order ${orderId} status updated to ${newStatus}`);
    }
  };

  // Update inventory
  const updateInventory = (type, item, quantity) => {
    setInventory(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [item]: quantity
      }
    }));
    toast.success(`Inventory updated: ${item} (${type})`);
  };

  // Toggle printer status
  const togglePrinterStatus = (status) => {
    setPrinterStatus(status);
    toast.info(`Printer status changed to: ${status}`);
  };

  // Get user orders
  const getUserOrders = (userId) => {
    return orders.filter(order => order.userId === userId);
  };

  // Get order by ID
  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  const value = {
    orders,
    inventory,
    printerStatus,
    createOrder,
    updateOrderStatus,
    updateInventory,
    togglePrinterStatus,
    getUserOrders,
    getOrderById,
    ORDER_STATUS
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
