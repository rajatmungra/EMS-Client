import React, { useContext, useState } from 'react';
import axios from 'axios'
import { UserContext } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });
  const {login} = useContext(UserContext)
  const navigate = useNavigate()

  // Simple email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    try {
        const url = import.meta.env.VITE_API_URL + "/auth/login"
        const response = await axios.post(
             url,
            {
                "email": formData.email,
                "password": formData.password
            }
        )
        await login({
            user: response.data.user,
            token: response.data.token
        })
        navigate('/homepage')
    } catch (error) {
        setError(error.response.data.message || "Something went wrong");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.newPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // To DO handle password change API CALL

    setFormData({
      email: '',
      password: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="max-w-[400px] mx-auto my-8 p-4 border border-gray-300 rounded-lg">
    <div className="flex mb-4">
        <button
        className={`flex-1 py-2 ${activeTab === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black'} border border-gray-300 cursor-pointer`}
        onClick={() => setActiveTab('login')}
        >
        Login
        </button>
        <button
        className={`flex-1 py-2 ${activeTab === 'changePassword' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-black'} border border-gray-300 cursor-pointer`}
        onClick={() => setActiveTab('changePassword')}
        >
        Change Password
        </button>
    </div>

    {error && <div className="text-red-500 mb-4">{error}</div>}

    {activeTab === 'login' ? (
        <form onSubmit={handleLogin}>
        <div className="mb-4">
            <label htmlFor="email" className="block mb-2">Email</label>
            <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
            />
        </div>
        <div className="mb-4">
            <label htmlFor="password" className="block mb-2">Password</label>
            <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
            />
        </div>
        <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white border-none rounded cursor-pointer"
        >
            Login
        </button>
        </form>
    ) : (
        <form onSubmit={handlePasswordChange}>
        <div className="mb-4">
            <label htmlFor="changeEmail" className="block mb-2">Email</label>
            <input
            type="email"
            id="changeEmail"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
            />
        </div>
        <div className="mb-4">
            <label htmlFor="newPassword" className="block mb-2">New Password</label>
            <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
            />
        </div>
        <div className="mb-4">
            <label htmlFor="confirmPassword" className="block mb-2">Confirm Password</label>
            <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
            />
        </div>
        <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white border-none rounded cursor-pointer"
        >
            Change Password
        </button>
        </form>
    )}
    </div>
  );
};

export default AuthForm;
