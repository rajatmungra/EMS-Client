import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CgSpinner } from "react-icons/cg";
import axios from 'axios'

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    department: ''
  });
  const [Loading, setLoading] = useState(true);
  const [base64Image, setBase64Image] = useState("");
  const [preview, setPreview] = useState(null);
  const [departments, setDepartments] = useState([])
  const [managers, setManagers] = useState()

  useEffect(() => {
    if (id && id !== 'new') {
      const fetchEmployee = async () => {
        try {
          const storedUser = localStorage.getItem("user");
          const token = storedUser && JSON.parse(storedUser).token;
          if (!token) {
            logout();
            return;
          }
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/employee/${id}`,{
            headers: { Authorization: `Bearer ${token}`}
          })
          const cur_employee = response.data.employee
          setEmployee({...cur_employee, "department": cur_employee.department?._id});
          setBase64Image(cur_employee.avatar)
          setPreview(cur_employee.avatar)

          const res_dept = await axios.get(`${import.meta.env.VITE_API_URL}/department/all`,{
            headers: { Authorization: `Bearer ${token}`}
          })
          const department = res_dept.data.departments
          setDepartments(department)

          const all_employees = await axios.get(`${import.meta.env.VITE_API_URL}/employee/all`,{
            headers: { Authorization: `Bearer ${token}`}
          })
          setManagers(all_employees.data.employees)
        } catch (error) {
          console.log(error)
        }finally{
          setLoading(false)
        }
      };
      fetchEmployee();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/employees');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      await reader.readAsDataURL(file);
      reader.onloadend = async () => {
        setBase64Image(reader.result);
        setPreview(reader.result);
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const storedUser = localStorage.getItem("user");
        const token = storedUser && JSON.parse(storedUser).token;
        if (!token) {
          logout();
          return;
        }
        const response = await axios.put(`${import.meta.env.VITE_API_URL}/employee/update`,{
            id: id,
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            password: employee.password,
            department: employee.department,
            manager:employee.manager,
            role: 'admin',
            avatar: base64Image,
        },{
          headers: { Authorization: `Bearer ${token}`},
        })
    }
    catch(error){
      alert("Employee update failed")
      console.log(error)
    } finally{
      setLoading(false)
    }
    navigate('/employees');
  };

  return (
    Loading == true ? <><span className='flex items-center'><CgSpinner className='w-10 h-10'/> Loading...</span></> :
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Employee
        </h2>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back to List
        </button>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-4">


              <div>
              <label className="block text-sm font-medium text-gray-700">Profile Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 mb-3 block border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {preview && <img src={preview} alt="Preview" className="w-20 h-20 object-cover mb-3 rounded-md" />}
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={employee.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={employee.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Password *</label>
                <input
                  type="password"
                  name="password"
                  value={employee.password}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={employee.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department </label>
                <select
                  name="department"
                  value={employee.department || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Please select an option --</option>
                  {departments && departments.map( dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Manager *</label>
                <select
                  name="manager"
                  value={employee.manager || ''}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Please select an option --</option>
                  {managers && managers.map( man => (
                    <option key={man._id} value={man._id}>{man.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
