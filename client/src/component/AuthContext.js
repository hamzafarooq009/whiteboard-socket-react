import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);

    const fetchCurrentUser = async () => {
      if (isLoggedIn) {
        try {
          const response = await fetch('http://localhost:3000/current-user', {
            credentials: 'include', // Necessary for sessions/cookies to work
          });

          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData);
          } else {
            console.error('Failed to fetch user data');
            setIsLoggedIn(false);
            localStorage.setItem('isLoggedIn', false);
          }
        } catch (error) {
          console.error('Error fetching current user', error);
          setIsLoggedIn(false);
          localStorage.setItem('isLoggedIn', false);
        }
      } else {
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, [isLoggedIn]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
