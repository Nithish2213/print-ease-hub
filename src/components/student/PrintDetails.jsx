
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { FileText, Upload, X, Check, Printer, QrCode, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const PrintDetails = () => {
  const navigate = useNavigate();
  const { createOrder, printerStatus } = useOrders();
  const { currentUser } = useAuth();
  
  const [files, setFiles] = useState([]);
  const [options, setOptions] = useState({
    copies: 1,
    pageRange: 'all',
    printType: 'bw',
    sided: 'double',
    paperSize: 'A4',
    notes: '',
  });
  const [step, setStep] = useState(1); // 1: Upload & Details, 2: Payment, 3: Success
  const [paymentMethod, setPaymentMethod] = useState('qr'); // qr, phonepe, paytm, gpay
  const [paymentDetails, setPaymentDetails] = useState({
    name: '',
    phone: '',
    reference: '',
    proofFile: null
  });
  const [proofUploaded, setProofUploaded] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // Convert File objects to our file format with name, size, and pages
    const newFiles = selectedFiles.map(file => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      pages: Math.floor(Math.random() * 20) + 1, // Mock page count
    }));
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentDetailChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProofUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentDetails(prev => ({
        ...prev,
        proofFile: e.target.files[0]
      }));
      setProofUploaded(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (printerStatus !== 'online') {
      toast.error(`Cannot place order. Print server is ${printerStatus}.`);
      return;
    }
    
    if (files.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    setStep(2); // Move to payment step
  };

  const handlePayment = () => {
    // Validate payment details
    if (paymentMethod !== 'qr' && (!paymentDetails.name || !paymentDetails.phone)) {
      toast.error("Please fill in your name and phone number");
      return;
    }
    
    if (paymentMethod === 'qr' && !proofUploaded) {
      toast.error("Please upload payment proof");
      return;
    }
    
    // Calculate total pages for cost estimation
    const totalPages = files.reduce((total, file) => total + file.pages, 0);
    const copiesCount = parseInt(options.copies) || 1;
    const isPricePerPageHigher = options.printType === 'color'; // Color costs more
    
    // Simple cost calculation
    const costPerPage = isPricePerPageHigher ? 5 : 2;
    const totalCost = totalPages * copiesCount * costPerPage;
    
    // Create order in system
    const orderId = createOrder({
      userId: currentUser.id,
      files,
      options,
      paymentMethod,
      paymentDetails: {
        name: paymentDetails.name,
        phone: paymentDetails.phone,
        reference: paymentDetails.reference || 'Direct payment'
      },
      cost: totalCost
    });
    
    // Show success screen
    setStep(3);
  };

  const renderQRPayment = () => (
    <div className="text-center">
      <div className="bg-gray-100 p-6 rounded-lg inline-block mb-4">
        <QrCode className="h-32 w-32 mx-auto text-gray-700" />
        <p className="mt-2 text-sm text-gray-600">Scan to pay ₹{(files.reduce((total, file) => total + file.pages, 0) * options.copies * (options.printType === 'color' ? 5 : 2)).toFixed(2)}</p>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference ID (if any)</label>
        <input
          type="text"
          name="reference"
          value={paymentDetails.reference}
          onChange={handlePaymentDetailChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Optional reference number"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Proof</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <input 
            type="file" 
            onChange={handleProofUpload}
            className="hidden" 
            id="proof-upload"
            accept="image/*"
          />
          <label 
            htmlFor="proof-upload"
            className={`cursor-pointer inline-block px-4 py-2 rounded ${proofUploaded ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {proofUploaded ? 'Proof Uploaded ✓' : 'Select Screenshot'}
          </label>
        </div>
      </div>
    </div>
  );

  const renderUPIPayment = () => (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
        <input
          type="text"
          name="name"
          value={paymentDetails.name}
          onChange={handlePaymentDetailChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Enter your full name"
          required
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={paymentDetails.phone}
          onChange={handlePaymentDetailChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Enter phone number linked to UPI"
          required
        />
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg mb-6 text-center">
        <p className="text-gray-600 mb-3">Click the pay button below to be redirected to the payment app</p>
        <div className="flex justify-center space-x-4">
          {paymentMethod === 'phonepe' && (
            <div className="p-3 bg-purple-100 rounded-lg">
              <Smartphone className="h-8 w-8 text-purple-600 mx-auto" />
              <p className="text-xs font-medium text-purple-800 mt-1">PhonePe</p>
            </div>
          )}
          {paymentMethod === 'paytm' && (
            <div className="p-3 bg-blue-100 rounded-lg">
              <Smartphone className="h-8 w-8 text-blue-600 mx-auto" />
              <p className="text-xs font-medium text-blue-800 mt-1">Paytm</p>
            </div>
          )}
          {paymentMethod === 'gpay' && (
            <div className="p-3 bg-green-100 rounded-lg">
              <Smartphone className="h-8 w-8 text-green-600 mx-auto" />
              <p className="text-xs font-medium text-green-800 mt-1">Google Pay</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Upload Files</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-600">Drag and drop files here, or click to browse</p>
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  className="hidden" 
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="btn-primary cursor-pointer inline-block"
                >
                  Select Files
                </label>
              </div>
              
              {files.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-printhub-500 mr-2" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({file.size}, {file.pages} {file.pages === 1 ? 'page' : 'pages'})</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFile(index)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Print Options</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Copies</label>
                  <input
                    type="number"
                    name="copies"
                    min="1"
                    value={options.copies}
                    onChange={handleOptionChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
                  <input
                    type="text"
                    name="pageRange"
                    placeholder="e.g., 1-5, 8, 11-13 or 'all'"
                    value={options.pageRange}
                    onChange={handleOptionChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Print Type</label>
                  <select
                    name="printType"
                    value={options.printType}
                    onChange={handleOptionChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="bw">Black & White</option>
                    <option value="color">Color</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sided</label>
                  <select
                    name="sided"
                    value={options.sided}
                    onChange={handleOptionChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="single">Single-sided</option>
                    <option value="double">Double-sided</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paper Size</label>
                  <select
                    name="paperSize"
                    value={options.paperSize}
                    onChange={handleOptionChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  name="notes"
                  placeholder="Any special instructions..."
                  value={options.notes}
                  onChange={handleOptionChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={files.length === 0 || printerStatus !== 'online'}
              >
                Continue to Payment
              </button>
            </div>
          </form>
        );
        
      case 2:
        return (
          <div>
            <h3 className="text-lg font-medium mb-4">Payment Details</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="text-sm font-medium mb-2">Order Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Files:</div>
                <div>{files.length} file(s)</div>
                
                <div className="text-gray-500">Copies:</div>
                <div>{options.copies}</div>
                
                <div className="text-gray-500">Print type:</div>
                <div className="capitalize">{options.printType === 'bw' ? 'Black & White' : 'Color'}</div>
                
                <div className="text-gray-500">Pages:</div>
                <div>{files.reduce((total, file) => total + file.pages, 0) * options.copies}</div>
              </div>
              
              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-printhub-700">
                  ₹{(files.reduce((total, file) => total + file.pages, 0) * options.copies * (options.printType === 'color' ? 5 : 2)).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">Payment Method</h4>
              <div className="grid grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr')}
                  className={`p-3 flex flex-col items-center rounded-lg border ${paymentMethod === 'qr' ? 'border-printhub-500 bg-printhub-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                >
                  <QrCode className={`h-6 w-6 mb-1 ${paymentMethod === 'qr' ? 'text-printhub-500' : 'text-gray-500'}`} />
                  <span className="text-xs">QR Code</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('phonepe')}
                  className={`p-3 flex flex-col items-center rounded-lg border ${paymentMethod === 'phonepe' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                >
                  <Smartphone className={`h-6 w-6 mb-1 ${paymentMethod === 'phonepe' ? 'text-purple-500' : 'text-gray-500'}`} />
                  <span className="text-xs">PhonePe</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paytm')}
                  className={`p-3 flex flex-col items-center rounded-lg border ${paymentMethod === 'paytm' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                >
                  <Smartphone className={`h-6 w-6 mb-1 ${paymentMethod === 'paytm' ? 'text-blue-500' : 'text-gray-500'}`} />
                  <span className="text-xs">Paytm</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gpay')}
                  className={`p-3 flex flex-col items-center rounded-lg border ${paymentMethod === 'gpay' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                >
                  <Smartphone className={`h-6 w-6 mb-1 ${paymentMethod === 'gpay' ? 'text-green-500' : 'text-gray-500'}`} />
                  <span className="text-xs">Google Pay</span>
                </button>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              {paymentMethod === 'qr' ? renderQRPayment() : renderUPIPayment()}
            </div>
            
            <div className="flex justify-between">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setStep(1)}
              >
                Back to Details
              </button>
              <button 
                type="button" 
                className="btn-primary"
                onClick={handlePayment}
              >
                Pay Now
              </button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-4 mb-4">
              <Check className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-6">Your order has been placed and is now being processed.</p>
            
            <div className="flex flex-col space-y-4 items-center">
              <button 
                type="button" 
                className="btn-primary"
                onClick={() => navigate('/dashboard/tracking')}
              >
                Track Your Order
              </button>
              <button 
                type="button" 
                className="btn-ghost"
                onClick={() => navigate('/dashboard')}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
      <div className="flex items-center mb-6">
        <div className="rounded-full bg-printhub-100 p-3">
          <Printer className="h-6 w-6 text-printhub-600" />
        </div>
        <h2 className="ml-4 text-xl font-semibold">New Print Order</h2>
      </div>
      
      {renderStep()}
    </div>
  );
};

export default PrintDetails;
