import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from "./components/homepage/homepage"
import Navbar from "./components/Navbar/Navbar"
import EmployeeKanban from './components/Employee/EmployeeKanban';
import TimeOffCalendar from './components/Time-off/TimeoffCalendar';
import AttendanceList from './components/Attendance/AttendanceList';
import ComingSoon from './components/Payroll/Payroll';
import AuthForm from './components/Login/AuthForm';
import PrivateRoute from './components/Login/PrivateRoute';
import AuthContext from './context/authContext';
import SettingsApp from './components/Settings/settings';
import ApproveTImeOff from './components/Time-off/ApproveTImeOff';

function App() {

  const RouteWithNavbar = ({ element }) => (
    <>
      <PrivateRoute>
        <Navbar />
        {element}
      </PrivateRoute>
    </>
  );

  return (
    <>
    <Router>
      <AuthContext>
        <Routes>
          <Route path="/" element={<AuthForm/>}/>
          <Route path="/homepage" element={<RouteWithNavbar element={<Homepage/>}/>}/>
          <Route path="/employees" element={<RouteWithNavbar element={<EmployeeKanban/>}/>}/>
          <Route path="/time-off" element={<RouteWithNavbar element={<TimeOffCalendar/>}/>}/>
          <Route path="/attendance" element={<RouteWithNavbar element={<AttendanceList/>}/>}/>
          <Route path="/payroll" element={<RouteWithNavbar element={<ComingSoon/>}/>}/>
          <Route path="/settings" element={<RouteWithNavbar element={<SettingsApp/>}/>}/>
          <Route path="/approve-time-off" element={<RouteWithNavbar element={<ApproveTImeOff/>}/>}/>
        </Routes>
      </AuthContext>
    </Router>
    </>
  )
}

export default App
