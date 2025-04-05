
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const OrderContext = createContext(null);

export const ORDER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  PRINTING: 'printing',
  READY: 'ready',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  DELIVERED: 'delivered'
};

export const OrderProvider = ({ children }) => {
  const { currentUser } = useAuth();

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
      otp: null,
      paymentMethod: 'qr',
      paymentDetails: {
        name: '',
        phone: '',
        reference: 'REF123456'
      }
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
      otp: null,
      paymentMethod: 'phonepe',
      paymentDetails: {
        name: 'John Doe',
        phone: '9876543210',
        reference: ''
      }
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
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Check if we need to send inventory alerts
    const checkInventoryAlerts = () => {
      const lowInk = Object.entries(inventory.ink).filter(([_, level]) => level < 20);
      const lowPaper = Object.entries(inventory.paper).filter(([_, quantity]) => quantity < 100);
      
      if (lowInk.length > 0 || lowPaper.length > 0) {
        const items = [
          ...lowInk.map(([color]) => `${color} ink`),
          ...lowPaper.map(([type]) => `${type} paper`)
        ];
        
        addNotification({
          type: 'inventory-alert',
          message: `Low inventory alert: ${items.join(', ')}`,
          read: false,
          timestamp: new Date().toISOString(),
        });
      }
    };
    
    checkInventoryAlerts();
  }, [inventory]);

  // Create a new order
  const createOrder = (orderData) => {
    // Check if printer is offline
    if (printerStatus === 'offline') {
      toast.error('Cannot place order. Print server is offline.');
      return null;
    }
    
    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: ORDER_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      otp: null,
      ...orderData
    };
    
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    toast.success(`Order ${newOrder.id} has been created!`);
    
    // Add notification for co-admin
    addNotification({
      type: 'new-order',
      orderId: newOrder.id,
      message: `New order received: ${newOrder.id}`,
      read: false,
      timestamp: new Date().toISOString(),
    });
    
    return newOrder.id;
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId) {
        // Generate OTP if status is changing to completed
        const otp = newStatus === ORDER_STATUS.COMPLETED
          ? Math.floor(1000 + Math.random() * 9000).toString()
          : order.otp;
          
        if (newStatus === ORDER_STATUS.COMPLETED && !order.otp) {
          toast.success(`OTP generated for order ${orderId}: ${otp}`);
        }
        
        // Add notification for student
        if (order.status !== newStatus) {
          addNotification({
            type: 'status-change',
            orderId: orderId,
            message: `Order ${orderId} status updated to ${newStatus}`,
            forUserId: order.userId,
            read: false,
            timestamp: new Date().toISOString(),
          });
        }
        
        // Update inventory based on the print job if status is changing to printing
        if (newStatus === ORDER_STATUS.PRINTING) {
          updateInventoryBasedOnOrder(order);
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

  // Update inventory based on the print job
  const updateInventoryBasedOnOrder = (order) => {
    const { options, files } = order;
    const totalPages = files.reduce((total, file) => total + file.pages, 0) * options.copies;
    
    // Update ink levels (reduce more for color printing)
    const inkReduction = options.printType === 'color' ? 0.2 : 0.1; // % per page
    
    setInventory(prev => {
      const newInk = { ...prev.ink };
      
      // Reduce black ink for all prints
      newInk.black = Math.max(0, newInk.black - (totalPages * inkReduction));
      
      // Reduce color inks only for color prints
      if (options.printType === 'color') {
        newInk.cyan = Math.max(0, newInk.cyan - (totalPages * inkReduction * 0.7));
        newInk.magenta = Math.max(0, newInk.magenta - (totalPages * inkReduction * 0.7));
        newInk.yellow = Math.max(0, newInk.yellow - (totalPages * inkReduction * 0.7));
      }
      
      // Update paper stock
      const paperSize = options.paperSize;
      const paperReduction = options.sided === 'double' ? Math.ceil(totalPages / 2) : totalPages;
      
      return {
        ink: newInk,
        paper: {
          ...prev.paper,
          [paperSize]: Math.max(0, prev.paper[paperSize] - paperReduction)
        }
      };
    });
  };

  // Add notification
  const addNotification = (notification) => {
    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      ...notification
    }, ...prev]);
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prevNotifications => prevNotifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  // Get notifications for current user
  const getUserNotifications = () => {
    if (!currentUser) return [];
    
    return notifications.filter(notif => 
      !notif.forUserId || notif.forUserId === currentUser.id
    );
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

  // Get orders by status
  const getOrdersByStatus = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  // Generate receipt for completed order
  const generateReceipt = (orderId) => {
    const order = getOrderById(orderId);
    if (!order) return null;
    
    return {
      orderId: order.id,
      date: new Date(order.createdAt).toLocaleDateString(),
      amount: order.cost,
      paymentMethod: order.paymentMethod || 'Direct Payment',
      items: order.files.map(file => ({
        name: file.name,
        pages: file.pages,
        copies: order.options.copies,
        printType: order.options.printType === 'bw' ? 'Black & White' : 'Color',
        paperSize: order.options.paperSize
      }))
    };
  };

  const value = {
    orders,
    inventory,
    printerStatus,
    notifications: getUserNotifications(),
    createOrder,
    updateOrderStatus,
    updateInventory,
    togglePrinterStatus,
    getUserOrders,
    getOrderById,
    getOrdersByStatus,
    markNotificationAsRead,
    generateReceipt,
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
