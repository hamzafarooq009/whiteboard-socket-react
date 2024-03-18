import React, { useState } from 'react';

function RegistrationComponent({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');  // State to store error messages

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous error messages
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      onRegister(true); // Update parent component's state or redirect to login
    } else {
      const errorText = await response.text();  // Get the error message from the response
      setErrorMessage(errorText || 'Registration failed. Please try again.'); // Set the error message
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Register</button>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>} {/* Display the error message */}
    </form>
  );
}

export default RegistrationComponent;