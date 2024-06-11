import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        if (username && token) {
          setUser({ username, token });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (username, token) => {
    localStorage.setItem('username', username);
    localStorage.setItem('token', token);
    setUser({ username, token });
  };

  const logout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
