// src/App.tsx
import React, { useEffect, useState, useRef } from "react";

interface Circle {
  x: number;
  y: number;
  color: string;
};

const WEBSOCKET_URL = "ws://localhost:8080";

const App: React.FC = () => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(WEBSOCKET_URL);
      if (ws.current) {
        ws.current.onopen = () => {
          console.log("Connected to the server");
          sendWindowInfo();
          window.addEventListener("resize", sendWindowInfo);
        };
        ws.current.onerror = (error) => {
          console.error("WebSocket Error:", error);
        };
        ws.current.onclose = () => {
          console.log("WebSocket Connection Closed");
        };
        ws.current.onmessage = (event) => {
          const message = JSON.parse(event.data);
          const newCircles = message.map((circle: Circle, index: number) => ({
            x: circle.x,
            y: circle.y + window.innerHeight / 2,
            color: circle.color,
          }));
          setCircles(newCircles);
        };
      }
    };

    const sendWindowInfo = () => {
      const windowInfo = {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      };
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({ type: "windowInfo", data: windowInfo })
        );
      }
    };

    setTimeout(connectWebSocket, 1);

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      window.removeEventListener("resize", sendWindowInfo);
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <svg width="100vw" height="100vh">
        {circles.map((circle, index) => (
          <circle
            key={index}
            cx={circle.x}
            cy={circle.y}
            r={100}
            fill={circle.color}
          />
        ))}
      </svg>
    </div>
  );
};

export default App;
