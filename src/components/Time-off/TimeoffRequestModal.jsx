import { useState, useEffect } from 'react';
import moment from 'moment';
import axios from 'axios';


import { ImCancelCircle } from "react-icons/im";

const TimeOffRequestModal = ({ isOpen, onClose, onSubmit, selectedSlot }) => {
  const [formData, setFormData] = useState({
    employee: {},
    allocation: null,
    startDate: selectedSlot?.start || new Date(),
    endDate: moment(selectedSlot?.end).subtract(1, 'days') || new Date(),
    notes: ''
  });
  const [leaveAllocation, setLeaveAllocation] = useState([])


  useEffect(()=>{
    const storedUser = localStorage.getItem("user");
    const token = storedUser && JSON.parse(storedUser).token;
    const user_id = storedUser && JSON.parse(storedUser).user.id
    if(!token){
      alert('Invalid Token')
      logout()
    }
    const fetchAllocationOfEmployee = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/leave/allocation/employee/${user_id}`,{
          headers: { Authorization: `Bearer ${token}`}
        })
        const empRes = await axios.get(`${import.meta.env.VITE_API_URL}/employee/id/${user_id}`, {
          headers: { Authorization: `Bearer ${token}`}
        })

        const allAllocation = response.data.leaveAllocations || []
        setLeaveAllocation(allAllocation)
        setFormData(prev=> ({...prev, ["employee"]: empRes.data.employee}))
      } catch (error) {
        alert(error.message)
      }
    }
    fetchAllocationOfEmployee()
  }, [])

  useEffect(() => {
    if (selectedSlot) {
      setFormData(prev => ({
        ...prev,
        startDate: selectedSlot.start,
        endDate: selectedSlot.end
      }));
    }
  }, [selectedSlot]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(prev => ({...prev, allocation: ''}))
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Request Time Off</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
              <ImCancelCircle/>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <input
                  type="text"
                  value={formData.employee?.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="allocation"
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedAlloc = leaveAllocation.find(alloc => alloc._id === selectedId);
                    setFormData(prev => ({...prev, allocation: selectedAlloc}));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value={null}>-- Please select an option --</option>
                  {
                    leaveAllocation && leaveAllocation.map(alloc => {
                      return (
                        <option key={alloc._id} value={alloc._id}>{alloc.name}</option>
                      )
                    })
                  }
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={moment(formData.startDate).format('YYYY-MM-DD')}
                    onChange={(e) => handleDateChange('startDate', new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={moment(formData.endDate).format('YYYY-MM-DD')}
                    onChange={(e) => handleDateChange('endDate', new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TimeOffRequestModal;
