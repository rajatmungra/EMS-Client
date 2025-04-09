import { useState, useCallback, useMemo, useEffect, useContext } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TimeOffRequestModal from './TimeoffRequestModal';
import { UserContext } from '../../context/authContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


const TimeOffCalendar = () => {
  const localizer = momentLocalizer(moment);
  const {getuser} = useContext(UserContext)
  const [events, setEvents] = useState([]);
  const navigate = useNavigate()

  useEffect(()=>{
    const storedUser = localStorage.getItem("user");
    const token = storedUser && JSON.parse(storedUser).token;
    const user_id = storedUser && JSON.parse(storedUser).user.id
    if(!token){
      alert('Invalid Token')
      logout()
    }
    const fetchLeavesData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/leave/employee/${user_id}`,{
          headers: { Authorization: `Bearer ${token}`}
        })

        const formattedLeaves = []
        const leaves = response.data.leaves.map((leave)=>{
          const start = new Date(leave.dateFrom);
          const end = new Date(leave.dateTo);
          const numDays = moment(end).diff(start, 'days') + 1;
          formattedLeaves.push({
            title: `${leave.allocation.name} (${numDays} Days)`,
            start: start,
            end: end,
            status: leave.status,
            employee: leave.employee.name,
            allocation: leave.allocation.name,
            description: leave.description
          })
        })
        setEvents(formattedLeaves)
      } catch (error) {
        alert(error.message)
        console.log(error.message)
      }
    }
    fetchLeavesData()
  }, [])

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Custom event styles based on status
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.status === 'approved' ?  '#d1fae5' : (event.status === 'refused' ? '#FF0000' : '#fef3c7') ,
        borderRadius: '4px',
        borderLeft: `4px solid #f59e0b`,
        color: '#1f2937',
        border: '0 none'
      }
    };
  };

  // Handle slot selection for new time off request
  const handleSelectSlot = useCallback((slotInfo) => {
    setSelectedSlot({
      start: slotInfo.start,
      end: slotInfo.end
    });
    setShowRequestModal(true);
  }, []);

  // Handle event selection to view details
  const handleSelectEvent = useCallback((event) => {
    alert(`Time Off Details:\n
      Employee: ${event.employee}\n
      allocation: ${event.allocation}\n
      Status: ${event.status}\n
      Dates: ${moment(event.start).format('MMM D, YYYY')} - ${moment(event.end).format('MMM D, YYYY')}\n
      Days: ${moment(event.end).diff(event.start, 'days') + 1} days`);
  }, []);

  // Handle new time off request submission
  const handleSubmitRequest = async (formData) => {

    const storedUser = localStorage.getItem("user");
    const token = storedUser && JSON.parse(storedUser).token;
    const user_id = storedUser && JSON.parse(storedUser).user.id
    if(!token){
      alert('Invalid Token')
      logout()
    }

    const newTimeoff = {
      employee: user_id,
      allocation: formData.allocation._id,
      dateFrom: formData.startDate,
      dateTo: formData.endDate,
      status: 'pending',
      description: formData.notes
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/leave/new`,
        { ...newTimeoff },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const numDays = moment(formData.endDate).diff(formData.startDate, 'days') + 1;
      const newEvent = {
        title: `${formData.allocation.name} - (${numDays} Days)`,
        start: formData.startDate,
        end: formData.endDate,
        status: 'pending',
        employee: formData.employee.name,
        allocation: formData.allocation.name,
        description: formData.notes
      };
      setEvents([...events, newEvent]);

    } catch (error) {
      console.log(error)
      toast(error.response.data.message)

    }
    setShowRequestModal(false);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Add navigation handler
  const handleNavigate = (newDate, view) => {
    setCurrentDate(newDate);
  };

  const openApproveTimeoff = () =>{
    navigate('/approve-time-off')
  }

  return (
    <div className="h-screen p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Time Off Calendar</h2>
        <span className='flex'>
          <button
            onClick={() => openApproveTimeoff()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
            Approve Time Off
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 ml-7 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
            Request Time Off
          </button>
          </span>
      </div>

      <div className="bg-white rounded-lg shadow p-4 h-[calc(100%-80px)]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.MONTH}
          view={currentView}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={handleNavigate}
          selectable
          defaultDate={new Date()}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          style={{ height: '100%' }}
          views={{
            month: true,
            week: true,
            day: true
          }}
        />
      </div>

      <TimeOffRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleSubmitRequest}
        selectedSlot={selectedSlot}
      />
      <ToastContainer/>
    </div>
  );
};

export default TimeOffCalendar;
