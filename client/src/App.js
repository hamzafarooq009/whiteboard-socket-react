import React, { useState } from 'react';
import LoginComponent from '../src/component/LoginComponent';
import RegistrationComponent from '../src/component/RegistrationComponent';
// Import other components

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleRegisterSuccess = () => {
    console.log('Registration successful');
    // Redirect the user or update the app state
  };

  return (
    <div>
      {!isLoggedIn ? (
        <>
          <LoginComponent onLogin={setIsLoggedIn} />
          <RegistrationComponent onRegister={handleRegisterSuccess} />
        </>
      ) : (
        // Render your main application if logged in
        <h1>Hello world</h1>
      )}
    </div>
  );
}

export default App;