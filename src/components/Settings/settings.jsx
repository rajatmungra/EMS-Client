import { useState } from "react";
import TimeOffTypeManager from "./TimeOffTypeManager";
import LeaveAllocationManager from "./LeaveAllocationManager";
import EmployeeManager from "./EmployeeManager";

const SettingsApp = () => {
  const [activeTab, setActiveTab] = useState('timeOffTypes');
  
  const adminFeatures = [
    {
      id: 'timeOffTypes',
      name: 'Time Off Types',
      icon: '📋',
      description: 'Create and manage time off types',
      component: <TimeOffTypeManager />
    },
    {
      id: 'allocations',
      name: 'Time Off Allocations',
      icon: '🧾',
      description: 'Allocate time off allowances',
      component: <LeaveAllocationManager />
    },
    {
      id: 'employeeManagement',
      name: 'Employee Management',
      icon: '👥',
      description: 'Edit employee roles and permissions',
      component: <EmployeeManager />
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Administration Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Admin Features</h2>
          <nav className="space-y-2">
            {adminFeatures.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-3 ${
                  activeTab === feature.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-xl">{feature.icon}</span>
                <div>
                  <p className="font-medium">{feature.name}</p>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-lg shadow p-6">
          {adminFeatures.find(f => f.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
};

export default SettingsApp;
