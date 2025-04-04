
import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ORDER_STATUS } from '../../context/OrderContext';

const OrderTracker = ({ status }) => {
  const steps = [
    { id: ORDER_STATUS.PENDING, label: 'Pending' },
    { id: ORDER_STATUS.APPROVED, label: 'Approved' },
    { id: ORDER_STATUS.PRINTING, label: 'Printing' },
    { id: ORDER_STATUS.READY, label: 'Ready' },
    { id: ORDER_STATUS.COMPLETED, label: 'Completed' },
  ];

  const getCurrentStepIndex = () => {
    if (status === ORDER_STATUS.REJECTED) return -1; // Rejected
    return steps.findIndex(step => step.id === status);
  };

  const currentStepIndex = getCurrentStepIndex();

  const getStepStatus = (stepIndex) => {
    if (currentStepIndex === -1) return 'inactive'; // Order rejected
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'active';
    return 'inactive';
  };

  const getStepIcon = (stepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle2 className="h-8 w-8 text-status-completed" />;
      case 'active':
        return <Clock className="h-8 w-8 text-status-pending animate-pulse" />;
      case 'inactive':
        return <div className="h-8 w-8 rounded-full border-2 border-gray-300"></div>;
      default:
        return null;
    }
  };

  if (status === ORDER_STATUS.REJECTED) {
    return (
      <div className="py-6">
        <div className="flex flex-col items-center justify-center text-red-500">
          <AlertCircle className="h-12 w-12 mb-2" />
          <h3 className="text-xl font-medium">Order Rejected</h3>
          <p className="text-sm text-gray-500 mt-1">
            Please contact the print shop for more details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(index);
          
          return (
            <React.Fragment key={step.id}>
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center z-10 
                  ${stepStatus === 'active' ? 'scale-110 transition-transform' : ''}
                `}>
                  {getStepIcon(stepStatus)}
                </div>
                <div className={`text-xs mt-2 font-medium text-center
                  ${stepStatus === 'completed' ? 'text-status-completed' : 
                    stepStatus === 'active' ? 'text-status-pending' : 'text-gray-400'}
                `}>
                  {step.label}
                </div>
              </div>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 
                  ${index < currentStepIndex ? 'bg-status-completed' : 'bg-gray-200'}"
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracker;
