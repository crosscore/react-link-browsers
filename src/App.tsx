// src/App.tsx
import React, { useEffect, useState, useRef } from "react";

const WEBSOCKET_URL = "ws://localhost:8080";

const App = () => {
  const [circle, setCircle] = useState({ x: 0, y: 0, radius: 0, visible: false });
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(WEBSOCKET_URL);

      if (ws.current) {
        ws.current.onopen = () => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: "windowInfo", data: { innerWidth: window.innerWidth } }));
          }
        };
        ws.current.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === "updateCircle") {
            const { x, y, radius } = message.data;
            setCircle({ x, y, radius, visible: x + radius > 0 });
          }
        };
        ws.current.onclose = () => {
          console.log("WebSocket connection closed.");
        };
      }
    };

    setTimeout(connectWebSocket, 1);

    const handleResize = () => {
      const widthInfo = JSON.stringify({ type: "windowInfo", data: { innerWidth: window.innerWidth } });
      ws.current?.send(widthInfo);
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      ws.current?.close();
    };
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
