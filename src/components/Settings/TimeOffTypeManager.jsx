import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CgSpinner, CgTrash } from "react-icons/cg";
import { FiEdit, FiPlus } from "react-icons/fi";
import { UserContext } from '../../context/authContext';

const TimeOffTypeManager = () => {
  const [mode, setMode] = useState('create'); // 'create', 'update', or 'delete'
  const [timeOffTypes, setTimeOffTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    approval_required: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {logout} = useContext(UserContext)

  useEffect(() => {
    const fetchTimeOffTypes = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        const token = storedUser && JSON.parse(storedUser).token;
        if(!token){
          logout()
          alert("invalid Token")
        }
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/leave/type/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTimeOffTypes(response.data.leaveTypes);
      } catch (err) {
        setError('Failed to load time off types');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeOffTypes();
  }, []);

  // Reset form when mode changes
  useEffect(() => {
    setFormData({
      name: selectedType?.name || '',
      approval_required: selectedType?.approval_required ?? true
    });
    setError('');
    setSuccess('');
  }, [mode, selectedType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const storedUser = localStorage.getItem("user");
      const token = storedUser && JSON.parse(storedUser).token;
      if (!token){
        logout()
        alert('Invalid Token')
      }

      if (mode === 'create') {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/leave/type/new`,
          { name: formData.name, approval_required: formData.approval_required },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTimeOffTypes(prev => [...prev, response.data.leaveType]);
        setSuccess('Time off type created successfully');
      } 
      else if (mode === 'update') {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/leave/type/update`,
          {...formData, id: selectedType._id},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTimeOffTypes(prev => prev.map(t =>
          t._id === selectedType._id ? response.data.leaveType : t
        ));
        setSuccess('Time off type updated successfully');
      }
      else if (mode === 'delete') {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/leave/type/delete/${selectedType._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTimeOffTypes(prev => prev.filter(t => t._id !== selectedType._id));
        setSuccess('Time off type deleted successfully');
        setSelectedType(null);
        setMode('create');
      }

      // Reset form after successful operation
      if (mode !== 'delete') {
        setFormData({
          name: '',
          approval_required: true
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${mode} time off type`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Time Off Type Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setMode('create')}
            className={`px-3 py-1 rounded-md ${mode === 'create' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <FiPlus className="inline mr-1" /> Create
          </button>
          <button
            onClick={() => setMode('update')}
            disabled={!selectedType}
            className={`px-3 py-1 rounded-md ${mode === 'update' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'} ${!selectedType ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FiEdit className="inline mr-1" /> Update
          </button>
          <button
            onClick={() => setMode('delete')}
            disabled={!selectedType}
            className={`px-3 py-1 rounded-md ${mode === 'delete' ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'} ${!selectedType ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <CgTrash className="inline mr-1" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Time Off Types List */}
        <div className="md:col-span-1">
          <h3 className="font-medium text-gray-700 mb-2">Available Types</h3>
          <div className="border rounded-md overflow-hidden">
            {loading && !timeOffTypes.length ? (
              <div className="p-4 text-center">
                <CgSpinner className="animate-spin inline-block" /> Loading...
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {timeOffTypes.map(type => (
                  <li 
                    key={type._id}
                    onClick={() => setSelectedType(type)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${selectedType?._id === type._id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="font-medium">{type.name}</div>
                    <div className="text-sm text-gray-500">
                      {type.approval_required ? 'Approval required' : 'No approval needed'}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Form Area */}
        <div className="md:col-span-2">
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
                Are you sure you want to delete <strong>{selectedType?.name}</strong>? 
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
                {mode === 'create' ? 'Create New Time Off Type' : 'Update Time Off Type'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={mode === 'update' && !selectedType}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="approval_required"
                    name="approval_required"
                    checked={formData.approval_required}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    disabled={mode === 'update' && !selectedType}
                  />
                  <label htmlFor="approval_required" className="ml-2 block text-sm text-gray-700">
                    Requires Approval
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType(null);
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
                  disabled={loading || (mode === 'update' && !selectedType)}
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

export default TimeOffTypeManager;
