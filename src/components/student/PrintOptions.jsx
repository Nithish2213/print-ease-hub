
import React, { useState, useEffect } from 'react';
import { HelpCircle, Calculator } from 'lucide-react';

const PrintOptions = ({ onChange, files }) => {
  const [options, setOptions] = useState({
    copies: 1,
    pageRange: 'all',
    printType: 'bw',
    sided: 'single',
    paperSize: 'A4',
    notes: '',
  });

  const [estimatedCost, setEstimatedCost] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Dummy function to calculate total pages from files
  // In a real app, you would extract page count from PDFs
  useEffect(() => {
    if (files.length > 0) {
      // Simulate page calculation (in reality, you'd use a PDF library)
      const pages = files.reduce((total, file) => {
        // This is just a dummy calculation
        // You'd actually parse the PDF to get real page count
        const estimatedPages = Math.ceil(file.size / (100 * 1024));
        return total + Math.max(1, estimatedPages);
      }, 0);
      
      setTotalPages(pages);
    } else {
      setTotalPages(0);
    }
  }, [files]);

  useEffect(() => {
    calculateCost();
  }, [options, totalPages]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOptions((prev) => {
      const newOptions = { ...prev, [name]: value };
      onChange(newOptions);
      return newOptions;
    });
  };

  const calculateCost = () => {
    if (totalPages === 0) {
      setEstimatedCost(0);
      return;
    }

    let baseRate = options.printType === 'bw' ? 2 : 10; // Rs per page
    let pageMultiplier = 1;
    
    // For page range, assume "all" means all pages
    const pageCount = options.pageRange === 'all' ? totalPages : 
      calculatePagesFromRange(options.pageRange, totalPages);
    
    // Paper size multiplier
    if (options.paperSize === 'A3') {
      pageMultiplier *= 2;
    }
    
    // Single/Double sided
    if (options.sided === 'double') {
      baseRate = baseRate * 0.9; // 10% discount for double-sided
    }
    
    const cost = options.copies * pageCount * baseRate * pageMultiplier;
    setEstimatedCost(cost);
  };

  const calculatePagesFromRange = (range, max) => {
    try {
      if (!range || range === 'all') return max;
      
      let count = 0;
      const parts = range.split(',');
      
      parts.forEach(part => {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(num => parseInt(num.trim()));
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            count += (Math.min(end, max) - start + 1);
          }
        } else {
          const page = parseInt(part.trim());
          if (!isNaN(page) && page <= max) {
            count += 1;
          }
        }
      });
      
      return count;
    } catch (error) {
      console.error("Error calculating page range:", error);
      return max; // Default to all pages on error
    }
  };

  return (
    <div className="space-y-6">
      {/* Number of copies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of copies
        </label>
        <input
          type="number"
          name="copies"
          min="1"
          value={options.copies}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      {/* Page Range */}
      <div>
        <div className="flex items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Page Range
          </label>
          <div className="relative ml-2 group">
            <HelpCircle className="h-4 w-4 text-gray-400" />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 w-48">
              Format: 1-5,8,11-13 or "all" for all pages
            </div>
          </div>
        </div>
        <input
          type="text"
          name="pageRange"
          value={options.pageRange}
          onChange={handleChange}
          placeholder="e.g. 1-5,8,11-13 or 'all'"
          className="form-input"
        />
      </div>

      {/* Print Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Print Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className={`
            flex items-center justify-center p-3 border rounded-md cursor-pointer
            ${options.printType === 'bw' ? 'bg-printhub-100 border-printhub-500' : 'bg-white border-gray-300'}
          `}>
            <input
              type="radio"
              name="printType"
              value="bw"
              checked={options.printType === 'bw'}
              onChange={handleChange}
              className="sr-only"
            />
            <span>Black & White</span>
          </label>
          <label className={`
            flex items-center justify-center p-3 border rounded-md cursor-pointer
            ${options.printType === 'color' ? 'bg-printhub-100 border-printhub-500' : 'bg-white border-gray-300'}
          `}>
            <input
              type="radio"
              name="printType"
              value="color"
              checked={options.printType === 'color'}
              onChange={handleChange}
              className="sr-only"
            />
            <span>Color</span>
          </label>
        </div>
      </div>

      {/* Sided Printing */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sided Printing
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className={`
            flex items-center justify-center p-3 border rounded-md cursor-pointer
            ${options.sided === 'single' ? 'bg-printhub-100 border-printhub-500' : 'bg-white border-gray-300'}
          `}>
            <input
              type="radio"
              name="sided"
              value="single"
              checked={options.sided === 'single'}
              onChange={handleChange}
              className="sr-only"
            />
            <span>Single Sided</span>
          </label>
          <label className={`
            flex items-center justify-center p-3 border rounded-md cursor-pointer
            ${options.sided === 'double' ? 'bg-printhub-100 border-printhub-500' : 'bg-white border-gray-300'}
          `}>
            <input
              type="radio"
              name="sided"
              value="double"
              checked={options.sided === 'double'}
              onChange={handleChange}
              className="sr-only"
            />
            <span>Double Sided</span>
          </label>
        </div>
      </div>

      {/* Paper Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Paper Size
        </label>
        <select
          name="paperSize"
          value={options.paperSize}
          onChange={handleChange}
          className="form-input"
        >
          <option value="A4">A4</option>
          <option value="A3">A3</option>
          <option value="Letter">Letter</option>
          <option value="Legal">Legal</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          name="notes"
          value={options.notes}
          onChange={handleChange}
          placeholder="Any special instructions or requests..."
          rows="3"
          className="form-input"
        />
      </div>

      {/* Estimated Cost */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center mb-2">
          <Calculator className="h-5 w-5 text-printhub-600 mr-2" />
          <h3 className="text-md font-medium text-gray-700">
            Estimated Cost
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>Total Pages:</div>
          <div className="text-right">{totalPages}</div>
          
          <div>Print Type:</div>
          <div className="text-right capitalize">{options.printType === 'bw' ? 'Black & White' : 'Color'}</div>
          
          <div>Paper Size:</div>
          <div className="text-right">{options.paperSize}</div>
          
          <div>Copies:</div>
          <div className="text-right">{options.copies}</div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
          <span className="font-medium text-gray-700">Total:</span>
          <span className="text-lg font-bold text-printhub-700">
            ₹{estimatedCost.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrintOptions;
