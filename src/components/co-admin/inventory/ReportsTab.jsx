
import React from 'react';
import { BarChart3, Send, RefreshCw } from 'lucide-react';
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Separator } from "../../ui/separator";

const ReportsTab = ({ 
  reportData, 
  setReportData, 
  sendReport, 
  loading, 
  lowStockItems 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-printhub-600 mr-2" />
            <h2 className="text-lg font-semibold">Inventory Report</h2>
          </div>
          <button
            onClick={() => {
              setReportData({
                ...reportData,
                itemsToReport: lowStockItems,
                message: "The following items are below threshold levels and need to be restocked."
              });
            }}
            className="text-sm text-printhub-600 hover:text-printhub-700 flex items-center"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Auto-select low stock
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="report-message">Report Message</Label>
            <Textarea 
              id="report-message"
              placeholder="Enter additional information for this inventory report..."
              className="mt-1"
              value={reportData.message}
              onChange={(e) => setReportData({...reportData, message: e.target.value})}
            />
          </div>
          
          <div>
            <Label className="mb-2 block">Selected Items for Report</Label>
            
            {reportData.itemsToReport.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">
                  No items selected. Click + on items you want to include in the report.
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.itemsToReport.map((item) => (
                      <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{item.name}</td>
                        <td className="px-4 py-2 text-sm">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-2 text-sm">{item.threshold} {item.unit}</td>
                        <td className="px-4 py-2 text-sm">
                          {item.quantity < item.threshold ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">
                          <button
                            onClick={() => {
                              setReportData({
                                ...reportData, 
                                itemsToReport: reportData.itemsToReport.filter(i => 
                                  !(i.id === item.id && i.type === item.type)
                                )
                              });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <div className="flex items-center mb-4">
              <input
                id="send-email"
                type="checkbox"
                checked={reportData.sendEmail}
                onChange={() => setReportData({...reportData, sendEmail: !reportData.sendEmail})}
                className="h-4 w-4 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="send-email" className="ml-2 block text-sm font-medium text-gray-700">
                Send email notification to admin
              </label>
            </div>
            
            {reportData.sendEmail && (
              <div className="ml-6">
                <Label htmlFor="notification-email">Admin Email</Label>
                <Input
                  id="notification-email"
                  type="email"
                  value={reportData.notificationEmail}
                  onChange={(e) => setReportData({...reportData, notificationEmail: e.target.value})}
                  className="mt-1"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              onClick={sendReport}
              disabled={loading || reportData.itemsToReport.length === 0}
              className="flex items-center bg-printhub-600 text-white px-4 py-2 rounded hover:bg-printhub-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4 mr-2" />
              {reportData.sendEmail ? "Send Report to Admin" : "Save Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
