import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardComponent from './DashboardComponent';
import { AuthContext } from '../AuthContext'; // Adjust the path as needed

// Mocking useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mocking fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]), // Initially, assume no whiteboards are present
  })
);

describe('DashboardComponent', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders without crashing', () => {
    const { getByText } = render(
      <AuthContext.Provider value={{ isLoggedIn: true, currentUser: { username: 'testUser' } }}>
        <DashboardComponent />
      </AuthContext.Provider>
    );

    expect(getByText('Dashboard')).toBeInTheDocument();
  });

  it('loads whiteboards on component mount', async () => {
    render(
      <AuthContext.Provider value={{ isLoggedIn: true, currentUser: { username: 'testUser' } }}>
        <DashboardComponent />
      </AuthContext.Provider>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith("http://localhost:3000/whiteboards", {"credentials": "include"});
  });

  it('opens the modal to create a new whiteboard', async () => {
    const { getByText, getByRole } = render(
      <AuthContext.Provider value={{ isLoggedIn: true, currentUser: { username: 'testUser' } }}>
        <DashboardComponent />
      </AuthContext.Provider>
    );

    fireEvent.click(getByText('CREATE WHITEBOARD'));
    expect(getByRole('dialog')).toBeInTheDocument();
    expect(getByText('Create a new whiteboard')).toBeInTheDocument();
  });

  // Add more tests as needed
});