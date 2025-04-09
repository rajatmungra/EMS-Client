import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CgSpinner, CgTrash } from "react-icons/cg";
import { FiEdit, FiPlus } from "react-icons/fi";
import { UserContext } from '../../context/authContext';
import { ToastContainer, toast } from 'react-toastify';

const EmployeeManager = () => {
  const [mode, setMode] = useState('create'); // 'create', 'update', or 'delete'
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicKey, setImagePublicKey] = useState(null)
  const {logout} = useContext(UserContext)

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    email: '',
    phone: '',
    password: '',
    role: 'employee',
    manager: '',
    avatar: ''
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        const token = storedUser && JSON.parse(storedUser).token;
        const [deptRes, mgrRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/department/all`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/employee/all`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setDepartments(deptRes.data.departments);
        setManagers(mgrRes.data.employees);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset form when mode changes
  useEffect(() => {
    setError('');
    setSuccess('');
    setPreview(null);
    setImageUrl("");
    setImagePublicKey(null)
  }, [mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if(imagePublicKey !== null){
      deleteImage()
    }
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      const storedUser = localStorage.getItem("user");
      const token = storedUser && JSON.parse(storedUser).token;
      if (!token) {
        logout();
        return;
      }
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/images/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setImageUrl(response.data.url);
        setImagePublicKey(response.data.publicId);
        toast('Image Uploaded Successfully')
      } catch (error) {
        console.error('Upload failed:', error.response?.data || error.message);
        alert(error.message)
      }
    }
  };

  const deleteImage = async ()=>{
    if(imagePublicKey === null){
      return;
    }
    const storedUser = localStorage.getItem("user");
    const token = storedUser && JSON.parse(storedUser).token;
    if (!token) {
      logout();
      return;
    }
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/images/delete`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { publicId: imagePublicKey }
        }
      );
      toast('Previous Image has been deleted');
    } catch (error) {
      toast('Delete failed:', error.message);
    }

  }

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
        logout()
      }

      const payload = {
        ...formData,
        avatar: imageUrl || formData.avatar
      };

      if (mode === 'create') {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/employee/new`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Employee created successfully');
      } 
      else if (mode === 'update') {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/employee/update`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Employee updated successfully');
      }
      else if (mode === 'delete') {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/employee/delete/${formData.email}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Employee deleted successfully');
      }

      // Reset form after successful operation
      if (mode !== 'delete') {
        setFormData({
          name: '',
          department: '',
          email: '',
          phone: '',
          password: '',
          role: 'employee',
          manager: '',
          avatar: ''
        });
        setPreview(null);
        setImageUrl("");
        setImagePublicKey(null)
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${mode} employee`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeData = async (email) => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem("user");
      const token = storedUser && JSON.parse(storedUser).token;
      if(!token){
        alert('Invalid Token')
        logout()
      }
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/${email}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const empData = response.data.employee;
      setFormData({
        id: empData._id,
        name: empData.name,
        department: empData.department?._id || '',
        email: empData.email,
        phone: empData.phone || '',
        password: '', // Not change the password
        role: empData.role,
        manager: empData.manager?._id || '',
        avatar: empData.avatar || ''
      });
      setPreview(empData.avatar || null);
    } catch (err) {
      setError('Failed to load employee data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Employee Management</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setMode('create')}
            className={`px-3 py-1 rounded-md ${mode === 'create' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <FiPlus className="inline mr-1" /> Create
          </button>
          <button
            onClick={() => setMode('update')}
            className={`px-3 py-1 rounded-md ${mode === 'update' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <FiEdit className="inline mr-1" /> Update
          </button>
          <button
            onClick={() => setMode('delete')}
            className={`px-3 py-1 rounded-md ${mode === 'delete' ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <CgTrash className="inline mr-1" /> Delete
          </button>
        </div>
      </div>

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
          <h3 className="font-medium text-red-800 mb-3">Delete Employee</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Enter employee email to delete"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setMode('create')}
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
              Delete Employee
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="border rounded-md p-4">
          <h3 className="font-medium text-gray-800 mb-4">
            {mode === 'create' ? 'Create New Employee' : 'Update Employee'}
          </h3>

          {mode === 'update' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee Email (to update) *
              </label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Enter employee email"
                />
                <button
                  type="button"
                  onClick={() => loadEmployeeData(formData.email)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={loading || !formData.email}
                >
                  Load Data
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-3 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover mb-3 rounded-md"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={mode === 'update'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {mode === 'create' ? '*' : ''}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={mode === 'create'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={true}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="employee">Employee</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manager
              </label>
              <select
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Manager</option>
                {managers.map(mgr => (
                  <option key={mgr._id} value={mgr._id}>{mgr.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  department: '',
                  email: '',
                  phone: '',
                  password: '',
                  role: 'employee',
                  manager: '',
                  avatar: ''
                });
                setPreview(null);
                setImageUrl("");
                setImagePublicKey(null)
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <CgSpinner className="animate-spin mr-2" />
              ) : null}
              {mode === 'create' ? 'Create Employee' : 'Update Employee'}
            </button>
          </div>
        </form>
      )}
      <ToastContainer/>
    </div>
  );
};

export default EmployeeManager;
