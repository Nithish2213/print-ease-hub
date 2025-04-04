
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <Link 
        to="/"
        className="px-4 py-2 bg-printhub-600 text-white rounded hover:bg-printhub-700 transition"
      >
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
