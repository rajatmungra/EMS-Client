import { useState, useEffect, useContext } from 'react';
import { FiClock, FiUser, FiCalendar, FiMapPin } from 'react-icons/fi';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import { UserContext } from '../../context/authContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AttendanceList = () => {
  const { getToken, getuser } = useContext(UserContext);
  const currentUser = getuser();
  const isAdmin = currentUser?.user?.role === 'admin';

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const itemsPerPage = 5;

  const WORK_START_HOUR = 10;
  const WORK_END_HOUR = 18;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getToken();

        if (isAdmin) {
          const [attendanceRes, employeesRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/attendance/all`, {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${import.meta.env.VITE_API_URL}/employee/all`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);

          setAllEmployees(employeesRes.data.employees);
          setAttendanceRecords(attendanceRes.data.attendanceRecords);
        } else {
          const employeeId = currentUser.user.id;
          const [attendanceRes, employeeRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/attendance/employee/${employeeId}`, {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${import.meta.env.VITE_API_URL}/employee/id/${employeeId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);
          setAllEmployees([employeeRes.data.employee]);
          setAttendanceRecords(attendanceRes.data.attendanceRecords);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formattedData = isAdmin
    ? allEmployees.map(employee => {
        const record = attendanceRecords.find(record =>
          record.employee === employee._id &&
          new Date(record.checkIn).toISOString().split('T')[0] === date
        );

        let checkInTime, checkOutTime;

        try {
          checkInTime = record?.checkIn ? new Date(record.checkIn) : null;
          checkOutTime = record?.checkOut ? new Date(record.checkOut) : null;
        } catch {
          checkInTime = null;
          checkOutTime = null;
        }

        return {
          id: record?._id || employee._id,
          name: employee.name || 'Unknown Employee',
          department: employee.department?.name || 'N/A',
          date,
          checkIn: checkInTime ? formatTime(checkInTime) : null,
          checkOut: checkOutTime ? formatTime(checkOutTime) : null,
          status: getStatus(checkInTime, checkOutTime),
          location: record?.location
        };
      })
    : attendanceRecords
        .filter(record => {
          try {
            const recordDate = new Date(record.checkIn).toISOString().split('T')[0];
            return recordDate === date;
          } catch {
            return false;
          }
        })
        .map(record => {
          const employee = allEmployees.find(e => e._id === record.employee) || {};
          let checkInTime, checkOutTime;

          try {
            checkInTime = record.checkIn ? new Date(record.checkIn) : null;
            checkOutTime = record.checkOut ? new Date(record.checkOut) : null;
          } catch {
            checkInTime = null;
            checkOutTime = null;
          }

          return {
            id: record._id,
            name: employee.name || 'Unknown Employee',
            department: employee.department?.name || 'N/A',
            date: record.checkIn ? new Date(record.checkIn).toISOString().split('T')[0] : 'N/A',
            checkIn: checkInTime ? formatTime(checkInTime) : null,
            checkOut: checkOutTime ? formatTime(checkOutTime) : null,
            status: getStatus(checkInTime, checkOutTime),
            location: record.location
          };
        });

  const currentItems = formattedData.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const presentCount = formattedData.filter(item => item.status === 'present').length;
  const leftEarlyCount = formattedData.filter(item => item.status === 'left early').length;
  const absentCount = formattedData.filter(item => item.status === 'absent').length;
  const avgHours = calculateAvgHours(formattedData);

  useEffect(() => setPage(0), [date]);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <FiCalendar className="mr-2" />
            {isAdmin ? 'Employee Attendance' : 'My Attendance'}
          </h2>
          <div className="mt-2 flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border p-2 rounded w-full cursor-pointer"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            {isAdmin && (
              <div className="flex items-end">
                <div className="bg-blue-50 p-2 rounded text-sm text-blue-800">
                  Working Hours: 10:00 AM - 6:00 PM IST
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {!isAdmin ? (
              <EmployeeView formattedData={formattedData} />
            ) : (
              <AdminView
                formattedData={formattedData}
                currentItems={currentItems}
                presentCount={presentCount}
                leftEarlyCount={leftEarlyCount}
                absentCount={absentCount}
                avgHours={avgHours}
                page={page}
                itemsPerPage={itemsPerPage}
                setPage={setPage}
              />
            )}
          </>
        )}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

const EmployeeView = ({ formattedData }) => (
  <div className="grid grid-cols-4 gap-4 p-4">
    <SummaryCard
      label="Status"
      value={formattedData[0]?.status ? formattedData[0].status.toUpperCase() : 'No record'}
      color={
        formattedData[0]?.status === 'present'
          ? 'green'
          : formattedData[0]?.status === 'absent'
          ? 'red'
          : 'yellow'
      }
    />
    <SummaryCard label="Check In" value={formattedData[0]?.checkIn || '--:--'} />
    <SummaryCard label="Check Out" value={formattedData[0]?.checkOut || '--:--'} />
    <SummaryCard
      label="Hours"
      value={
        formattedData[0]?.checkIn && formattedData[0]?.checkOut
          ? calculateHours(formattedData[0].checkIn, formattedData[0].checkOut)
          : '--:--'
      }
    />
  </div>
);

const AdminView = ({
  formattedData,
  currentItems,
  presentCount,
  leftEarlyCount,
  absentCount,
  avgHours,
  page,
  itemsPerPage,
  setPage
}) => (
  <>
    <div className="grid grid-cols-5 gap-4 p-4">
      <SummaryCard label="Total Employees" value={formattedData.length} />
      <SummaryCard label="Present" value={presentCount} color="green" />
      <SummaryCard label="Left Early" value={leftEarlyCount} color="yellow" />
      <SummaryCard label="Absent" value={absentCount} color="red" />
      <SummaryCard label="Avg Hours" value={avgHours} color="blue" />
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left text-sm">Employee</th>
            <th className="p-2 text-left text-sm">Department</th>
            <th className="p-2 text-left text-sm">Check In</th>
            <th className="p-2 text-left text-sm">Check Out</th>
            <th className="p-2 text-left text-sm">Status</th>
            <th className="p-2 text-left text-sm">Hours</th>
            <th className="p-2 text-left text-sm">Location</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map(item => (
              <AttendanceRow key={item.id} item={item} />
            ))
          ) : (
            <tr>
              <td colSpan="7" className="p-4 text-center text-gray-500">
                No attendance records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {formattedData.length > itemsPerPage && (
      <div className="p-4 border-t">
        <ReactPaginate
          previousLabel="Previous"
          nextLabel="Next"
          pageCount={Math.ceil(formattedData.length / itemsPerPage)}
          onPageChange={({ selected }) => setPage(selected)}
          containerClassName="flex justify-center gap-2"
          pageClassName="px-3 py-1 border rounded"
          activeClassName="bg-blue-100 text-blue-600"
          previousClassName="px-3 py-1 border rounded"
          nextClassName="px-3 py-1 border rounded"
          forcePage={page}
        />
      </div>
    )}
  </>
);

const AttendanceRow = ({ item }) => (
  <tr className="border-b hover:bg-gray-50">
    <td className="p-2 flex items-center">
      <FiUser className="mr-2 text-gray-500" />
      {item.name}
    </td>
    <td className="p-2">{item.department}</td>
    <td className="p-2">{item.checkIn || '--:--'}</td>
    <td className="p-2">{item.checkOut || '--:--'}</td>
    <td className="p-2"><StatusBadge status={item.status} /></td>
    <td className="p-2">
      {item.checkIn && item.checkOut ? calculateHours(item.checkIn, item.checkOut) : '--:--'}
    </td>
    <td className="p-2">
      <LocationLink location={item.location} />
    </td>
  </tr>
);

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 rounded-full text-xs ${
    status === 'present' ? 'bg-green-100 text-green-800' :
    status === 'absent' ? 'bg-red-100 text-red-800' :
    'bg-yellow-100 text-yellow-800'
  }`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const LocationLink = ({ location }) => (
  location ? (
    <a
      href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline flex items-center"
    >
      <FiMapPin className="mr-1" /> View
    </a>
  ) : 'N/A'
);

const SummaryCard = ({ label, value, color = 'gray' }) => {
  const colors = {
    gray: 'bg-gray-50 text-gray-800',
    green: 'bg-green-50 text-green-800',
    red: 'bg-red-50 text-red-800',
    blue: 'bg-blue-50 text-blue-800',
    yellow: 'bg-yellow-50 text-yellow-800'
  };

  return (
    <div className={`p-3 rounded ${colors[color]}`}>
      <div className="text-sm">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
};

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function calculateHours(checkIn, checkOut) {
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
  return `${Math.floor(totalMinutes / 60)}:${String(totalMinutes % 60).padStart(2, '0')}`;
}

function calculateAvgHours(data) {
  const presentEmployees = data.filter(item => item.checkIn && item.checkOut);
  if (presentEmployees.length === 0) return '0:00';

  const totalMinutes = presentEmployees.reduce((sum, item) => {
    const [h, m] = calculateHours(item.checkIn, item.checkOut).split(':').map(Number);
    return sum + h * 60 + m;
  }, 0);

  const avgMinutes = Math.round(totalMinutes / presentEmployees.length);
  return `${Math.floor(avgMinutes / 60)}:${String(avgMinutes % 60).padStart(2, '0')}`;
}

function getStatus(checkInTime, checkOutTime) {
  if (!checkInTime) return 'absent';
  const WORK_HOURS_REQUIRED = 8;
  if (!checkOutTime) return 'left early';

  const workedMinutes = (checkOutTime - checkInTime) / (1000 * 60);
  const requiredMinutes = WORK_HOURS_REQUIRED * 60;

  return workedMinutes >= requiredMinutes ? 'present' : 'left early';
}

export default AttendanceList;
