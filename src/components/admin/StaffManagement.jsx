
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  UserCog,
  CalendarDays,
  X,
  Check,
  AlertTriangle,
  Clock,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

const StaffManagement = () => {
  const [staff, setStaff] = useState([
    { 
      id: 1, 
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '555-1234',
      role: 'Co-Admin',
      joiningDate: '2023-06-15',
      status: 'active',
      shifts: ['Morning', 'Evening'],
      avatar: '/placeholder.svg'
    },
    { 
      id: 2, 
      name: 'Mark Johnson',
      email: 'mark.johnson@example.com',
      phone: '555-2345',
      role: 'Co-Admin',
      joiningDate: '2023-08-22',
      status: 'active',
      shifts: ['Evening'],
      avatar: '/placeholder.svg'
    },
    { 
      id: 3, 
      name: 'Sarah Lee',
      email: 'sarah.lee@example.com',
      phone: '555-3456',
      role: 'Co-Admin',
      joiningDate: '2023-10-05',
      status: 'inactive',
      shifts: ['Morning'],
      avatar: '/placeholder.svg'
    }
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaffMember, setNewStaffMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Co-Admin',
    shifts: [],
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaffMember(prev => ({ ...prev, [name]: value }));
  };
  
  const handleShiftToggle = (shift) => {
    setNewStaffMember(prev => {
      const shifts = [...prev.shifts];
      if (shifts.includes(shift)) {
        return { ...prev, shifts: shifts.filter(s => s !== shift) };
      } else {
        return { ...prev, shifts: [...shifts, shift] };
      }
    });
  };
  
  const addStaffMember = () => {
    if (!newStaffMember.name || !newStaffMember.email) {
      toast.error('Name and email are required');
      return;
    }
    
    const newMember = {
      id: staff.length + 1,
      ...newStaffMember,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'active',
      avatar: '/placeholder.svg'
    };
    
    setStaff(prev => [...prev, newMember]);
    setShowAddModal(false);
    setNewStaffMember({
      name: '',
      email: '',
      phone: '',
      role: 'Co-Admin',
      shifts: [],
    });
    
    toast.success(`${newMember.name} has been added to staff`);
  };
  
  const toggleStaffStatus = (id) => {
    setStaff(prev => prev.map(member => 
      member.id === id 
        ? { ...member, status: member.status === 'active' ? 'inactive' : 'active' } 
        : member
    ));
    
    const member = staff.find(m => m.id === id);
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    toast.success(`${member.name}'s status changed to ${newStatus}`);
  };
  
  const filteredStaff = searchTerm 
    ? staff.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : staff;
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <p className="text-gray-600">Manage your print shop staff members</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <Users className="h-6 w-6 text-printhub-600 mr-2" />
              <h2 className="text-xl font-semibold">Staff Members</h2>
            </div>
            
            <div className="flex w-full sm:w-auto space-x-2">
              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-printhub-300"
                />
              </div>
              
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center whitespace-nowrap"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shifts
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStaff.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-xs text-gray-500">
                            <div className="flex items-center">
                              <CalendarDays className="h-3 w-3 mr-1" />
                              Joined {new Date(member.joiningDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center mb-1">
                          <Mail className="h-3 w-3 mr-1" /> 
                          {member.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" /> 
                          {member.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {member.shifts.map((shift, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                          >
                            {shift}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        member.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => toggleStaffStatus(member.id)}
                        className={`mr-2 px-2 py-1 rounded ${
                          member.status === 'active' 
                            ? 'text-red-700 hover:bg-red-100' 
                            : 'text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {member.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="px-2 py-1 text-blue-700 hover:bg-blue-100 rounded">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredStaff.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <h3 className="text-lg font-medium text-gray-700">No Staff Members Found</h3>
              <p className="text-gray-500">Try a different search term or add a new staff member</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Staff Schedule Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Clock className="h-6 w-6 text-printhub-600 mr-2" />
            <h2 className="text-xl font-semibold">Staff Schedule</h2>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-sm font-medium mb-2">Today's Shifts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Morning Shift</h4>
                  <span className="text-xs text-gray-500">8:00 AM - 2:00 PM</span>
                </div>
                <div className="space-y-2">
                  {staff
                    .filter(member => member.status === 'active' && member.shifts.includes('Morning'))
                    .map(member => (
                      <div key={member.id} className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
                          <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                        </div>
                        <span className="text-sm">{member.name}</span>
                      </div>
                    ))
                  }
                  {staff.filter(member => member.status === 'active' && member.shifts.includes('Morning')).length === 0 && (
                    <div className="text-sm text-gray-500">No staff assigned</div>
                  )}
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Evening Shift</h4>
                  <span className="text-xs text-gray-500">2:00 PM - 8:00 PM</span>
                </div>
                <div className="space-y-2">
                  {staff
                    .filter(member => member.status === 'active' && member.shifts.includes('Evening'))
                    .map(member => (
                      <div key={member.id} className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
                          <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                        </div>
                        <span className="text-sm">{member.name}</span>
                      </div>
                    ))
                  }
                  {staff.filter(member => member.status === 'active' && member.shifts.includes('Evening')).length === 0 && (
                    <div className="text-sm text-gray-500">No staff assigned</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="btn-secondary">
              View Full Schedule
            </button>
          </div>
        </div>
      </div>
      
      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Staff Member</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newStaffMember.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newStaffMember.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={newStaffMember.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={newStaffMember.role}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="Co-Admin">Co-Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shifts</label>
                <div className="flex space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newStaffMember.shifts.includes('Morning')}
                      onChange={() => handleShiftToggle('Morning')}
                      className="mr-2"
                    />
                    Morning
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newStaffMember.shifts.includes('Evening')}
                      onChange={() => handleShiftToggle('Evening')}
                      className="mr-2"
                    />
                    Evening
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addStaffMember}
                className="px-4 py-2 bg-printhub-600 text-white rounded-md hover:bg-printhub-700"
              >
                Add Staff Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
