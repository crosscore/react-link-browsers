// src/App.tsx
import React, { useEffect, useState } from "react";

const WEBSOCKET_URL = "ws://localhost:8080";

const App = () => {
  const [circle, setCircle] = useState({ x: 0, y: 0, radius: 0, visible: false });

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "windowInfo", data: { innerWidth: window.innerWidth } }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "updateCircle") {
        const { x, y, radius } = message.data;
        setCircle({ x, y, radius, visible: x >= 0 });
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="App" style={{ position: "relative", height: "100vh" }}>
      {circle.visible && (
        <div
          style={{
            width: `${circle.radius * 2}px`,
            height: `${circle.radius * 2}px`,
            borderRadius: "50%",
            backgroundColor: "#47b0dc",
            position: "absolute",
            left: `${circle.x}px`,
            top: `${circle.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        ></div>
      )}
    </div>
  );
};

export default App;
