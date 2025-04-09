import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CgSpinner, CgTrash } from "react-icons/cg";
import { FiEdit, FiPlus } from "react-icons/fi";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { UserContext } from '../../context/authContext';

const LeaveAllocationManager = () => {
  const [mode, setMode] = useState('create');
  const [allocations, setAllocations] = useState([]);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {logout} = useContext(UserContext);

  const [formData, setFormData] = useState({
    name: '',
    employee: '',
    leaveType: '',
    dateFrom: new Date(),
    dateTo: new Date(),
    totalDays: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        const token = storedUser && JSON.parse(storedUser).token;
        if(!token){
          alert('Invalid Token')
          logout();
        }
        const [allocRes, empRes, typeRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/leave/allocation/all`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/employee/all`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/leave/type/all`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setAllocations(allocRes.data.leaveAllocations);
        setEmployees(empRes.data.employees);
        setLeaveTypes(typeRes.data.leaveTypes);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset form when mode or selection changes
  useEffect(() => {
    if (selectedAllocation) {
      setFormData({
        name: selectedAllocation.name,
        employee: selectedAllocation.employee._id,
        leaveType: selectedAllocation.leaveType._id,
        dateFrom: new Date(selectedAllocation.dateFrom),
        dateTo: new Date(selectedAllocation.dateTo),
        totalDays: selectedAllocation.totalDays
      });
    } else {
      setFormData({
        name: '',
        employee: '',
        leaveType: '',
        dateFrom: new Date(),
        dateTo: new Date(),
        totalDays: 0
      });
    }
    setError('');
    setSuccess('');
  }, [mode, selectedAllocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const storedUser = localStorage.getItem("user");
      const token = storedUser && JSON.parse(storedUser).token;
      if(!token){
        alert('Invalid Token')
        logout();
      }

      const payload = {
        ...formData,
        dateFrom: formData.dateFrom.toISOString(),
        dateTo: formData.dateTo.toISOString(),
        totalDays: Number(formData.totalDays) // Ensure it's a number
      };

      if (mode === 'create') {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/leave/allocation/new`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAllocations(prev => [...prev, response.data.leaveAllocation]);
        setSuccess('Leave allocation created successfully');
      } 
      else if (mode === 'update') {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/leave/allocation/update`,
          {...payload, id: selectedAllocation._id},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAllocations(prev => prev.map(a =>
          a._id === selectedAllocation._id ? response.data.leaveAllocation : a
        ));
        setSuccess('Leave allocation updated successfully');
      }
      else if (mode === 'delete') {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/leave/allocation/delete/${selectedAllocation._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAllocations(prev => prev.filter(a => a._id !== selectedAllocation._id));
        setSuccess('Leave allocation deleted successfully');
        setSelectedAllocation(null);
        setMode('create');
      }

      // Reset form after successful operation
      if (mode !== 'delete') {
        setFormData({
          name: '',
          employee: '',
          leaveType: '',
          dateFrom: new Date(),
          dateTo: new Date(),
          totalDays: 0
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${mode} leave allocation`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Leave Allocation Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => { setMode('create'); setSelectedAllocation(null); }}
            className={`px-3 py-1 rounded-md ${mode === 'create' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <FiPlus className="inline mr-1" /> Create
          </button>
          <button
            onClick={() => setMode('update')}
            disabled={!selectedAllocation}
            className={`px-3 py-1 rounded-md ${mode === 'update' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'} ${!selectedAllocation ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FiEdit className="inline mr-1" /> Update
          </button>
          <button
            onClick={() => setMode('delete')}
            disabled={!selectedAllocation}
            className={`px-3 py-1 rounded-md ${mode === 'delete' ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'} ${!selectedAllocation ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <CgTrash className="inline mr-1" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Allocations List - Updated to show totalDays */}
        <div className="lg:col-span-1">
          <h3 className="font-medium text-gray-700 mb-2">Existing Allocations</h3>
          <div className="border rounded-md overflow-hidden max-h-[500px] overflow-y-auto">
            {loading && !allocations.length ? (
              <div className="p-4 text-center">
                <CgSpinner className="animate-spin inline-block" /> Loading...
              </div>
            ) : allocations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No allocations found</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {allocations.map(allocation => (
                  <li 
                    key={allocation._id}
                    onClick={() => {setSelectedAllocation(allocation); setMode('update');}}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedAllocation?._id === allocation._id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="font-medium">{allocation.name}</div>
                    <div className="text-sm text-gray-500">
                      {allocation.employee?.name} - {allocation.leaveType?.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(allocation.dateFrom).toLocaleDateString()} to {new Date(allocation.dateTo).toLocaleDateString()}
                    </div>
                    <div className="text-xs mt-1">
                      <span className="font-medium">Allocated Days:</span> {allocation.totalDays}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Form Area - Added totalDays input */}
        <div className="lg:col-span-3">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {success}
            </div>
          )}

          {mode === 'delete' ? (
            <div className="p-4 border rounded-md bg-red-50">
              <h3 className="font-medium text-red-800 mb-3">Confirm Deletion</h3>
              <p className="mb-4">
                Are you sure you want to delete the allocation for <strong>{selectedAllocation?.employee?.name}</strong> ({selectedAllocation?.leaveType?.name})?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setMode('update')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <CgSpinner className="animate-spin mr-2" />
                  ) : (
                    <CgTrash className="mr-2" />
                  )}
                  Delete Permanently
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="border rounded-md p-4">
              <h3 className="font-medium text-gray-800 mb-4">
                {mode === 'create' ? 'Create New Leave Allocation' : 'Update Leave Allocation'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allocation Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={mode === 'update' && !selectedAllocation}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee *
                  </label>
                  <select
                    name="employee"
                    value={formData.employee}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={mode === 'update' && !selectedAllocation}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Type *
                  </label>
                  <select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={mode === 'update' && !selectedAllocation}
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map(type => (
                      <option key={type._id} value={type._id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date From *
                  </label>
                  <DatePicker
                    selected={formData.dateFrom}
                    onChange={(date) => handleDateChange('dateFrom', date)}
                    selectsStart
                    startDate={formData.dateFrom}
                    endDate={formData.dateTo}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={mode === 'update' && !selectedAllocation}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date To *
                  </label>
                  <DatePicker
                    selected={formData.dateTo}
                    onChange={(date) => handleDateChange('dateTo', date)}
                    selectsEnd
                    startDate={formData.dateFrom}
                    endDate={formData.dateTo}
                    minDate={formData.dateFrom}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={mode === 'update' && !selectedAllocation}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Days to Allocate *
                  </label>
                  <input
                    type="number"
                    name="totalDays"
                    value={formData.totalDays}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={mode === 'update' && !selectedAllocation}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAllocation(null);
                    if (mode === 'update') setMode('create');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  disabled={loading}
                >
                  {mode === 'create' ? 'Reset' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  disabled={loading || (mode === 'update' && !selectedAllocation)}
                >
                  {loading && <CgSpinner className="animate-spin mr-2" />}
                  {mode === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveAllocationManager;
