import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import Whiteboard from './Whiteboard';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <h1>Real-Time Whiteboard Collaborator</h1>
        <Whiteboard />
      </div>
    </Provider>
  );
}

export default App;