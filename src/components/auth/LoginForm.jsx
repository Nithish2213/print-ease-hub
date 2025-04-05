
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, UserPlus, Lock, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const LoginForm = () => {
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('login'); // login, signup, forgot
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (view === 'login') {
        // Login logic
        setTimeout(() => {
          const success = login(email, password);
          
          if (success) {
            navigate('/dashboard');
          } else {
            setError('Invalid email or password');
          }
          setIsLoading(false);
        }, 1000);
      } else if (view === 'signup') {
        // Signup logic - this is demo only
        setTimeout(() => {
          if (password !== confirmPassword) {
            setError('Passwords do not match');
          } else {
            toast.success('Account created successfully! Please login.');
            setView('login');
          }
          setIsLoading(false);
        }, 1000);
      } else if (view === 'forgot') {
        // Forgot password logic - this is demo only
        setTimeout(() => {
          toast.success('Password reset link sent to your email');
          setView('login');
          setIsLoading(false);
        }, 1000);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderLoginForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <button 
            type="button" 
            className="text-xs text-printhub-600 hover:text-printhub-800 font-medium"
            onClick={() => setView('forgot')}
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="form-input pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 px-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </form>
  );

  const renderSignupForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          placeholder="John Doe"
          className="form-input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signupEmail">
          Email
        </label>
        <input
          id="signupEmail"
          type="email"
          placeholder="you@example.com"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signupPassword">
          Password
        </label>
        <div className="relative">
          <input
            id="signupPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="form-input pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 px-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          className="form-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </div>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="resetEmail">
          Email
        </label>
        <input
          id="resetEmail"
          type="email"
          placeholder="you@example.com"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {isLoading ? 'Sending...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="w-full max-w-md">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-printhub-700">PrintHub</h2>
          <p className="text-gray-600 mt-2">
            {view === 'login' && "Sign in to your account"}
            {view === 'signup' && "Create a new account"}
            {view === 'forgot' && "Reset your password"}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        
        {view === 'login' && renderLoginForm()}
        {view === 'signup' && renderSignupForm()}
        {view === 'forgot' && renderForgotPasswordForm()}
        
        <div className="mt-6 text-center">
          {view === 'login' && (
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button 
                onClick={() => setView('signup')}
                className="text-printhub-600 hover:text-printhub-800 font-medium"
              >
                Sign up
              </button>
            </p>
          )}
          
          {(view === 'signup' || view === 'forgot') && (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button 
                onClick={() => setView('login')}
                className="text-printhub-600 hover:text-printhub-800 font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-center text-gray-600">
            Demo accounts:
          </p>
          <div className="mt-2 text-xs text-center space-y-1 text-gray-500">
            <p>Admin: admin@printhub.com / admin123</p>
            <p>Employee: employee@printhub.com / employee123</p>
            <p>Student: student@printhub.com / student123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
