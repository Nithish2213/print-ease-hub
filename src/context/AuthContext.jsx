
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'admin',
  CO_ADMIN: 'co-admin',
  STUDENT: 'student',
};

// Demo users
const USERS = [
  { id: 1, email: 'admin@printhub.com', password: 'admin123', name: 'Admin User', role: ROLES.ADMIN },
  { id: 2, email: 'employee@printhub.com', password: 'employee123', name: 'Shop Employee', role: ROLES.CO_ADMIN },
  { id: 3, email: 'student@printhub.com', password: 'student123', name: 'John Student', role: ROLES.STUDENT },
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(USERS);

  useEffect(() => {
    // Check for saved user in localStorage on app load
    const savedUser = localStorage.getItem('printHubUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const user = users.find(
      (user) => user.email === email && user.password === password
    );

    if (user) {
      const userData = { ...user };
      delete userData.password; // Don't store password in state
      
      // Save to localStorage and state
      localStorage.setItem('printHubUser', JSON.stringify(userData));
      setCurrentUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      return true;
    } else {
      toast.error('Invalid email or password');
      return false;
    }
  };

  const signup = (name, email, password) => {
    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      toast.error('Email already in use');
      return false;
    }
    
    // Create new user with student role
    const newUser = {
      id: users.length + 1,
      email,
      password,
      name,
      role: ROLES.STUDENT
    };
    
    // Add to users array
    setUsers([...users, newUser]);
    
    toast.success('Account created successfully!');
    return true;
  };

  const logout = () => {
    localStorage.removeItem('printHubUser');
    setCurrentUser(null);
    toast.info('You have been logged out');
  };

  const resetPassword = (email) => {
    const user = users.find(user => user.email === email);
    if (!user) {
      toast.error('No account found with this email');
      return false;
    }
    
    toast.success('Password reset instructions sent to your email');
    return true;
  };

  const value = {
    currentUser,
    login,
    logout,
    signup,
    resetPassword,
    isAdmin: currentUser?.role === ROLES.ADMIN,
    isCoAdmin: currentUser?.role === ROLES.CO_ADMIN,
    isStudent: currentUser?.role === ROLES.STUDENT,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
