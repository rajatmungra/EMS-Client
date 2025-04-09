import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { UserContext } from '../../context/authContext';

const Homepage = () => {
  const navigate = useNavigate();
  const {getuser} = useContext(UserContext)
  const role = getuser().user.role

  const apps = [
    { id: 1, name: 'Employee', icon: '👨‍💼', description: 'Employee records and management', onClick: () => navigate('/employees'), adminOnly: false },
    { id: 2, name: 'Time off', icon: '🏖️', description: 'Request and manage time off', onClick: () => navigate('/time-off'), adminOnly: false },
    { id: 3, name: 'Attendance', icon: '🕒', description: 'Track employee attendance', onClick: () => navigate('/attendance'), adminOnly: false },
    { id: 4, name: 'Payroll', icon: '💰', description: 'Salary and payment processing', onClick: () => navigate('/payroll'), adminOnly: false },
    { id: 5, name: 'Settings', icon: '⚙️', description: 'Administration and configuration', onClick: () => navigate('/settings'), adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Applications</h1>
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-8">
          {apps.filter((app)=> app.adminOnly == false || (app.adminOnly=== true && role=='admin')).map((app) => (
            <div
              key={app.id}
              onClick={app.onClick}
              className="relative flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all hover:bg-gray-200 group"
              data-tooltip-id={app.id+"description"}
              data-tooltip-content={app.description}
            >
              <span className="text-4xl mb-2">{app.icon}</span>
              <span className="font-medium text-gray-700">{app.name}</span>
              <Tooltip id={app.id+"description"} place='bottom'/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
