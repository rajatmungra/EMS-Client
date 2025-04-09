import { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { HiOutlineUserGroup } from "react-icons/hi2";
import { CgProfile } from "react-icons/cg";
import { UserContext } from '../../context/authContext';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';


const Navbar = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showCheckInOutPopup, setShowCheckInOutPopup] = useState(false);
  const usercontext = useContext(UserContext)
  const navigate = useNavigate();

  const profileRef = useRef(null);
  const checkInOutRef = useRef(null);

  useEffect(() => {
    const fetchStatus = async() => {
      try {
        const token = usercontext.getToken()
        const user_id = usercontext.getuser().user.id
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/attendance/status/${user_id}`,{
          headers: { Authorization: `Bearer ${token}` }
        })
        if(response.data.status === 'checked-out'){
          setIsCheckedIn(false)
        }
        else if(response.data.status === 'checked-in'){
          setIsCheckedIn(true)
        }
      } catch (error) {
        console.log(error.message)
      }
    }
    fetchStatus()
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (checkInOutRef.current && !checkInOutRef.current.contains(event.target)) {
        setShowCheckInOutPopup(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleCheckInOut = async () => {
    try {
      const token = usercontext.getToken();
      const user_id = usercontext.getuser().user.id;
      const location = await getCurrentLocation();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/attendance/checkinout`,
        {
          employee: user_id,
          location: location,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success(response.data.message);
      setIsCheckedIn(!isCheckedIn);
      setShowCheckInOutPopup(false);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.error || error.message);
    }
  };

  const handleLogout = () => {
    usercontext.logout()
  }

  return (
    <>
    <nav className="bg-gray-100 shadow-md py-3 px-6 flex items-center justify-between">
      <div className="flex items-center cursor-pointer" onClick={() => navigate("/homepage")} data-tooltip-id="go-to-home" data-tooltip-content="Home">
        <HiOutlineUserGroup   size={28}/>
        <h1 className="text-xl font-bold text-gray-800 pl-2">EMS</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Check In/Out Button */}
        <div className="relative" ref={checkInOutRef}>
          <button
            onClick={() => setShowCheckInOutPopup(!showCheckInOutPopup)}
            className={`w-10 h-10 rounded-full flex items-center justify-center focus:outline-none ${
              isCheckedIn ? 'bg-green-500' : 'bg-red-500'
            }`}
            data-tooltip-id="checkin-tooltip"
            data-tooltip-content={isCheckedIn ? 'Checked In' : 'Checked Out'}
          >
            <span className="text-white text-sm font-medium">
              {isCheckedIn ? 'IN' : 'OUT'}
            </span>
          </button>

          {/* Check In/Out Popup */}
          {showCheckInOutPopup && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
              <button
                onClick={handleCheckInOut}
                className={`w-full px-4 py-2 text-sm font-medium ${
                  isCheckedIn
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-green-600 hover:bg-green-50'
                }`}
              >
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </button>
            </div>
          )}

          <Tooltip id="checkin-tooltip" place="bottom" />
          <Tooltip id="go-to-home" place="bottom"/>
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-2 focus:outline-none cursor-pointer"
            data-tooltip-id="open-profile"
            data-tooltip-content="Profile"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              <CgProfile className="w-10 h-10 text-gray-600"/>
            </div>
          </button>
          <Tooltip id="open-profile" place="bottom"/>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 cursor-pointer">
              {/* <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowProfileDropdown(false)}
              >
                View Profile
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowProfileDropdown(false)}
              >
                Settings
              </a> */}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
    <ToastContainer/>
    </>
  );
};

export default Navbar;
