// src/App.tsx
import React, { useEffect, useState } from 'react';

const WEBSOCKET_URL = "ws://localhost:8080";

const App = () => {
  const [circle, setCircle] = useState({ x: 0, y: 0, visible: false });

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => { // when the connection is established successfully
      ws.send(JSON.stringify({ type: 'windowInfo', data: { innerWidth: window.innerWidth } }));
    };

    ws.onmessage = (event) => { // when the client receives a message from the server
      const message = JSON.parse(event.data);
      if (message.type === 'updateCircle') {
        const { x, y } = message.data;
        setCircle({ x, y, visible: x >= 0 }); // when x is negative, the circle is hidden
      }
    };

    return () => { // when the component is unmounted or the connection is closed
      ws.close();
    };
  }, []);

  return (
    <div className="App" style={{ position: 'relative', height: '100vh' }}>
      {circle.visible && (
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: 'blue',
          position: 'absolute',
          left: `${circle.x}px`,
          top: `${circle.y}px`,
          transform: 'translate(-50%, -50%)',
        }}></div>
      )}
    </div>
  );
};

export default App;
