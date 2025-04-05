
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import { Printer, Upload, Clock, CheckCircle2 } from 'lucide-react';

const Index = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleGetStarted = () => {
    navigate('/');
    // Scroll to login form
    const loginForm = document.querySelector('#login-section');
    if (loginForm) {
      loginForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: Upload,
      title: 'Easy File Upload',
      description: 'Upload multiple PDF or DOC files in one go.'
    },
    {
      icon: Printer,
      title: 'Print Customization',
      description: 'Choose paper size, color/B&W, single/double sided.'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Track your order status from submission to completion.'
    },
    {
      icon: CheckCircle2,
      title: 'Secure Pickup',
      description: 'Get an OTP for secure order collection.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-printhub-700">PrintHub</h1>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between py-12">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Print documents<br />without the wait
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Upload your files, customize your print options,<br /> 
              and skip the Xerox shop queue.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button className="btn-primary px-6 py-3">
                Learn More
              </button>
              <button className="btn-secondary px-6 py-3">
                Contact Us
              </button>
            </div>
          </div>
          <div id="login-section" className="md:w-1/2">
            <LoginForm />
          </div>
        </div>

        {/* Features */}
        <div className="py-12">
          <h2 className="text-3xl font-bold text-center mb-12">How PrintHub Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm card-hover">
                <div className="bg-printhub-100 p-3 rounded-full inline-flex mb-4">
                  <feature.icon className="h-6 w-6 text-printhub-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-printhub-700 text-white rounded-xl p-8 my-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold mb-2">Ready to start printing?</h3>
              <p className="text-printhub-100">Sign in and upload your documents now.</p>
            </div>
            <button 
              onClick={handleGetStarted} 
              className="bg-white text-printhub-700 px-6 py-3 rounded-md font-medium hover:bg-printhub-50 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-printhub-700">PrintHub</h2>
              <p className="text-gray-500 mt-1">© 2025 PrintHub. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-printhub-600">Terms</a>
              <a href="#" className="text-gray-500 hover:text-printhub-600">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-printhub-600">Contact</a>
              <a href="#" className="text-gray-500 hover:text-printhub-600">Help</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
