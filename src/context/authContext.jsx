import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = storedUser && JSON.parse(storedUser).token;

        if (!token) {
          logout();
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        response.data.success ? setUser(response.data.user) : logout();
        navigate(response.data.success ? "/homepage" : "/");
      } catch {
        logout();
        alert("You have been logged out! Your session has been expired. Please Login again")
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = (user) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  const getuser = () =>{
    const storedUser = localStorage.getItem("user");
    const user = storedUser && JSON.parse(storedUser);
    if (!user) {
      logout();
      return;
    }
    return user
  }

  const getToken = ()=>{
    const storedUser = localStorage.getItem("user");
    const token = storedUser && JSON.parse(storedUser).token;
    if(!token){
      alert('Invalid Token')
      logout()
      return
    }
    return token
  }

  return loading ? null : (
    <UserContext.Provider value={{ user, login, logout, getuser, getToken }}>
      {children}
    </UserContext.Provider>
  );
};

export default AuthContext;
