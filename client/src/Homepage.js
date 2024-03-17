import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Homepage() {
    const [whiteboards, setWhiteboards] = useState([]);

    useEffect(() => {
        // Fetch the list of whiteboards from the backend
        // For now, we're using static data
        setWhiteboards([{ id: 1, name: 'Whiteboard 1' }, { id: 2, name: 'Whiteboard 2' }]);
    }, []);

    const createWhiteboard = () => {
        // Logic to create a new whiteboard
        // This would typically involve a backend service
        const newWhiteboard = { id: whiteboards.length + 1, name: `Whiteboard ${whiteboards.length + 1}` };
        setWhiteboards([...whiteboards, newWhiteboard]);
        // You might want to navigate the user to the new whiteboard page
    };

    return (
        <div>
            <h1>My Whiteboards</h1>
            <button onClick={createWhiteboard}>Create a New Whiteboard</button>
            <ul>
                {whiteboards.map((board) => (
                    <li key={board.id}>
                        <Link to={`/whiteboard/${board.id}`}>{board.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Homepage;