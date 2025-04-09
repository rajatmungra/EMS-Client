import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import axios from 'axios'
import { UserContext } from '../../context/authContext';
import { IoIosSearch } from "react-icons/io";
import { CgSpinner } from "react-icons/cg";
import { GrUserManager } from "react-icons/gr";
import { FaPhoneAlt } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { FcDepartment } from "react-icons/fc";


const EmployeeKanban = () => {
  const [Loading, setLoading] = useState(false)
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const {logout} = useContext(UserContext)
  const itemsPerPage = 12;

  const departments = [...new Set(filteredEmployees.map(emp => emp.department?.name))];

  useEffect(() => {
    const fetchEmployees = async () => {
        setLoading(true)
        try {
          const storedUser = localStorage.getItem("user");
          const token = storedUser && JSON.parse(storedUser).token;
          if (!token) {
            logout();
            return;
          }
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/employee/all`,{
            headers: { Authorization: `Bearer ${token}`}
          })
          const employees = response.data.employees
          setAllEmployees(employees)
          setFilteredEmployees(employees)
          setPageCount(Math.ceil(employees.length / itemsPerPage));
        } catch (error) {
          console.log(error)
          navigate('/homepage')
        } finally{
          setLoading(false)
        }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEmployees(allEmployees);
      setCurrentPage(0);
      setPageCount(Math.ceil(allEmployees.length / itemsPerPage));
    } else {
      const filtered = allEmployees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
      setCurrentPage(0);
      setPageCount(Math.ceil(filtered.length / itemsPerPage));
    }
  }, [searchTerm, allEmployees]);

  const getPaginatedEmployees = () => {
    const startIndex = currentPage * itemsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  };

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  return (
    Loading == true ?  <><span className='flex items-center'><CgSpinner className='w-10 h-10'/> Loading...</span></> :
    <div className="bg-white rounded-lg shadow overflow-hidden p-4">
      <div className="px-4 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">All Employees</h2>
          </div>

        <div className="w-full md:w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoIosSearch className="h-5 w-5 text-gray-400"/>
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-2 text-sm text-gray-600">
        {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'} found
      </div>

      {filteredEmployees.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {getPaginatedEmployees().map((employee) => (
              <div
                key={employee._id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={employee.avatar}
                      alt={employee.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-500">{employee.position}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <FcDepartment className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{employee.department?.name || "--:--"}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <MdOutlineEmail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{employee.email}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <FaPhoneAlt className="w-4 h-4 mr-2 text-gray-400"/>
                      <span>{employee.phone}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <GrUserManager className="w-4 h-4 mr-2 text-gray-400"/>
                      <span>{employee.manager?.name || "--:--"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 cursor-pointer">
            <ReactPaginate
              breakLabel="..."
              nextLabel="Next >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              pageCount={pageCount}
              previousLabel="< Previous"
              renderOnZeroPageCount={null}
              containerClassName="flex justify-center space-x-2"
              pageClassName="px-3 py-1 border rounded hover:bg-gray-50"
              pageLinkClassName="text-gray-700"
              activeClassName="bg-blue-500 text-white"
              previousClassName="px-3 py-1 border rounded hover:bg-gray-50"
              nextClassName="px-3 py-1 border rounded hover:bg-gray-50"
              disabledClassName="opacity-50 cursor-not-allowed"
              breakClassName="px-3 py-1"
              forcePage={currentPage}
            />
            <div className="text-center text-sm text-gray-500 mt-2">
              Page {currentPage + 1} of {pageCount}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No employees found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm.trim() ? `No employees match "${searchTerm}"` : 'No employees available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeKanban;
